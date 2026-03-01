import Organization from "../models/organizationModel.js";

export async function seedOrganizations(tenants, users) {
  // Clear existing organizations
  await Organization.deleteMany({});

  const allOrganizations = [];
  const industries = ["Software", "Textile", "Foods", "Others"];
  const cities = [
    "New York",
    "San Francisco",
    "London",
    "Berlin",
    "Tokyo",
    "Mumbai",
    "Sydney",
    "Toronto",
  ];
  const countries = [
    "USA",
    "UK",
    "Germany",
    "Japan",
    "India",
    "Australia",
    "Canada",
  ];
  const orgNames = [
    "Acme Corp",
    "TechWare Solutions",
    "Global Dynamics",
    "Innovate Industries",
    "Enterprise Systems",
    "CloudFirst Tech",
    "DataViz Pro",
    "SecureNet",
  ];

  for (const tenant of tenants) {
    const tenantUsers = users.filter(
      (u) =>
        u.tenantId.toString() === tenant._id.toString() && u.role === "user",
    );

    if (tenantUsers.length === 0) continue; // Skip if no users in tenant

    // Create 5-7 organizations per tenant
    const numOrgs = 5 + Math.floor(Math.random() * 3);
    const tenantOrgs = [];

    for (let i = 0; i < numOrgs; i++) {
      const randomUser =
        tenantUsers[Math.floor(Math.random() * tenantUsers.length)];
      const orgName = `${orgNames[i % orgNames.length]} - ${tenant.tenantName.substring(0, 3)}`;
      const city = cities[Math.floor(Math.random() * cities.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];

      tenantOrgs.push({
        tenantId: tenant._id,
        userId: randomUser._id,
        organizationName: orgName,
        organizationSize: Math.floor(Math.random() * 5000) + 50,
        organizationWebsite: `https://${orgName.toLowerCase().replace(/\s+/g, "")}.com`,
        organizationIndustry:
          industries[Math.floor(Math.random() * industries.length)],
        city: city,
        country: country,
      });
    }

    const created = await Organization.insertMany(tenantOrgs);
    allOrganizations.push(...created);
  }

  return allOrganizations;
}
