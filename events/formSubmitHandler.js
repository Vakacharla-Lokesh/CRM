import { eventBus, EVENTS } from "./eventBus.js";
import { generateId } from "../services/uidGenerator.js";
import { showNotification } from "./notificationEvents.js";

export function initializeFormSubmitHandler(dbWorkerRef, getIsDbReady) {
  document.addEventListener("submit", (event) => {
    event.preventDefault();
    const isDbReady = getIsDbReady();
    const dbWorker = dbWorkerRef.worker;

    if (event.target.matches("form[data-form='createLead']")) {
      event.preventDefault();
      if (!isDbReady && dbWorker) {
        dbWorker.postMessage({ action: "initialize" });
        showNotification("Database initializing, please try again...", "info");
        return;
      }

      const leadFormData = {
        lead_first_name:
          document.getElementById("first_name")?.value?.trim() || "",
        lead_last_name:
          document.getElementById("last_name")?.value?.trim() || "",
        lead_email: document.getElementById("email")?.value?.trim() || "",
        lead_mobile_number:
          document.getElementById("mobile_number")?.value?.trim() || "",
        organization_name:
          document.getElementById("organization_name")?.value?.trim() || "",
        organization_website_name:
          document.getElementById("organization_website_name")?.value?.trim() ||
          "",
        organization_size:
          document.getElementById("organization_size")?.value?.trim() || "",
        organization_industry:
          document.getElementById("organization_industry")?.value?.trim() || "",
        contact_name: document.getElementById("contact_name")?.value?.trim() || "",
        contact_number: document.getElementById("contact_number")?.value?.trim() || "",
      };

      const regex = /^[1-9]\d{9}$/;
      if (
        leadFormData.lead_mobile_number &&
        !regex.test(leadFormData.lead_mobile_number)
      ) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }

      if (
        leadFormData.contact_number &&
        !regex.test(leadFormData.contact_number)
      ) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }

      if (!leadFormData.lead_first_name || !leadFormData.lead_email) {
        showNotification("Please fill in required fields", "error");
        return;
      }

      if (leadFormData.organization_name) {
        createOrganizationAndLead(leadFormData, dbWorker, isDbReady);
      } else {
        const leadData = {
          lead_id: generateId("lead"),
          lead_first_name: leadFormData.lead_first_name,
          lead_last_name: leadFormData.lead_last_name,
          lead_email: leadFormData.lead_email,
          lead_mobile_number: leadFormData.lead_mobile_number,
          organization_id: null,
          organization_size: Number(leadFormData.organization_size),
          lead_source: "Manual",
          lead_score: 0,
          created_on: new Date(),
          modified_on: new Date(),
          lead_status: "New",
        };

        eventBus.emit(EVENTS.LEAD_CREATE, { leadData, dbWorker, isDbReady });
      }

      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();
    } else if (event.target.matches("form[data-form='createOrganization']")) {
      event.preventDefault();
      if (!isDbReady || !dbWorker) {
        dbWorker.postMessage({ action: "initialize" });
        showNotification("Database initializing, please try again...", "info");
        return;
      }

      const organizationData = {
        organization_id: Date.now(),
        organization_name:
          document.getElementById("organization_name")?.value?.trim() || "",
        organization_website_name:
          document.getElementById("organization_website_name")?.value?.trim() ||
          "",
        organization_size:
          document.getElementById("organization_size")?.value?.trim() || "",
        organization_industry:
          document.getElementById("organization_industry")?.value?.trim() || "",
        contact_name: document.getElementById("contact_name"),
        contact_number: document.getElementById("contact_number"),
      };

      if (!organizationData.organization_name) {
        showNotification("Please enter organization name", "error");
        return;
      }

      eventBus.emit(EVENTS.ORGANIZATION_CREATE, { organizationData });
      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();
    } else if (event.target.matches("form[data-form='createDeal']")) {
      event.preventDefault();
      if (!isDbReady && dbWorker) {
        dbWorker.postMessage({ action: "initialize" });
        showNotification("Database initializing, please try again...", "info");
        return;
      }

      console.log("Inside handle Deal create caller");

      const dealName =
        document.getElementById("deal_name")?.value?.trim() || "";
      const dealValue =
        document.getElementById("deal_value")?.value?.trim() || "";
      const leadId = document.getElementById("lead_id")?.value || "";
      const organizationId =
        document.getElementById("organization_id")?.value || "";
      const dealStatus =
        document.getElementById("deal_status")?.value?.trim() || "";

      if (!dealName || !dealValue) {
        alert("Please fill in Deal Name and Deal Value");
        return;
      }

      if (!dealStatus) {
        alert("Please select a Deal Status");
        return;
      }

      const dealData = {
        deal_id: Date.now(),
        deal_name: dealName,
        deal_value: Number(dealValue),
        lead_id: leadId ? leadId : null,
        organization_id: organizationId ? organizationId : null,
        deal_status: dealStatus,
        created_on: new Date(),
        modified_on: new Date(),
      };

      if (leadId) {
        const lead = allLeads.find((l) => l.lead_id === dealData.lead_id);
        if (lead) {
          dealData.lead_first_name = lead.lead_first_name;
          dealData.lead_last_name = lead.lead_last_name;
        }
      }

      if (organizationId) {
        const org = allOrganizations.find(
          (o) => o.organization_id === dealData.organization_id,
        );
        if (org) {
          dealData.organization_name = org.organization_name;
        }
      }

      eventBus.emit(EVENTS.DEAL_CREATE, { dealData });
      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();
    }
  });
}

function createOrganizationAndLead(formData, dbWorker, isDbReady) {
  const organizationId = generateId("org");

  const organizationData = {
    organization_id: organizationId,
    organization_name: formData.organization_name,
    organization_website_name: formData.organization_website_name || "",
    organization_size: formData.organization_size || "",
    organization_industry: formData.organization_industry || "",
    contact_name: formData.contact_name,
    contact_number: formData.contact_number,
    created_on: new Date(),
    modified_on: new Date(),
  };

  console.log("before org create: ");
  eventBus.emit(EVENTS.ORGANIZATION_CREATE, { organizationData });
  console.log("after org create: ");

  const organizationHandler = (e) => {
    console.log("Inside formSubmitHandler.js orgHandler: ");

    const { action, storeName } = e.data;

    if (action === "insertSuccess" && storeName === "Organizations") {
      dbWorker.removeEventListener("message", organizationHandler);
      const leadData = {
        lead_id: generateId("lead"),
        lead_first_name: formData.lead_first_name,
        lead_last_name: formData.lead_last_name,
        lead_email: formData.lead_email,
        lead_mobile_number: formData.lead_mobile_number,
        organization_id: organizationId,
        organization_name: formData.organization_name,
        organization_size: formData.organization_size,
        lead_source: "Manual",
        lead_score: 0,
        created_on: new Date(),
        modified_on: new Date(),
        lead_status: "New",
      };

      console.log("Before eventBus emit in formSubmitHandler: ");
      eventBus.emit(EVENTS.LEAD_CREATE, { leadData, dbWorker, isDbReady });
    }
  };

  dbWorker.addEventListener("message", organizationHandler);
}
