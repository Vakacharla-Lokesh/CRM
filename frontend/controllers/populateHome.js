export function populateHome(data) {
  const template = `
  <div class="w-full h-full md:h-1/2 lg:h-1/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
      <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Leads</p>
      <p id="data-total-leads" class="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">
        ${data.lead_count}
      </p>
    </div>

    <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
      <p class="text-sm text-neutral-500 dark:text-neutral-400">Ongoing Deals</p>
      <p id="data-ongoing-leads" class="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">
        ${data.deals_ongoing}
      </p>
    </div>

    <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
      <p class="text-sm text-neutral-500 dark:text-neutral-400">Won Deals</p>
      <p id="data-won-deals" class="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white">
        ${data.deals_won || 0}
      </p>
    </div>

    <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
      <p class="text-sm text-neutral-500 dark:text-neutral-400">Deal Value Won</p>
      <p id="data-won-deals-value" class="mt-4 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
        $ ${data.deal_value_won}
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Status Segments -->
    <div class="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Leads by Status</h3>
      <div id="status-segments-container" class="space-y-3">
        ${renderStatusSegments(data.statusSegments)}
      </div>
    </div>

    <div class="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Leads by Industry</h3>
      <div id="industry-segments-container" class="space-y-3">
        ${renderIndustrySegments(data.industrySegments)}
      </div>
    </div>
  </div>
  `;

  let homeFields = document.querySelector("#data-home-fields");
  if (homeFields) {
    homeFields.innerHTML = template;
  }
}

function renderStatusSegments(statusSegments) {
  if (!statusSegments || statusSegments.length === 0) {
    return '<p class="text-neutral-500 dark:text-neutral-400">No data available</p>';
  }

  const maxCount = Math.max(...statusSegments.map((s) => s.count));

  return statusSegments
    .map((segment) => {
      const percentage = (segment.count / maxCount) * 100;
      const statusColors = {
        New: "bg-blue-500",
        "Follow-Up": "bg-orange-500",
        Converted: "bg-green-500",
        Dead: "bg-red-500",
      };
      const color =
        statusColors[segment.segmentId.split("_")[0]] || "bg-gray-500";

      return `
        <div class="border-b border-neutral-200 dark:border-neutral-700 pb-3 last:border-b-0">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-neutral-900 dark:text-white">
              ${segment.segmentId}
            </span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              ${segment.count} leads
            </span>
          </div>
          <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
            <div class="${color} h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
          </div>
          <div class="flex justify-between items-center mt-1">
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              Avg Score: <strong>${segment.avgScore}</strong>
            </span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              ${percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderIndustrySegments(industrySegments) {
  if (!industrySegments || industrySegments.length === 0) {
    return '<p class="text-neutral-500 dark:text-neutral-400">No data available</p>';
  }
  const maxCount = Math.max(...industrySegments.map((s) => s.count));

  return industrySegments
    .map((segment, index) => {
      const percentage = (segment.count / maxCount) * 100;
      const colors = [
        "bg-purple-500",
        "bg-indigo-500",
        "bg-pink-500",
        "bg-cyan-500",
        "bg-teal-500",
      ];
      const color = colors[index % colors.length];

      return `
        <div class="border-b border-neutral-200 dark:border-neutral-700 pb-3 last:border-b-0">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-neutral-900 dark:text-white">
              ${segment.segmentId}
            </span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              ${segment.count} leads
            </span>
          </div>
          <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
            <div class="${color} h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
          </div>
          <div class="flex justify-between items-center mt-1">
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              Avg Score: <strong>${segment.avgScore}</strong>
            </span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              ${percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      `;
    })
    .join("");
}
