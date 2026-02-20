import leadModel from "../models/leadModel.js";
import dealModel from "../models/dealModel.js";
import organizationModel from "../models/organizationModel.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    
    // Get date range for comparison (default: last 30 days vs previous 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const previousEndDate = new Date(startDate);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - 30);

    // Total Leads Count (all time)
    const totalLeads = await leadModel.countDocuments(filter);
    
    // Leads in current period
    const currentPeriodLeads = await leadModel.countDocuments({
      ...filter,
      createdAt: { $gte: startDate, $lte: endDate },
    });
    
    // Leads in previous period
    const previousPeriodLeads = await leadModel.countDocuments({
      ...filter,
      createdAt: { $gte: previousStartDate, $lt: previousEndDate },
    });
    
    // Calculate leads change percentage
    const leadsChange = previousPeriodLeads > 0
      ? ((currentPeriodLeads - previousPeriodLeads) / previousPeriodLeads) * 100
      : 0;

    // Active Campaigns (mock data - replace with actual campaign model when available)
    // For now, we'll count unique lead sources as "campaigns"
    const campaignsData = await leadModel.aggregate([
      { $match: filter },
      { $group: { _id: "$leadSource" } },
      { $count: "total" },
    ]);
    const activeCampaigns = campaignsData.length > 0 ? campaignsData[0].total : 0;
    
    // Previous period campaigns
    const previousCampaignsData = await leadModel.aggregate([
      { 
        $match: { 
          ...filter,
          createdAt: { $gte: previousStartDate, $lt: previousEndDate }
        } 
      },
      { $group: { _id: "$leadSource" } },
      { $count: "total" },
    ]);
    const previousCampaigns = previousCampaignsData.length > 0 ? previousCampaignsData[0].total : 0;
    const campaignsChange = previousCampaigns > 0
      ? ((activeCampaigns - previousCampaigns) / previousCampaigns) * 100
      : 0;

    // Conversion Rate
    const convertedLeads = await leadModel.countDocuments({
      ...filter,
      leadStatus: "Converted",
    });
    
    const conversionRate = totalLeads > 0 
      ? (convertedLeads / totalLeads) * 100 
      : 0;
    
    // Previous period conversion rate
    const previousConvertedLeads = await leadModel.countDocuments({
      ...filter,
      leadStatus: "Converted",
      updatedAt: { $gte: previousStartDate, $lt: previousEndDate },
    });
    
    const previousConversionRate = previousPeriodLeads > 0
      ? (previousConvertedLeads / previousPeriodLeads) * 100
      : 0;
    
    const conversionRateChange = previousConversionRate > 0
      ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100
      : 0;

    // Revenue (from Won deals)
    const revenueData = await dealModel.aggregate([
      {
        $match: {
          ...filter,
          dealStatus: "Won",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$dealValue" },
        },
      },
    ]);
    
    const revenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Previous period revenue
    const previousRevenueData = await dealModel.aggregate([
      {
        $match: {
          ...filter,
          dealStatus: "Won",
          updatedAt: { $gte: previousStartDate, $lt: previousEndDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$dealValue" },
        },
      },
    ]);
    
    const previousRevenue = previousRevenueData.length > 0 ? previousRevenueData[0].total : 0;
    const revenueChange = previousRevenue > 0
      ? ((revenue - previousRevenue) / previousRevenue) * 100
      : 0;

    res.json({
      stats: {
        totalLeads,
        activeCampaigns,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        revenue,
      },
      changes: {
        leadsChange: parseFloat(leadsChange.toFixed(1)),
        campaignsChange: parseFloat(campaignsChange.toFixed(1)),
        conversionRateChange: parseFloat(conversionRateChange.toFixed(1)),
        revenueChange: parseFloat(revenueChange.toFixed(1)),
      },
      period: {
        startDate,
        endDate,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get lead trends over time
export const getLeadTrends = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await leadModel.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({ trends });
  } catch (err) {
    next(err);
  }
};

// Get deal pipeline analytics
export const getDealPipeline = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const pipeline = await dealModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$dealStatus",
          count: { $sum: 1 },
          totalValue: { $sum: "$dealValue" },
        },
      },
      {
        $sort: { totalValue: -1 },
      },
    ]);

    res.json({ pipeline });
  } catch (err) {
    next(err);
  }
};

// Get organization stats by industry
export const getOrganizationStats = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};

    const stats = await organizationModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$organizationIndustry",
          count: { $sum: 1 },
          totalSize: { $sum: "$organizationSize" },
          avgSize: { $avg: "$organizationSize" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Also get leads per organization industry
    const leadsPerIndustry = await leadModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },
      {
        $group: {
          _id: "$organization.organizationIndustry",
          leadCount: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ["$leadStatus", "Converted"] }, 1, 0] },
          },
        },
      },
    ]);

    // Merge the data
    const merged = stats.map((stat) => {
      const leadData = leadsPerIndustry.find((l) => l._id === stat._id) || {
        leadCount: 0,
        convertedLeads: 0,
      };
      return {
        industry: stat._id,
        organizationCount: stat.count,
        leadCount: leadData.leadCount,
        convertedLeads: leadData.convertedLeads,
        totalSize: stat.totalSize,
        avgSize: Math.round(stat.avgSize),
      };
    });

    res.json({ stats: merged });
  } catch (err) {
    next(err);
  }
};

// Get lead status breakdown
export const getLeadStatusBreakdown = async (req, res, next) => {
  try {
    const filter = req.tenantFilter || {};
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const breakdown = await leadModel.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$leadStatus",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({ breakdown });
  } catch (err) {
    next(err);
  }
};
