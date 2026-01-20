import { eventBus, EVENTS } from "../events/eventBus.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: none;
    }
    
    :host(.open) {
      display: flex;
    }
    
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      overflow-y: auto;
    }
    
    .modal-container {
      position: relative;
      width: 100%;
      max-width: 36rem;
      padding: 1rem;
    }
    
    .modal-content {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      border: 1px solid rgb(229 231 235);
      padding: 1.5rem;
    }
    
    :host-context(.dark) .modal-content {
      background-color: rgb(31 41 55);
      border-color: rgb(55 65 81);
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgb(229 231 235);
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    
    :host-context(.dark) .modal-header {
      border-color: rgb(55 65 81);
    }
    
    .modal-title {
      font-size: 1.125rem;
      font-weight: 500;
      color: rgb(17 24 39);
      margin: 0;
    }
    
    :host-context(.dark) .modal-title {
      color: white;
    }
    
    .close-button {
      color: rgb(107 114 128);
      border-radius: 0.5rem;
      width: 2.25rem;
      height: 2.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      background: transparent;
      transition: all 0.2s;
    }
    
    .close-button:hover {
      color: rgb(17 24 39);
      background-color: rgb(243 244 246);
    }
    
    :host-context(.dark) .close-button {
      color: rgb(209 213 219);
    }
    
    :host-context(.dark) .close-button:hover {
      color: white;
      background-color: rgb(55 65 81);
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      border-bottom: 1px solid rgb(229 231 235);
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    
    :host-context(.dark) .form-grid {
      border-color: rgb(55 65 81);
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(17 24 39);
    }
    
    :host-context(.dark) label {
      color: white;
    }
    
    input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid rgb(209 213 219);
      border-radius: 0.5rem;
      background-color: rgb(243 244 246);
      color: rgb(17 24 39);
      transition: all 0.2s;
    }
    
    input:focus {
      outline: none;
      border-color: rgb(59 130 246);
      ring: 2px;
      ring-color: rgb(59 130 246);
    }
    
    :host-context(.dark) input {
      background-color: rgb(55 65 81);
      border-color: rgb(75 85 99);
      color: rgb(243 244 246);
    }
    
    .submit-button {
      width: 100%;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      background-color: rgb(37 99 235);
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.2s;
    }
    
    .submit-button:hover {
      background-color: rgb(29 78 216);
    }
    
    :host-context(.dark) .submit-button {
      background-color: rgb(59 130 246);
    }
    
    :host-context(.dark) .submit-button:hover {
      background-color: rgb(37 99 235);
    }
  </style>
  
  <div class="modal-backdrop" part="backdrop">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Create Lead</h3>
          <button class="close-button" id="close-btn" aria-label="Close modal">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <form id="lead-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="first_name">First Name</label>
              <input type="text" id="first_name" name="first_name" required />
            </div>
            
            <div class="form-group">
              <label for="last_name">Last Name</label>
              <input type="text" id="last_name" name="last_name" required />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            
            <div class="form-group">
              <label for="mobile_number">Mobile Number</label>
              <input type="tel" id="mobile_number" name="mobile_number" required />
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="organization_name">Organization Name</label>
              <input type="text" id="organization_name" name="organization_name" required />
            </div>
            
            <div class="form-group">
              <label for="organization_website">Website</label>
              <input type="url" id="organization_website" name="organization_website" />
            </div>
            
            <div class="form-group">
              <label for="organization_size">No of Employees</label>
              <input type="number" id="organization_size" name="organization_size" min="1" />
            </div>
            
            <div class="form-group">
              <label for="organization_industry">Industry</label>
              <input type="text" id="organization_industry" name="organization_industry" />
            </div>
          </div>
          
          <button type="submit" class="submit-button">Create Lead</button>
        </form>
      </div>
    </div>
  </div>
`;

class LeadModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  setupEventListeners() {
    this.closeBtn = this.shadowRoot.getElementById("close-btn");
    this.closeBtn.addEventListener("click", this.handleClose.bind(this));
    this.backdrop = this.shadowRoot.querySelector(".modal-backdrop");
    this.backdrop.addEventListener(
      "click",
      this.handleBackdropClick.bind(this),
    );
    this.form = this.shadowRoot.getElementById("lead-form");
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.escHandler = this.handleEscape.bind(this);
    document.addEventListener("keydown", this.escHandler);
    eventBus.on(EVENTS.MODAL_OPEN, this.handleOpen.bind(this));
  }

  removeEventListeners() {
    document.removeEventListener("keydown", this.escHandler);
  }

  handleOpen(event) {
    if (event.detail.modalType === "lead") {
      this.open();
    }
  }

  handleClose() {
    this.close();
  }

  handleBackdropClick(event) {
    if (event.target === this.backdrop) {
      this.close();
    }
  }

  handleEscape(event) {
    if (event.key === "Escape" && this.classList.contains("open")) {
      this.close();
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(this.form);
    const leadData = {
      lead_first_name: formData.get("first_name"),
      lead_last_name: formData.get("last_name"),
      lead_email: formData.get("email"),
      lead_mobile_number: formData.get("mobile_number"),
      organization_name: formData.get("organization_name"),
      websiteName: formData.get("organization_website"),
      organizationSize: formData.get("organization_size"),
      industry: formData.get("organization_industry"),
    };
    eventBus.emit(EVENTS.LEAD_CREATE, { leadData });
    this.close();
    this.form.reset();
  }

  open() {
    this.classList.add("open");
    eventBus.emit(EVENTS.MODAL_OPEN, { modalType: "lead", action: "opened" });
  }

  close() {
    this.classList.remove("open");
    eventBus.emit(EVENTS.MODAL_CLOSE, { modalType: "lead" });
  }
}

customElements.define("lead-modal", LeadModal);
