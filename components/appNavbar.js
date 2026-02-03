import { populateLeadsTable } from "../controllers/populateLeads.js";
import { eventBus, EVENTS } from "../events/eventBus.js";

const template = document.createElement("template");
template.innerHTML = `
  <nav
        class="fixed top-0 left-0 z-50 h-16 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <div
          class="mx-auto max-w-7xl flex items-center justify-between px-4 h-full"
        >
          <a
            href="/"
            class="flex items-center gap-2"
          >
            <img
              src="../public/crm.png"
              alt="Logo"
              class="h-7"
            />
            <span class="text-lg font-semibold">Campaign Flux</span>
          </a>

          <div class="flex items-center gap-3">
            <button
              type="button"
              id="stress-test-btn"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
            >
              Stress Test
            </button>
            <button
              type="button"
              id="diagnostic-btn"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
            >
              Test Diagnostic
            </button>
            <div class="flex items-center gap-2">
              <div
                id="status-short-polling"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs"
              >
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>SPS</span>
              </div>
              <div
                id="status-long-polling"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs"
              >
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>LPS</span>
              </div>
              <div
                id="status-wss"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs"
              >
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>WSS</span>
              </div>
              <div
                id="status-sse"
                class="flex items-center gap-1 px-2 py-1 rounded text-xs"
              >
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>SSE</span>
              </div>
            </div>

            <!-- Notification Dropdown -->
            <div class="relative">
              <button
                id="notification-btn"
                type="button"
                class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span
                  id="notification-badge"
                  class="hidden absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                ></span>
              </button>

              <!-- Dropdown Menu -->
              <div
                id="notification-dropdown"
                class="hidden absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden"
              >
                <div
                  class="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
                >
                  <h3 class="font-semibold">Notifications</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    WebSocket Updates
                  </p>
                </div>
                <div
                  id="notification-list"
                  class="overflow-y-auto max-h-80"
                >
                  <div
                    class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    No notifications yet
                  </div>
                </div>
                <div
                  class="px-4 py-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <button
                    id="clear-notifications"
                    class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
`;

class AppNavbar extends HTMLElement {
  constructor() {
    super();
    this.isStressTestActive = false;
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.themeToggle = document.getElementById("theme-toggle");
    if (this.themeToggle) {
      this.themeToggle.addEventListener(
        "click",
        this.handleThemeToggle.bind(this),
      );
    }

    this.diagnosticBtn = document.querySelector("#diagnostic-btn");
    if (this.diagnosticBtn) {
      this.diagnosticBtn.addEventListener(
        "click",
        this.runTaskDiagnostics.bind(this),
      );
    }

    this.stressTestBtn = document.querySelector("#stress-test-btn");
    if (this.stressTestBtn) {
      this.stressTestBtn.addEventListener(
        "click",
        this.toggleStressTest.bind(this),
      );
    }
  }

  handleDbCreate() {
    if (window.dbWorker) {
      window.dbWorker.postMessage({ action: "initialize" });
    }
  }

  toggleStressTest() {
    if (this.isStressTestActive) {
      this.clearStressTest();
    } else {
      this.runStressTest();
    }
  }

  runTaskDiagnostics() {
    console.log("0 Synchronous: start");

    // Microtask
    Promise.resolve().then(() => {
      console.log("3 Microtask: Promise.then");
    });

    // Macrotask
    setTimeout(() => {
      console.log("4 Macrotask: setTimeout");
    }, 0);

    // Microtask
    queueMicrotask(() => {
      console.log("2 Microtask: queueMicrotask");
    });

    console.log("1 Synchronous: end");
  }

  async runStressTest() {
    console.log("Starting stress test mode...");
    const tempLeads = await this.generateRandomLeads(1000);

    console.log(`Generated ${tempLeads.length} temporary leads`);
    console.log("Populating table with stress test data...");
    populateLeadsTable(tempLeads);

    console.timeEnd("Stress Test Execution");

    window.stressTestLeads = tempLeads;
    window.stressTestActive = true;
    this.isStressTestActive = true;

    // Update button text
    if (this.stressTestBtn) {
      this.stressTestBtn.textContent = "Clear Stress Test";
      this.stressTestBtn.classList.remove("bg-blue-600", "hover:bg-blue-700", "dark:bg-blue-500", "dark:hover:bg-blue-600");
      this.stressTestBtn.classList.add("bg-red-600", "hover:bg-red-700", "dark:bg-red-500", "dark:hover:bg-red-600");
    }
  }

  async generateRandomLeads(count) {
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
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const companyName =
        companies[Math.floor(Math.random() * companies.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const industry =
        industries[Math.floor(Math.random() * industries.length)];

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

  clearStressTest() {
    if (window.stressTestActive || this.isStressTestActive) {
      console.log("Clearing stress test");
      if (window.stressTestLeads) {
        window.stressTestLeads.length = 0;
        window.stressTestLeads = null;
      }
      
      window.stressTestActive = false;
      this.isStressTestActive = false;
      if (this.stressTestBtn) {
        this.stressTestBtn.textContent = "Stress Test";
        this.stressTestBtn.classList.remove("bg-red-600", "hover:bg-red-700", "dark:bg-red-500", "dark:hover:bg-red-600");
        this.stressTestBtn.classList.add("bg-blue-600", "hover:bg-blue-700", "dark:bg-blue-500", "dark:hover:bg-blue-600");
      }
      eventBus.emit(EVENTS.LEADS_REFRESH);

      console.log("Stress test cleared - memory should be freed");
    }
  }
}

customElements.define("app-navbar", AppNavbar);
