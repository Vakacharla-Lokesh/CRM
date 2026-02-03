import { addNotification } from "../../../index.js";

// Long polling code
export async function longPolling() {
  try {
    const res = await fetch("http://localhost:3000/poll");
    const data = await res.json();

    console.log("Received:", data.message);

    const lpsStatus = document.querySelector("#status-long-polling");
    if (lpsStatus) {
      lpsStatus
        .querySelector("span:first-child")
        .classList.remove("bg-gray-400");
      if (data.message) {
        lpsStatus
          .querySelector("span:first-child")
          .classList.remove("bg-red-500");
      }
      lpsStatus.querySelector("span:first-child").classList.add("bg-green-500");
    }

    const sseStatus = document.querySelector("#status-sse");
    if (sseStatus) {
      sseStatus
        .querySelector("span:first-child")
        .classList.remove("bg-gray-400");
      if (data.message) {
        sseStatus
          .querySelector("span:first-child")
          .classList.remove("bg-red-500");
      }
      sseStatus.querySelector("span:first-child").classList.add("bg-green-500");
    }

    addNotification(`Server sent message received: ${data.message}`, "success");

    longPolling();
  } catch (err) {
    console.error("Polling error:", err);
    const lpsStatus = document.querySelector("#status-long-polling");

    if (lpsStatus) {
      lpsStatus
        .querySelector("span:first-child")
        .classList.remove("bg-green-500");
      lpsStatus.querySelector("span:first-child").classList.add("bg-red-500");
    }

    const sseStatus = document.querySelector("#status-sse");
    if (sseStatus) {
      sseStatus
        .querySelector("span:first-child")
        .classList.remove("bg-green-500");
      sseStatus.querySelector("span:first-child").classList.add("bg-red-500");
    }

    addNotification("Long Polling disconnected", "error");
    setTimeout(longPolling, 10000);
  }
}
