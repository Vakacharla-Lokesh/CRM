export function populateHome(data) {
  // console.log("Inside populate home fn ...", data);
  let totalLeads = document.querySelector("#data-total-leads");
  totalLeads.textContent = data.lead_count;

  let dealsWon = document.querySelector("#data-won-deals");
  dealsWon.textContent = data.deals_won || 0;

  let dealsOngoing = document.querySelector("#data-ongoing-leads");
  dealsOngoing.textContent = data.deals_ongoing;

  let dealValueWon = document.querySelector("#data-won-deals-value");
  dealValueWon.textContent = `$ ${data.deal_value_won}`;

  let avgDealValue = document.querySelector("#data-avg-deals-value");
  avgDealValue.textContent = `$ ${data.avg_deal_value}`;
}
