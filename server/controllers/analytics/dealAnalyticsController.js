import dealModel from "../models/dealModel.js";

export const getDealPipeline = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const [pipeline, trends] = await Promise.all([
      dealModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$dealStatus",
            count: { $sum: 1 },
            totalValue: { $sum: "$dealValue" },
            avgValue: { $avg: "$dealValue" },
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
      ]),

      dealModel.aggregate([
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
            totalValue: { $sum: "$dealValue" },
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
      ]),
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

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
};

export const getDealTrends = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const days = Math.min(parseInt(req.query.days ?? "30"), 90);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await dealModel.aggregate([
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
            status: "$dealStatus",
          },
          count: { $sum: 1 },
          value: { $sum: "$dealValue" },
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
    ]);

    res.json({ trends, days });
  } catch (err) {
    next(err);
  }
};
