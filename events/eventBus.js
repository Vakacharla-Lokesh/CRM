class EventBus extends EventTarget {
  constructor() {
    super();
  }

  emit(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
    // console.log(`[EventBus] Emitted: ${eventName}`, detail);
  }

  on(eventName, callback) {
    this.addEventListener(eventName, callback);
    // console.log(`[EventBus] Listener added for: ${eventName}`);
  }

  off(eventName, callback) {
    this.removeEventListener(eventName, callback);
    // console.log(`[EventBus] Listener removed for: ${eventName}`);
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  MODAL_OPEN: "modal:open",
  MODAL_CLOSE: "modal:close",
  LEAD_CREATE: "lead:create",
  LEAD_CREATED: "lead:created",
  LEAD_UPDATE: "lead:update",
  LEAD_UPDATED: "lead:updated",
  LEAD_DELETE: "lead:delete",
  LEAD_DELETED: "lead:deleted",
  LEAD_SELECT: "lead:select",
  LEADS_EXPORT: "lead:export",
  DEAL_CREATE: "deal:create",
  DEAL_CREATED: "deal:created",
  DEAL_UPDATE: "deal:update",
  DEAL_UPDATED: "deal:updated",
  DEAL_DELETE: "deal:delete",
  DEAL_DELETED: "deal:deleted",
  DEAL_UPDATE: "deal:update",
  DEAL_UPDATED: "deal:updated",
  DEAL_EXPORT: "deal:export",
  ORGANIZATION_CREATE: "organization:create",
  ORGANIZATION_CREATED: "organization:created",
  ORGANIZATION_DELETE: "organization:delete",
  ORGANIZATION_DELETED: "organization:deleted",
  ORGANIZATION_UPDATE: "organization:update",
  ORGANIZATION_UPDATED: "organization:updated",
  ORGANIZATION_EXPORT: "organization:export",
  DB_READY: "db:ready",
  DB_ERROR: "db:error",
  ROUTE_CHANGE: "route:change",
  THEME_TOGGLE: "theme:toggle",
  WEB_SOCKET_MESSAGE: "websocket:message",
  LOGIN_SUCCESS: "auth:login-success",
  LOGIN_FAILURE: "auth:login-failure",
  USER_CREATE: "user:create",
  USER_CREATED: "user:created",
  USER_DELETE: "user:delete",
  USER_DELETED: "user:deleted",
  LOGOUT_SUCCESS: "auth:logout-success",
  LEADS_SCORE: "leads:score",
  TENANT_CREATE: "tenant:create",
  TENANT_CREATED: "tenant:created",
  TENANT_UPDATE: "tenant:update",
  TENANT_UPDATED: "tenant:updated",
  TENANT_DELETE: "tenant:delete",
  TENANT_DELETED: "tenant:deleted",
  TENANT_EXPORT: "tenant:export",
};
