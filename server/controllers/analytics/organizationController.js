export const getOrganizationStats = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const stats = await organizationModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "leads",
          localField: "_id",
          foreignField: "organizationId",
          as: "leads",
        },
      },
      {
        $group: {
          _id: "$organizationIndustry",
          organizationCount: { $sum: 1 },
          totalSize: { $sum: "$organizationSize" },
          avgSize: { $avg: "$organizationSize" },
          totalLeads: { $sum: { $size: "$leads" } },
          convertedLeads: {
            $sum: {
              $size: {
                $filter: {
                  input: "$leads",
                  as: "lead",
                  cond: { $eq: ["$$lead.leadStatus", "Converted"] },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          industry: "$_id",
          organizationCount: 1,
          totalSize: 1,
          avgSize: { $round: ["$avgSize", 0] },
          totalLeads: 1,
          convertedLeads: 1,
          conversionRate: {
            $cond: [
              { $gt: ["$totalLeads", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$convertedLeads", "$totalLeads"] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { organizationCount: -1 } },
    ]);

    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

export const getTopOrganizations = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const limit = Math.min(parseInt(req.query.limit ?? "10"), 25);

    const top = await organizationModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "leads",
          localField: "_id",
          foreignField: "organizationId",
          as: "leads",
        },
      },
      {
        $lookup: {
          from: "deals",
          localField: "_id",
          foreignField: "organizationId",
          as: "deals",
        },
      },
      {
        $project: {
          organizationName: 1,
          organizationIndustry: 1,
          organizationSize: 1,
          totalLeads: { $size: "$leads" },
          convertedLeads: {
            $size: {
              $filter: {
                input: "$leads",
                as: "l",
                cond: { $eq: ["$$l.leadStatus", "Converted"] },
              },
            },
          },
          totalDeals: { $size: "$deals" },
          totalDealValue: { $sum: "$deals.dealValue" },
          wonDealValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$deals",
                    as: "d",
                    cond: { $eq: ["$$d.dealStatus", "Won"] },
                  },
                },
                as: "wd",
                in: "$$wd.dealValue",
              },
            },
          },
        },
      },
      { $sort: { totalDealValue: -1 } },
      { $limit: limit },
    ]);

    res.json({ organizations: top });
  } catch (err) {
    next(err);
  }
};
