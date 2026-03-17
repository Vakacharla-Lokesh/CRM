import Lead from "../modules/leads/models/leadModel.js";

export async function seedLeads(tenants, users, organizations) {
  // Clear existing leads
  await Lead.deleteMany({});

  const allLeads = [];
  const sources = [
    "API",
    "Outsource",
    "Phone",
    "Website",
    "Facebook Ads",
    "Google Ads",
    "Instagram",
    "LinkedIn",
    "Email Marketing",
    "Referral",
    "Cold Call",
    "WhatsApp",
  ];
  const statuses = ["New", "Converted", "Dead", "Follow-Up"];
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emma",
    "Robert",
    "Lisa",
    "James",
    "Mary",
    "William",
    "Patricia",
    "Richard",
    "Jennifer",
    "Joseph",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
  ];

  for (const tenant of tenants) {
    const tenantUsers = users.filter(
      (u) => u.tenantId.toString() === tenant._id.toString(),
    );
    const tenantOrgs = organizations.filter(
      (o) => o.tenantId.toString() === tenant._id.toString(),
    );

    if (tenantUsers.length === 0 || tenantOrgs.length === 0) continue; // Skip if missing data

    // Create 30-50 leads per tenant
    const numLeads = 30 + Math.floor(Math.random() * 21);
    const tenantLeads = [];

    for (let i = 0; i < numLeads; i++) {
      const randomUser =
        tenantUsers[Math.floor(Math.random() * tenantUsers.length)];
      const randomOrg =
        tenantOrgs[Math.floor(Math.random() * tenantOrgs.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      tenantLeads.push({
        tenantId: tenant._id,
        userId: randomUser._id,
        organizationId: randomOrg._id,
        firstName: firstName,
        lastName: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        source: randomSource,
        score: Math.floor(Math.random() * 100),
        status: randomStatus,
        // idempotencyKey is omitted - it's optional for seeding
      });
    }

    const created = await Lead.insertMany(tenantLeads);
    allLeads.push(...created);
  }

  return allLeads;
}
