import { callsStructure } from "./callModel.js";
import { commentsStructure } from "./commentModel.js";
import { dealsStructure } from "./dealModel.js";
import { leadsStructure } from "./leadModel.js";
import { organizationsStructure } from "./organizationModel.js";

export const stores = {
  Leads: leadsStructure,
  Calls: callsStructure,
  Comments: commentsStructure,
  Deals: dealsStructure,
  Organizations: organizationsStructure,
};
