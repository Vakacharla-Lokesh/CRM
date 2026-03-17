import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initializeDatabase } from "./utils/indexedDB";

// Initialize IndexedDB before rendering
initializeDatabase()
  .then(() => {
    console.log("IndexedDB initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize IndexedDB:", error);
  });

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// createRoot(rootElement).render(<App />);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
