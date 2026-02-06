export function buildSegmentMap(leads) {
  const segmentMap = new Map();

  if (!leads || leads.length === 0) {
    return segmentMap;
  }
  const segmentData = {};

  leads.forEach((lead) => {
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

  Object.entries(segmentData).forEach(([segmentId, data]) => {
    const avgScore =
      data.count > 0 ? Math.round(data.totalScore / data.count) : 0;

    segmentMap.set(segmentId, {
      count: data.count,
      avgScore: avgScore,
      totalScore: data.totalScore,
      leads: data.leads,
    });
  });

  return segmentMap;
}

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
    statusData.avgScore = Math.round(statusData.totalScore / statusData.count);
  });

  return statusMap;
}

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
    industryData.avgScore = Math.round(
      industryData.totalScore / industryData.count,
    );
  });

  return industryMap;
}

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

export function sortSegmentsByCount(segmentMap) {
  const sorted = new Map(
    [...segmentMap.entries()].sort((a, b) => b[1].count - a[1].count),
  );
  return sorted;
}

export function sortSegmentsByScore(segmentMap) {
  const sorted = new Map(
    [...segmentMap.entries()].sort((a, b) => b[1].avgScore - a[1].avgScore),
  );
  return sorted;
}

export function getTopSegments(segmentMap, limit = 5) {
  const sorted = sortSegmentsByCount(segmentMap);
  const top = new Map([...sorted.entries()].slice(0, limit));
  return top;
}
