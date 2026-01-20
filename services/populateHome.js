export function populateHome(data) {
  console.log("Inside populate home fn ...", data);
  let totalLeads = document.querySelector("#data-total-leads");
  totalLeads.textContent = data.count;
}
