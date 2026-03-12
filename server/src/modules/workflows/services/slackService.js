import { wrapServiceFn } from "../../../utils/serviceWrapper.js";

export const sendSlackMessage = async (
  webhookUrl,
  messageTemplate,
  variables = {},
  options = {},
) => {
  try {
    if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com/")) {
      throw new Error("Invalid Slack webhook URL");
    }

    let message = messageTemplate;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      message = message.replace(regex, variables[key] || "N/A");
    });

    const payload = {
      text: message,
      ...options,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const responseText = await response.text();
      if (responseText === "ok") {
        return { success: true, response: responseText };
      } else {
        return { success: false, error: "Slack API returned non-ok response" };
      }
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `Slack API error: ${response.status} - ${errorText}`,
      };
    }
  } catch (error) {
    console.error("Slack webhook error:", error.message);

    return {
      success: false,
      error: error.message || "Failed to send Slack message",
    };
  }
};

export const sendSlackMessageWithRetry = wrapServiceFn(async (
  webhookUrl,
  messageTemplate,
  variables = {},
  maxRetries = 2,
) => {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await sendSlackMessage(
      webhookUrl,
      messageTemplate,
      variables,
    );

    if (result.success) {
      return { success: true, attempts: attempt + 1 };
    }

    lastError = result.error;

    if (attempt < maxRetries) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt)),
      );
    }
  }

  return {
    success: false,
    attempts: maxRetries + 1,
    error: lastError,
  };
});

export const buildSlackVariables = (entity, entityType, user = null) => {
  const baseVars = {
    entityType: entityType,
    entityId: entity._id?.toString() || entity.id?.toString() || "unknown",
    createdAt: new Date().toLocaleString(),
  };

  // User variables
  if (user) {
    baseVars["createdBy.firstName"] = user.firstName || "Unknown";
    baseVars["createdBy.lastName"] = user.lastName || "";
    baseVars["createdBy.email"] = user.email || "";
    baseVars["createdBy.fullName"] =
      `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }

  // Entity-specific variables
  switch (entityType) {
    case "lead":
      return {
        ...baseVars,
        leadName:
          entity.firstName && entity.lastName
            ? `${entity.firstName} ${entity.lastName}`
            : entity.firstName || entity.lastName || "Unnamed Lead",
        firstName: entity.firstName || "N/A",
        lastName: entity.lastName || "N/A",
        email: entity.email || "N/A",
        phone: entity.phone || "N/A",
        company: entity.company || "N/A",
        status: entity.status || "N/A",
        source: entity.source || "N/A",
      };

    case "deal":
      return {
        ...baseVars,
        dealName: entity.title || "Unnamed Deal",
        title: entity.title || "N/A",
        value: entity.value || 0,
        stage: entity.stage || "N/A",
        probability: entity.probability || 0,
        expectedCloseDate: entity.expectedCloseDate || "N/A",
      };

    case "organization":
      return {
        ...baseVars,
        orgName: entity.name || "Unnamed Organization",
        name: entity.name || "N/A",
        industry: entity.industry || "N/A",
        website: entity.website || "N/A",
      };

    case "call":
      return {
        ...baseVars,
        callTitle: entity.title || "Unnamed Call",
        title: entity.title || "N/A",
        duration: entity.duration || 0,
        outcome: entity.outcome || "N/A",
      };

    case "comment":
      return {
        ...baseVars,
        commentTitle: entity.title || "Unnamed Comment",
        title: entity.title || "N/A",
        description: entity.description || "N/A",
      };

    default:
      return baseVars;
  }
};

export const getAvailableVariables = (entityType) => {
  const common = [
    "entityType",
    "entityId",
    "createdAt",
    "createdBy.firstName",
    "createdBy.lastName",
    "createdBy.email",
    "createdBy.fullName",
  ];

  const entityVars = {
    lead: [
      "leadName",
      "firstName",
      "lastName",
      "email",
      "phone",
      "company",
      "status",
      "source",
    ],
    deal: [
      "dealName",
      "title",
      "value",
      "stage",
      "probability",
      "expectedCloseDate",
    ],
    organization: ["orgName", "name", "industry", "website"],
    call: ["callTitle", "title", "duration", "outcome"],
    comment: ["commentTitle", "title", "description"],
  };

  return [...common, ...(entityVars[entityType] || [])];
};
