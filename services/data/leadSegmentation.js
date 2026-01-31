// services/leadSegmentation.js

/**
 * Build segment statistics from leads
 * Segments are defined by lead_status and organization_industry
 * @param {Array} leads - Array of lead objects from IndexedDB
 * @returns {Map} Map with segmentId as key, {count, avgScore} as value
 */
export function buildSegmentMap(leads) {
  const segmentMap = new Map();

  if (!leads || leads.length === 0) {
    return segmentMap;
  }

  // First pass: group leads by segment and collect scores
  const segmentData = {}; // Temporary object to collect data

  leads.forEach((lead) => {
    // Create a segment ID based on status and industry
    // You can customize this based on your business logic
    const segmentId = `${lead.lead_status || "unknown"}_${lead.organization_industry || "unknown"}`;

    if (!segmentData[segmentId]) {
      segmentData[segmentId] = {
        leads: [],
        count: 0,
        totalScore: 0,
      };
    }

    segmentData[segmentId].leads.push(lead);
    segmentData[segmentId].count += 1;
    segmentData[segmentId].totalScore += lead.lead_score || lead.score || 0;
  });

  // Second pass: convert to Map with calculated averages
  Object.entries(segmentData).forEach(([segmentId, data]) => {
    const avgScore =
      data.count > 0 ? Math.round(data.totalScore / data.count) : 0;

    segmentMap.set(segmentId, {
      count: data.count,
      avgScore: avgScore,
      totalScore: data.totalScore,
      leads: data.leads, // Optional: store reference to leads
    });
  });

  return segmentMap;
}

/**
 * Get segment map organized by status only (simpler view)
 * @param {Array} leads - Array of lead objects
 * @returns {Map} Map with lead_status as key
 */
export function buildStatusSegmentMap(leads) {
  const statusMap = new Map();

  if (!leads || leads.length === 0) {
    return statusMap;
  }

  leads.forEach((lead) => {
    const status = lead.lead_status || "New";

    if (!statusMap.has(status)) {
      statusMap.set(status, {
        count: 0,
        avgScore: 0,
        totalScore: 0,
        leads: [],
      });
    }

    const statusData = statusMap.get(status);
    statusData.count += 1;
    statusData.totalScore += lead.lead_score || lead.score || 0;
    statusData.leads.push(lead);

    // Recalculate average
    statusData.avgScore = Math.round(statusData.totalScore / statusData.count);
  });

  return statusMap;
}

/**
 * Get segment map organized by industry only
 * @param {Array} leads - Array of lead objects
 * @returns {Map} Map with organization_industry as key
 */
export function buildIndustrySegmentMap(leads) {
  const industryMap = new Map();

  if (!leads || leads.length === 0) {
    return industryMap;
  }

  leads.forEach((lead) => {
    const industry = lead.organization_industry || "Other";

    if (!industryMap.has(industry)) {
      industryMap.set(industry, {
        count: 0,
        avgScore: 0,
        totalScore: 0,
        leads: [],
      });
    }

    const industryData = industryMap.get(industry);
    industryData.count += 1;
    industryData.totalScore += lead.lead_score || lead.score || 0;
    industryData.leads.push(lead);

    // Recalculate average
    industryData.avgScore = Math.round(
      industryData.totalScore / industryData.count,
    );
  });

  return industryMap;
}

/**
 * Convert Map to array format for easy display
 * Useful for rendering in UI
 * @param {Map} segmentMap - The segment map
 * @returns {Array} Array of {segmentId, count, avgScore}
 */
export function mapToArray(segmentMap) {
  const result = [];

  segmentMap.forEach((value, key) => {
    result.push({
      segmentId: key,
      count: value.count,
      avgScore: value.avgScore,
      totalScore: value.totalScore,
    });
  });

  return result;
}

/**
 * Sort segments by count (highest first)
 * @param {Map} segmentMap - The segment map
 * @returns {Map} Sorted map
 */
export function sortSegmentsByCount(segmentMap) {
  const sorted = new Map(
    [...segmentMap.entries()].sort((a, b) => b[1].count - a[1].count),
  );
  return sorted;
}

/**
 * Sort segments by average score (highest first)
 * @param {Map} segmentMap - The segment map
 * @returns {Map} Sorted map
 */
export function sortSegmentsByScore(segmentMap) {
  const sorted = new Map(
    [...segmentMap.entries()].sort((a, b) => b[1].avgScore - a[1].avgScore),
  );
  return sorted;
}

/**
 * Get top N segments by count
 * @param {Map} segmentMap - The segment map
 * @param {number} limit - Number of segments to return
 * @returns {Map} Top N segments
 */
export function getTopSegments(segmentMap, limit = 5) {
  const sorted = sortSegmentsByCount(segmentMap);
  const top = new Map([...sorted.entries()].slice(0, limit));
  return top;
}
