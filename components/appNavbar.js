import { eventBus, EVENTS } from "../events/eventBus.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    
    nav {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
      height: 4rem;
      width: 100%;
      border-bottom: 1px solid rgb(229 231 235);
      background-color: white;
    }
    
    :host-context(.dark) nav {
      border-color: rgb(55 65 81);
      background-color: rgb(15 23 42);
    }
    
    .nav-container {
      margin: 0 auto;
      max-width: 80rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    
    .logo {
      height: 1.75rem;
    }
    
    .brand-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: rgb(17 24 39);
      white-space: nowrap;
    }
    
    :host-context(.dark) .brand-name {
      color: rgb(226 232 240);
    }
    
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    button {
      border-radius: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid rgb(209 213 219);
      background-color: transparent;
      color: rgb(17 24 39);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    button:hover {
      background-color: rgb(243 244 246);
    }
    
    :host-context(.dark) button {
      border-color: rgb(75 85 99);
      color: rgb(226 232 240);
    }
    
    :host-context(.dark) button:hover {
      background-color: rgb(55 65 81);
    }
    
    .db-ready {
      color: rgb(22 163 74);
      border-color: rgb(22 163 74);
    }
    
    :host-context(.dark) .db-ready {
      color: rgb(74 222 128);
      border-color: rgb(74 222 128);
    }
  </style>
  
  <nav>
    <div class="nav-container">
      <a href="/" class="logo-container">
        <img src="https://flowbite.com/docs/images/logo.svg" class="logo" alt="Logo" />
        <span class="brand-name">CRM</span>
      </a>
      
      <div class="nav-actions">
        <button id="theme-toggle" title="Toggle theme">🌙</button>
        <button id="db-status">Create DB</button>
      </div>
    </div>
  </nav>
`;

class AppNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.currentTheme = "light";
  }

  connectedCallback() {
    this.setupEventListeners();
    this.initializeTheme();
  }

  setupEventListeners() {
    this.themeToggle = this.shadowRoot.getElementById("theme-toggle");
    this.themeToggle.addEventListener(
      "click",
      this.handleThemeToggle.bind(this),
    );
    this.dbStatusBtn = this.shadowRoot.getElementById("db-status");
    this.dbStatusBtn.addEventListener("click", this.handleDbCreate.bind(this));
    eventBus.on(EVENTS.DB_READY, this.handleDbReady.bind(this));
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    this.currentTheme = savedTheme || (prefersDark ? "dark" : "light");
    this.applyTheme(this.currentTheme);
  }

  handleThemeToggle() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(this.currentTheme);
    eventBus.emit(EVENTS.THEME_TOGGLE, { theme: this.currentTheme });
  }

  applyTheme(theme) {
    this.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }

  handleDbCreate() {
    if (window.dbWorker) {
      window.dbWorker.postMessage({ action: "initialize" });
    }
  }

  handleDbReady() {
    this.dbStatusBtn.textContent = "DB Ready ✓";
    this.dbStatusBtn.classList.add("db-ready");
    this.dbStatusBtn.disabled = true;
  }
}

customElements.define("app-navbar", AppNavbar);
