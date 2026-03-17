import { AsyncLocalStorage } from "async_hooks";

export const requestStore = new AsyncLocalStorage();

export function getRequestContext() {
  return requestStore.getStore() ?? {};
}
