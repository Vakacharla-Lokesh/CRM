import { eventBus, EVENTS } from "../events/eventBus.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    nav { position: fixed; top: 0; left: 0; z-index: 50; height: 4rem; width:100%; border-bottom:1px solid rgb(229 231 235); background-color: white; }
    .nav-container { margin:0 auto; max-width:80rem; display:flex; align-items:center; justify-content:space-between; padding:1rem }
    .logo { height:1.75rem }
    .brand-name { font-size:1.25rem; font-weight:600; color: rgb(17 24 39); white-space:nowrap }
    .nav-actions { display:flex; gap:0.75rem; align-items:center }
    button { border-radius:0.375rem; padding:0.375rem 0.75rem; font-size:0.875rem; border:1px solid rgb(209 213 219); background:transparent; cursor:pointer }
    .db-ready { color: rgb(22 163 74); border-color: rgb(22 163 74) }
  </style>
  <nav>
    <div class="nav-container">
      <a href="/" class="logo-container">
        <img src="https://flowbite.com/docs/images/logo.svg" class="logo" alt="Logo" />
        <span class="brand-name">CRM</span>
      </a>
      <div class="nav-actions">
        <button id="data-WSS" type="button">WSS</button>
        <button type="button">SSE</button>
        <button type="button">LPS</button>
        <button type="button">SPS</button>
        <button id="data-createDb" class="text-blue-300 hover:underline">Create DB</button>
        <button id="theme-toggle" title="Toggle theme">🌙</button>
      </div>
    </div>
  </nav>
`;

class AppNavbar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = template.innerHTML;
    }
    this.setupEventListeners();
    this.initializeTheme();
  }

  setupEventListeners() {
    this.themeToggle = document.getElementById("theme-toggle");
    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", this.handleThemeToggle.bind(this));
    }

    this.dbStatusBtn = document.getElementById("data-createDb");
    if (this.dbStatusBtn) {
      this.dbStatusBtn.addEventListener("click", this.handleDbCreate.bind(this));
    }

    eventBus.on(EVENTS.DB_READY, this.handleDbReady.bind(this));
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.currentTheme = savedTheme || (prefersDark ? "dark" : "light");
    this.applyTheme(this.currentTheme);
  }

  handleThemeToggle() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(this.currentTheme);
    eventBus.emit(EVENTS.THEME_TOGGLE, { theme: this.currentTheme });
  }

  applyTheme(theme) {
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.textContent = theme === "dark" ? "☀️" : "🌙";
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }

  handleDbCreate() {
    if (window.dbWorker) {
      window.dbWorker.postMessage({ action: "initialize" });
    }
  }

  handleDbReady() {
    const btn = document.getElementById("data-createDb");
    if (btn) {
      btn.textContent = "DB Ready ✓";
      btn.classList.add("db-ready");
      btn.disabled = true;
    }
  }
}

customElements.define("app-navbar", AppNavbar);
