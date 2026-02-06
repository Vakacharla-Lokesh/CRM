import { callsStructure } from "./callModel.js";
import { commentsStructure } from "./commentModel.js";
import { dealsStructure } from "./dealModel.js";
import { leadsStructure } from "./leadModel.js";
import { organizationsStructure } from "./organizationModel.js";
import { usersStructure } from "./userModel.js";
import { attachmentsStructure } from "./attachmentModel.js";
import { tenantsStructure } from "./tenantsModel.js";

export const stores = {
  Leads: leadsStructure,
  Calls: callsStructure,
  Comments: commentsStructure,
  Deals: dealsStructure,
  Organizations: organizationsStructure,
  Users: usersStructure,
  Attachments: attachmentsStructure,
  Tenants: tenantsStructure,
};
