import { addNotification } from "../../../index.js";

let backoff = 1000;
const MAX_BACKOFF = 30000;
const HEALTH_INTERVAL = 5000;

export async function checkHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch("http://localhost:3000/health", {
      signal: controller.signal,
    });

    if (res.status === 429) {
      console.warn("Rate limited. Applying backoff...");
      backoff = Math.min(backoff * 2, MAX_BACKOFF);

      setTimeout(checkHealth, backoff);
      return;
    }

    if (!res.ok) {
      throw new Error("Health check failed");
    }

    const data = await res.json();
    console.log("API healthy:", data);

    addNotification(`Health check: ${data}`, "success");

    const spsStatus = document.querySelector("#status-short-polling");
    if (spsStatus) {
      spsStatus
        .querySelector("span:first-child")
        .classList.remove("bg-gray-400");
      spsStatus
        .querySelector("span:first-child")
        .classList.remove("bg-red-500");
      spsStatus.querySelector("span:first-child").classList.add("bg-green-500");
    }

    backoff = 1000;

    setTimeout(checkHealth, HEALTH_INTERVAL);
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("Health check timed out");
    } else {
      console.error("Health check error:", err.message);
    }

    const spsStatus = document.querySelector("#status-short-polling");

    if (spsStatus) {
      spsStatus
        .querySelector("span:first-child")
        .classList.remove("bg-green-500");
      spsStatus.querySelector("span:first-child").classList.add("bg-red-500");
    }

    addNotification(`Health check: failed`, "error");

    backoff = Math.min(backoff * 2, MAX_BACKOFF);
    setTimeout(checkHealth, backoff);
  } finally {
    clearTimeout(timeoutId);
  }
}
