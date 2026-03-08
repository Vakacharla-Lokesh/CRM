import dealModel from "../../models/dealModel.js";

export const getDealPipeline = async (filter) => {
  const [pipeline, trends] = await Promise.all([
    dealModel.aggregate(
      [
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalValue: { $sum: "$value" },
            avgValue: { $avg: "$value" },
          },
        },
        {
          $project: {
            _id: 0,
            stage: "$_id",
            count: 1,
            totalValue: 1,
            avgValue: { $round: ["$avgValue", 2] },
          },
        },
        { $sort: { totalValue: -1 } },
      ],
      { readPreference: "secondaryPreferred" },
    ),

    dealModel.aggregate(
      [
        {
          $match: {
            ...filter,
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
            totalValue: { $sum: "$value" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            count: 1,
            totalValue: 1,
          },
        },
      ],
      { readPreference: "secondaryPreferred" },
    ),
  ]);

  const totalPipelineValue = pipeline.reduce((s, p) => s + p.totalValue, 0);
  const totalDeals = pipeline.reduce((s, p) => s + p.count, 0);

  const enrichedPipeline = pipeline.map((p) => ({
    ...p,
    percentage:
      totalPipelineValue > 0
        ? parseFloat(((p.totalValue / totalPipelineValue) * 100).toFixed(1))
        : 0,
  }));

  return {
    pipeline: enrichedPipeline,
    trends,
    summary: {
      totalPipelineValue,
      totalDeals,
      avgDealValue:
        totalDeals > 0
          ? parseFloat((totalPipelineValue / totalDeals).toFixed(2))
          : 0,
    },
  };
};

export const getDealTrends = async (filter, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return dealModel.aggregate(
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
          value: { $sum: "$value" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalDeals: { $sum: "$count" },
          totalValue: { $sum: "$value" },
          byStatus: {
            $push: {
              status: "$_id.status",
              count: "$count",
              value: "$value",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalDeals: 1,
          totalValue: 1,
          byStatus: 1,
        },
      },
    ],
    { readPreference: "secondaryPreferred" },
  );
};
