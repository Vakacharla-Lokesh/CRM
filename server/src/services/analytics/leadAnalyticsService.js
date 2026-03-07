export const getLeadTrends = async (filter, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await leadModel.aggregate(
    [
      {
        $match: {
          ...filter,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          total: { $sum: "$count" },
          byStatus: {
            $push: { status: "$_id.status", count: "$count" },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total: 1,
          byStatus: 1,
        },
      },
    ],
    { readPreference: "secondaryPreferred" },
  );

  return trends;
};

export const getLeadStatusBreakdown = async (filter, days) => {
  const matchFilter =
    days !== null
      ? {
          ...filter,
          createdAt: { $gte: new Date(Date.now() - days * 864e5) },
        }
      : { ...filter };

  const breakdown = await leadModel.aggregate(
    [
      { $match: matchFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          avgScore: { $round: ["$avgScore", 1] },
        },
      },
      { $sort: { count: -1 } },
    ],
    { readPreference: "secondaryPreferred" },
  );

  const total = breakdown.reduce((sum, b) => sum + b.count, 0);

  const enriched = breakdown.map((b) => ({
    ...b,
    percentage:
      total > 0 ? parseFloat(((b.count / total) * 100).toFixed(1)) : 0,
  }));

  return { breakdown: enriched, total };
};

export const getLeadScoreDistribution = async (filter) => {
  return leadModel.aggregate(
    [
      { $match: filter },
      {
        $bucket: {
          groupBy: "$score",
          boundaries: [0, 20, 40, 60, 80, 101],
          default: "Unknown",
          output: {
            count: { $sum: 1 },
            leads: { $push: { status: "$status" } },
          },
        },
      },
      {
        $project: {
          _id: 0,
          range: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0-19" },
                { case: { $eq: ["$_id", 20] }, then: "20-39" },
                { case: { $eq: ["$_id", 40] }, then: "40-59" },
                { case: { $eq: ["$_id", 60] }, then: "60-79" },
                { case: { $eq: ["$_id", 80] }, then: "80-100" },
              ],
              default: "Unknown",
            },
          },
          count: 1,
          convertedCount: {
            $size: {
              $filter: {
                input: "$leads",
                as: "l",
                cond: { $eq: ["$$l.status", "Converted"] },
              },
            },
          },
        },
      },
    ],
    { readPreference: "secondaryPreferred" },
  );
};
