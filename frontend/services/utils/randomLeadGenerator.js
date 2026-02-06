export async function generateRandomLeads(count) {
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
    "Linda",
    "Thomas",
    "Barbara",
    "Charles",
    "Susan",
    "Christopher",
    "Jessica",
    "Daniel",
    "Karen",
    "Matthew",
    "Nancy",
    "Anthony",
    "Betty",
    "Mark",
    "Margaret",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
    "Young",
    "Allen",
    "King",
  ];

  const companies = [
    "TechCorp",
    "InnovateSoft",
    "DataDrive",
    "CloudNine",
    "WebWorks",
    "ByteForce",
    "PixelPerfect",
    "CodeCraft",
    "AppFlow",
    "DevHub",
    "NetWave",
    "VisionAI",
    "SmartScale",
    "FastTrack",
    "GrowthZone",
    "DigitalEdge",
    "NextGen",
    "PowerUp",
    "SwiftCode",
    "BrightPath",
    "EchoSys",
    "FusionLab",
    "PrimeNet",
    "VelocityCloud",
    "ZenithData",
  ];

  const domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "company.com",
    "business.net",
  ];

  const sources = ["API", "Manual", "Import", "Form", "CSV"];
  const statuses = ["New", "Follow-Up", "Converted", "Dead"];
  const industries = ["Software", "Foods", "Textile", "Others"];

  const leads = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const companyName = companies[Math.floor(Math.random() * companies.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];

    const lead = {
      lead_id: `stress_test_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lead_first_name: firstName,
      lead_last_name: lastName,
      lead_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domain}`,
      lead_mobile_number: `9${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0")}`,
      organization_id: `org_${Math.floor(i / 10)}`,
      organization_name: companyName,
      organization_industry: industry,
      organization_size: Math.floor(Math.random() * 500) + 10,
      lead_source: source,
      lead_score: Math.floor(Math.random() * 100),
      lead_status: status,
      score: Math.floor(Math.random() * 100),
      created_on: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ),
      modified_on: new Date(),
      user_id: "stress_test_user",
      tenant_id: "stress_test_tenant",
      comment_ids: [],
      call_ids: [],
    };

    leads.push(lead);
  }

  return leads;
}
