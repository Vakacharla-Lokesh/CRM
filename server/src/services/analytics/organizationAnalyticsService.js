import organizationModel from "../../models/organizationModel.js";

export const getOrganizationStats = async (filter) => {
  return organizationModel.aggregate(
    [
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
          _id: "$industry",
          organizationCount: { $sum: 1 },
          totalSize: { $sum: "$size" },
          avgSize: { $avg: "$size" },
          totalLeads: { $sum: { $size: "$leads" } },
          convertedLeads: {
            $sum: {
              $size: {
                $filter: {
                  input: "$leads",
                  as: "lead",
                  cond: { $eq: ["$$lead.status", "Converted"] },
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
    ],
    { readPreference: "secondaryPreferred" },
  );
};

export const getTopOrganizations = async (filter, limit = 10) => {
  return organizationModel.aggregate(
    [
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
          name: 1,
          industry: 1,
          size: 1,
          totalLeads: { $size: "$leads" },
          convertedLeads: {
            $size: {
              $filter: {
                input: "$leads",
                as: "l",
                cond: { $eq: ["$$l.status", "Converted"] },
              },
            },
          },
          totalDeals: { $size: "$deals" },
          totalDealValue: { $sum: "$deals.value" },
          wonDealValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$deals",
                    as: "d",
                    cond: { $eq: ["$$d.status", "Won"] },
                  },
                },
                as: "wd",
                in: "$$wd.value",
              },
            },
          },
        },
      },
      { $sort: { totalDealValue: -1 } },
      { $limit: limit },
    ],
    { readPreference: "secondaryPreferred" },
  );
};
