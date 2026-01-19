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
  DB_READY: "db:ready",
  DB_ERROR: "db:error",
  ROUTE_CHANGE: "route:change",
  THEME_TOGGLE: "theme:toggle",
};
