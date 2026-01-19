import { eventBus, EVENTS } from "../events/eventBus.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 16rem;
      flex-shrink: 0;
      height: calc(100vh - 4rem);
      border-right: 1px solid rgb(229 231 235);
      background-color: rgb(248 250 252);
      transition: transform 0.3s;
    }
    
    :host-context(.dark) {
      border-color: rgb(55 65 81);
      background-color: rgb(15 23 42);
    }
    
    @media (max-width: 640px) {
      :host {
        transform: translateX(-100%);
      }
      
      :host(.open) {
        transform: translateX(0);
      }
    }
    
    .sidebar-content {
      height: 100%;
      padding: 0.75rem;
      overflow-y: auto;
    }
    
    nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.375rem 0.5rem;
      border-radius: 0.375rem;
      color: rgb(71 85 105);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    a:hover {
      background-color: rgb(241 245 249);
      color: rgb(37 99 235);
    }
    
    a.active {
      background-color: rgb(241 245 249);
      color: rgb(37 99 235);
    }
    
    :host-context(.dark) a {
      color: rgb(148 163 184);
    }
    
    :host-context(.dark) a:hover {
      background-color: rgb(30 41 59);
      color: rgb(96 165 250);
    }
    
    :host-context(.dark) a.active {
      background-color: rgb(30 41 59);
      color: rgb(96 165 250);
    }
    
    .icon {
      width: 1.5rem;
      height: 1.5rem;
      flex-shrink: 0;
    }
    
    span {
      font-size: 0.875rem;
      font-weight: 500;
    }
  </style>
  
  <aside>
    <div class="sidebar-content">
      <nav>
        <a data-route="/home">
          <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z" clip-rule="evenodd"/>
          </svg>
          <span>Home</span>
        </a>
        
        <a data-route="/leads">
          <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z" clip-rule="evenodd"/>
          </svg>
          <span>Leads</span>
        </a>
        
        <a data-route="/organizations">
          <svg class="icon" fill="currentColor" viewBox="0 0 18 18">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.83144 1.7793L4.81079 1.7793C4.40911 1.77929 4.07754 1.77929 3.80742 1.80135C3.52685 1.82428 3.26886 1.87348 3.0265 1.99697C2.65072 2.18844 2.3452 2.49396 2.15373 2.86974C2.03024 3.1121 1.98104 3.37009 1.95811 3.65066C1.93604 3.92078 1.93605 4.25235 1.93606 4.65403L1.93606 4.67468V15.2533H1.6875C1.41136 15.2533 1.1875 15.4772 1.1875 15.7533C1.1875 16.0295 1.41136 16.2533 1.6875 16.2533H2.43606H9.92162H15.9101H16.6586C16.9348 16.2533 17.1586 16.0295 17.1586 15.7533C17.1586 15.4772 16.9348 15.2533 16.6586 15.2533H16.4101V10.6631V10.6425C16.4101 10.2408 16.4101 9.90924 16.388 9.63911C16.3651 9.35854 16.3159 9.10055 16.1924 8.85819C16.0009 8.48241 15.6954 8.17689 15.3196 7.98542C15.0773 7.86193 14.8193 7.81273 14.5387 7.7898C14.2686 7.76774 13.937 7.76774 13.5353 7.76775H13.5147H10.4216V4.67468V4.65402C10.4216 4.25235 10.4216 3.92077 10.3996 3.65066C10.3766 3.37009 10.3274 3.1121 10.2039 2.86974C10.0125 2.49396 9.70696 2.18844 9.33118 1.99697C9.08882 1.87348 8.83082 1.82428 8.55026 1.80135C8.28014 1.77929 7.94856 1.77929 7.54688 1.7793L7.52624 1.7793H4.83144Z"/>
          </svg>
          <span>Organizations</span>
        </a>
      </nav>
    </div>
  </aside>
`;

class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.currentRoute = "/home";
  }

  connectedCallback() {
    this.setupEventListeners();
    this.restoreActiveRoute();
  }

  setupEventListeners() {
    const links = this.shadowRoot.querySelectorAll("a[data-route]");

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const route = link.getAttribute("data-route");
        this.navigateTo(route);
      });
    });
  }

  navigateTo(route) {
    if (route === this.currentRoute) return;

    this.currentRoute = route;
    this.updateActiveLink(route);
    window.history.pushState({}, "", route);
    localStorage.setItem("activeRoute", route);
    eventBus.emit(EVENTS.ROUTE_CHANGE, { route });
    this.classList.remove("open");
  }

  updateActiveLink(route) {
    const links = this.shadowRoot.querySelectorAll("a[data-route]");

    links.forEach((link) => {
      const linkRoute = link.getAttribute("data-route");
      link.classList.toggle("active", linkRoute === route);
    });
  }

  restoreActiveRoute() {
    const savedRoute =
      localStorage.getItem("activeRoute") || window.location.pathname;

    this.currentRoute = savedRoute;
    this.updateActiveLink(savedRoute);
    eventBus.emit(EVENTS.ROUTE_CHANGE, { route: savedRoute });
  }
}

customElements.define("app-sidebar", AppSidebar);
