import { addNotification } from "../../../index.js";

// Long polling code
export async function longPolling() {
  try {
    const res = await fetch("http://localhost:3000/poll");
    const data = await res.json();

    console.log("Received:", data.message);

    const lpsStatus = document.getElementById("status-long-polling");
    if (lpsStatus) {
      lpsStatus
        .querySelector("span:first-child")
        .classList.remove("bg-gray-400");
      lpsStatus.querySelector("span:first-child").classList.add("bg-green-500");
    }

    addNotification(
      `Long Polling message received: ${data.message}`,
      "success",
    );

    longPolling();
  } catch (err) {
    console.error("Polling error:", err);
    const lpsStatus = document.getElementById("status-long-polling");
    if (lpsStatus) {
      lpsStatus
        .querySelector("span:first-child")
        .classList.remove("bg-green-500");
      lpsStatus.querySelector("span:first-child").classList.add("bg-red-500");
    }
    addNotification("Long Polling disconnected", "error");
    setTimeout(longPolling, 20000);
  }
}
