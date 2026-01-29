export function populateHome(data) {
  // console.log("Inside populate home fn ...", data);
  // let totalLeads = document.querySelector("#data-total-leads");
  // totalLeads.textContent = data.lead_count;

  // let dealsWon = document.querySelector("#data-won-deals");
  // dealsWon.textContent = data.deals_won || 0;

  // let dealsOngoing = document.querySelector("#data-ongoing-leads");
  // dealsOngoing.textContent = data.deals_ongoing;

  // let dealValueWon = document.querySelector("#data-won-deals-value");
  // dealValueWon.textContent = `$ ${data.deal_value_won}`;

  // let avgDealValue = document.querySelector("#data-avg-deals-value");
  // avgDealValue.textContent = `$ ${data.avg_deal_value}`;

  const template = `
  <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
    <p class="text-sm text-neutral-500 dark:text-neutral-400">
      Total Leads
    </p>
    <p
      id="data-total-leads"
      class="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white"
    >
      ${data.lead_count}
    </p>
  </div>

  <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
    <p class="text-sm text-neutral-500 dark:text-neutral-400">
      Ongoing Deals
    </p>
    <p
      id="data-ongoing-leads"
      class="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white"
    >
      ${data.deals_ongoing}
    </p>
  </div>

  <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
    <p class="text-sm text-neutral-500 dark:text-neutral-400">
      Won Deals
    </p>
    <p
      id="data-won-deals"
      class="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white"
    >
      ${data.deals_won || 0}
    </p>
  </div>

  <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
    <p class="text-sm text-neutral-500 dark:text-neutral-400">
      Deal Value Won
    </p>
    <p
      id="data-won-deals-value"
      class="mt-4 text-3xl font-semibold text-emerald-600 dark:text-emerald-400"
    >
      $ ${data.deal_value_won}
    </p>
  </div>

  <div class="flex flex-col justify-between rounded-xl bg-white dark:bg-neutral-800 p-6 shadow">
    <p class="text-sm text-neutral-500 dark:text-neutral-400">
      Avg Deal Value
    </p>
    <p
      id="data-avg-deals-value"
      class="mt-4 text-3xl font-semibold text-indigo-600 dark:text-indigo-400"
    >
      $ ${data.avg_deal_value || 0}
    </p>
  </div>
`;

  let homeFields = document.querySelector("#data-home-fields");
  homeFields.innerHTML = template;
}
