import Deal from "../models/dealModel.js";

export async function seedDeals(tenants, users, leads, organizations) {
  // Clear existing deals
  await Deal.deleteMany({});

  const allDeals = [];
  const dealStatuses = [
    "Prospecting",
    "Qualification",
    "Negotiation",
    "Ready to close",
    "Won",
    "Lost",
  ];
  const dealNames = [
    "Q1 Licensing Agreement",
    "Enterprise Support Contract",
    "Custom Development",
    "SaaS Annual Subscription",
    "Implementation Services",
    "Training & Onboarding",
    "Premium Support Package",
    "API Integration",
  ];

  for (const tenant of tenants) {
    const tenantUsers = users.filter(
      (u) => u.tenantId.toString() === tenant._id.toString(),
    );
    const tenantLeads = leads.filter(
      (l) => l.tenantId.toString() === tenant._id.toString(),
    );
    const tenantOrgs = organizations.filter(
      (o) => o.tenantId.toString() === tenant._id.toString(),
    );

    if (
      tenantUsers.length === 0 ||
      tenantLeads.length === 0 ||
      tenantOrgs.length === 0
    ) {
      continue; // Skip if missing data
    }

    // Create 1-3 deals per 5 leads (realistic conversion ratio)
    const numDeals =
      Math.floor(tenantLeads.length / 5) + Math.floor(Math.random() * 5);
    const tenantDeals = [];

    for (let i = 0; i < Math.min(numDeals, tenantLeads.length); i++) {
      const randomLead =
        tenantLeads[Math.floor(Math.random() * tenantLeads.length)];
      const randomOrg =
        tenantOrgs[Math.floor(Math.random() * tenantOrgs.length)];
      const randomUser =
        tenantUsers[Math.floor(Math.random() * tenantUsers.length)];
      const randomStatus =
        dealStatuses[Math.floor(Math.random() * dealStatuses.length)];

      tenantDeals.push({
        tenantId: tenant._id,
        leadId: randomLead._id,
        organizationId: randomOrg._id,
        userId: randomUser._id,
        dealName: `${dealNames[i % dealNames.length]} - ${randomOrg.organizationName}`,
        dealValue: (Math.floor(Math.random() * 100) + 10) * 1000, // $10k - $110k
        dealStatus: randomStatus,
        // idempotencyKey is omitted - it's optional for seeding
      });
    }

    const created = await Deal.insertMany(tenantDeals);
    allDeals.push(...created);
  }

  return allDeals;
}
