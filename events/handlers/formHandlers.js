import { dbState } from "../../services/state/dbState.js";
import { eventBus, EVENTS } from "../eventBus.js";
import { generateId } from "../../services/utils/uidGenerator.js";
import { showNotification } from "../notificationEvents.js";
import userManager from "./userManager.js";
import { offlineManager } from "../../services/offlineManager.js";
import { notificationManager } from "../../services/notificationManager.js";

export function handleLeadFormSubmit(event) {
  event.preventDefault();
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady && dbWorker) {
    dbWorker.postMessage({ action: "initialize" });
    showNotification("Database initializing, please try again...", "info");
    return;
  }

  const user = userManager.getUser();
  if (!user) {
    alert("Please sign in again to continue.");
    return;
  }

  const leadFormData = {
    lead_first_name: document.getElementById("first_name")?.value?.trim() || "",
    lead_last_name: document.getElementById("last_name")?.value?.trim() || "",
    lead_email: document.getElementById("email")?.value?.trim() || "",
    lead_mobile_number:
      document.getElementById("mobile_number")?.value?.trim() || "",
    organization_name:
      document.getElementById("organization_name")?.value?.trim() ||
      document.getElementById("org-search-input")?.value?.trim() ||
      "",
    organization_website_name:
      document.getElementById("organization_website_name")?.value?.trim() || "",
    organization_size:
      document.getElementById("organization_size")?.value?.trim() || "",
    organization_industry:
      document.getElementById("organization_industry")?.value?.trim() || "",
    user_id: user.user_id,
    tenant_id: user.tenant_id,
  };

  const selectedOrgId = document.getElementById(
    "selected_organization_id",
  )?.value;

  // Validation
  if (
    !leadFormData.lead_first_name ||
    !leadFormData.lead_email ||
    !leadFormData.lead_mobile_number ||
    !leadFormData.organization_name
  ) {
    console.log("Inside form validation: ", leadFormData);
    alert("Enter values correctly");
    return;
  }

  const regex = /^[1-9]\d{9}$/;
  if (
    leadFormData.lead_mobile_number &&
    !regex.test(leadFormData.lead_mobile_number)
  ) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (leadFormData.contact_number && !regex.test(leadFormData.contact_number)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (selectedOrgId) {
    const leadData = {
      lead_id: generateId("lead"),
      lead_first_name: leadFormData.lead_first_name,
      lead_last_name: leadFormData.lead_last_name,
      lead_email: leadFormData.lead_email,
      lead_mobile_number: leadFormData.lead_mobile_number,
      organization_id: selectedOrgId,
      organization_name: leadFormData.organization_name,
      lead_source: "Manual",
      lead_score: 0,
      created_on: new Date(),
      modified_on: new Date(),
      lead_status: "New",
      user_id: user.user_id,
      tenant_id: user.tenant_id,
    };

    if (!offlineManager.isOnline()) {
      leadData._offline = true;
      leadData._timestamp = Date.now();

      offlineManager.saveOffline("leads", leadData);
      notificationManager.showToast(
        "Lead saved offline. Will sync when online.",
        "warning",
      );

      document.getElementById("form-modal")?.classList.add("hidden");
      event.target.reset();
      document.getElementById("selected_organization_id")?.remove();

      const currentTab = sessionStorage.getItem("currentTab");
      if (currentTab === "/leads") {
        eventBus.emit(EVENTS.LEADS_REFRESH);
      }
      return;
    } else {
      eventBus.emit(EVENTS.LEAD_CREATE, { leadData });
    }
  } else if (leadFormData.organization_name) {
    createOrganizationAndLead(leadFormData);
  } else {
    const leadData = {
      lead_id: generateId("lead"),
      lead_first_name: leadFormData.lead_first_name,
      lead_last_name: leadFormData.lead_last_name,
      lead_email: leadFormData.lead_email,
      lead_mobile_number: leadFormData.lead_mobile_number,
      organization_id: null,
      lead_source: "Manual",
      lead_score: 0,
      created_on: new Date(),
      modified_on: new Date(),
      lead_status: "New",
      user_id: user.user_id,
      tenant_id: user.tenant_id,
    };

    eventBus.emit(EVENTS.LEAD_CREATE, { leadData });
  }

  document.getElementById("form-modal")?.classList.add("hidden");
  event.target.reset();
  document.getElementById("selected_organization_id")?.remove();
}

export function handleOrganizationFormSubmit(event) {
  event.preventDefault();
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady && dbWorker) {
    dbWorker.postMessage({ action: "initialize" });
    showNotification("Database initializing, please try again...", "info");
    return;
  }

  const user = userManager.getUser();
  if (!user) {
    alert("Please sign in again to continue.");
    return;
  }

  const organizationId = document
    .getElementById("organization_id")
    ?.value?.trim();
  const isEdit = !!organizationId;

  const organizationData = {
    organization_id: isEdit ? organizationId : generateId("org"),
    organization_name:
      document.getElementById("organization_name")?.value?.trim() || "",
    organization_website_name:
      document.getElementById("organization_website_name")?.value?.trim() || "",
    organization_size:
      document.getElementById("organization_size")?.value?.trim() || "",
    organization_industry:
      document.getElementById("organization_industry")?.value?.trim() || "",
    contact_name: document.getElementById("contact_name")?.value?.trim() || "",
    contact_number:
      document.getElementById("contact_number")?.value?.trim() || "",
    user_id: user.user_id,
    tenant_id: user.tenant_id,
  };

  if (
    !organizationData.organization_name ||
    !organizationData.organization_website_name ||
    !organizationData.organization_size
  ) {
    alert("Enter values correctly");
    return;
  }

  const regex = /^[1-9]\d{9}$/;
  if (
    organizationData.contact_number &&
    !regex.test(organizationData.contact_number)
  ) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (!isEdit && !offlineManager.isOnline()) {
    organizationData._offline = true;
    organizationData._timestamp = Date.now();
    organizationData.created_on = new Date();
    organizationData.modified_on = new Date();

    offlineManager.saveOffline("organizations", organizationData);
    notificationManager.showToast(
      "Organization saved offline. Will sync when online.",
      "warning",
    );

    document.getElementById("form-modal")?.classList.add("hidden");
    event.target.reset();

    const currentTab = sessionStorage.getItem("currentTab");
    if (currentTab === "/organizations") {
      eventBus.emit(EVENTS.ORGANIZATION_REFRESH);
    }
    return;
  }

  if (isEdit) {
    eventBus.emit(EVENTS.ORGANIZATION_UPDATE, { organizationData });
  } else {
    eventBus.emit(EVENTS.ORGANIZATION_CREATE, { organizationData });
  }

  document.getElementById("form-modal")?.classList.add("hidden");
  event.target.reset();
}

export function handleDealFormSubmit(event) {
  event.preventDefault();
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady && dbWorker) {
    dbWorker.postMessage({ action: "initialize" });
    showNotification("Database initializing, please try again...", "info");
    return;
  }

  const user = userManager.getUser();
  if (!user) {
    alert("Please sign in again to continue.");
    return;
  }

  const dealId = document.getElementById("deal_id_hidden")?.value?.trim();
  const isEdit = !!dealId;

  const dealName = document.getElementById("deal_name")?.value?.trim() || "";
  const dealValue = document.getElementById("deal_value")?.value?.trim() || "";
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
    deal_id: isEdit ? dealId : Date.now(),
    deal_name: dealName,
    deal_value: Number(dealValue),
    lead_id: leadId || null,
    organization_id: organizationId || null,
    deal_status: dealStatus,
    user_id: user.user_id,
    tenant_id: user.tenant_id,
  };

  if (!isEdit) {
    dealData.created_on = new Date();
  }
  dealData.modified_on = new Date();

  if (!isEdit && !offlineManager.isOnline()) {
    dealData._offline = true;
    dealData._timestamp = Date.now();

    offlineManager.saveOffline("deals", dealData);
    notificationManager.showToast(
      "Deal saved offline. Will sync when online.",
      "warning",
    );

    const modal =
      document.getElementById("deal-form-modal") ||
      document.getElementById("form-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
    event.target.reset();

    const currentTab = sessionStorage.getItem("currentTab");
    if (currentTab === "/deals") {
      eventBus.emit(EVENTS.DEAL_REFRESH);
    }
    return;
  }

  if (isEdit) {
    eventBus.emit(EVENTS.DEAL_UPDATE, { dealData });
  } else {
    eventBus.emit(EVENTS.DEAL_CREATE, { dealData });
  }

  const modal =
    document.getElementById("deal-form-modal") ||
    document.getElementById("form-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
  event.target.reset();
}

function createOrganizationAndLead(formData) {
  const { dbWorker } = dbState;
  const organizationId = generateId("org");

  const user = userManager.getUser();
  if (!user) {
    showNotification("Please sign in again to continue.", "error");
    return;
  }

  const organizationData = {
    organization_id: organizationId,
    organization_name: formData.organization_name,
    organization_website_name: formData.organization_website_name || "",
    organization_size: formData.organization_size || "",
    organization_industry: formData.organization_industry || "",
    created_on: new Date(),
    modified_on: new Date(),
    user_id: user.user_id,
    tenant_id: user.tenant_id,
  };

  eventBus.emit(EVENTS.ORGANIZATION_CREATE, { organizationData });

  const organizationHandler = (e) => {
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
        lead_source: "Manual",
        lead_score: 0,
        created_on: new Date(),
        modified_on: new Date(),
        lead_status: "New",
        user_id: user.user_id,
        tenant_id: user.tenant_id,
      };

      eventBus.emit(EVENTS.LEAD_CREATE, { leadData });
    }
  };

  dbWorker.addEventListener("message", organizationHandler);
}

export function handleUserFormSubmit(event) {
  event.preventDefault();
  const { dbWorker, isDbReady } = dbState;

  if (!isDbReady && dbWorker) {
    dbWorker.postMessage({ action: "initialize" });
    showNotification("Database initializing, please try again...", "info");
    return;
  }

  const currentUser = userManager.getUser();
  if (!currentUser) {
    showNotification("Please sign in again to continue.", "error");
    return;
  }

  const userName = document.getElementById("user_name")?.value?.trim() || "";
  const userEmail = document.getElementById("user_email")?.value?.trim() || "";
  const userPassword =
    document.getElementById("user_password")?.value?.trim() || "";
  const userMobile =
    document.getElementById("user_mobile")?.value?.trim() || "";
  const isSuperAdmin = currentUser && currentUser.role === "super_admin";

  let tenantId = currentUser.tenant_id;
  let userRole = "user";

  if (isSuperAdmin) {
    tenantId = document.getElementById("user_tenant")?.value?.trim() || "";
    userRole = document.getElementById("user_role")?.value?.trim() || "user";
    if (!tenantId) {
      alert("Please select a tenant for this user");
      return;
    }
  }

  if (!userName || !userEmail || !userPassword) {
    alert("Please fill in all required fields");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    alert("Please enter a valid email address");
    return;
  }

  if (userPassword.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }
  const mobileRegex = /^[1-9]\d{9}$/;
  if (userMobile && !mobileRegex.test(userMobile)) {
    alert("Please enter a valid 10-digit mobile number");
    return;
  }

  const userData = {
    user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_name: userName,
    user_email: userEmail,
    password: userPassword,
    mobile: userMobile || "",
    first_name: userName.split(" ")[0] || userName,
    last_name: userName.split(" ").slice(1).join(" ") || "",
    tenant_id: tenantId,
    role: userRole,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log("Creating user with data:", {
    name: userData.user_name,
    email: userData.user_email,
    tenantId: userData.tenant_id,
    role: userData.role,
  });

  // Check offline status
  if (!offlineManager.isOnline()) {
    // Add offline flags
    userData._offline = true;
    userData._timestamp = Date.now();

    offlineManager.saveOffline("users", userData);
    notificationManager.showToast(
      "User saved offline. Will sync when online.",
      "warning",
    );

    document.getElementById("form-modal")?.classList.add("hidden");
    event.target.reset();

    // Trigger refresh if on users page
    const currentTab = sessionStorage.getItem("currentTab");
    if (currentTab === "/users") {
      // Trigger user list refresh if available
    }
    return;
  }

  // Online mode - normal flow
  eventBus.emit(EVENTS.USER_CREATE, { userData });

  document.getElementById("form-modal")?.classList.add("hidden");
  event.target.reset();
}
