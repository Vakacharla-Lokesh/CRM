import { eventBus, EVENTS } from "../../events/eventBus.js";
import { generateId } from "../../services/utils/uidGenerator.js";

class AttachmentsContent extends HTMLElement {
  connectedCallback() {
    this.attachments = [];
    this.loadAttachmentsData();
  }

  async loadAttachmentsData() {
    try {
      const leadId = this.getAttribute("lead-id");
      if (!leadId) {
        this.renderEmpty();
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.renderEmpty();
        return;
      }

      const attachments = await this.fetchAttachmentsByLeadId(leadId, dbWorker);
      this.attachments = attachments;

      if (attachments && attachments.length > 0) {
        this.renderAttachments(attachments);
      } else {
        this.renderEmpty();
      }
    } catch (error) {
      console.error("Error loading attachments:", error);
      this.renderEmpty();
    }
  }

  fetchAttachmentsByLeadId(leadId, dbWorker) {
    console.log("Inside fetch attachments: ", leadId);
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        console.log(e);
        const { action, rows, error, storeName } = e.data;

        if (action === "getAllSuccess" && storeName === "Attachments") {
          dbWorker.removeEventListener("message", messageHandler);
          // Filter attachments by lead_id
          const filtered = (rows || []).filter((att) => {
            console.log("inside attach filter:", att.lead_id);
            console.log("testing equals: ", att.lead_id == leadId);
            return att.lead_id == leadId;
          });
          resolve(filtered);
        } else if (action === "getAllError" && storeName === "Attachments") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve([]);
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getAllAttachments",
        storeName: "Attachments",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        resolve([]);
      }, 5000);
    });
  }

  renderAttachments(attachments) {
    const attachmentsHTML = attachments
      .map((attachment) => {
        const fileIcon = this.getFileIcon(
          attachment.file_type,
          attachment.file_data,
        );
        const downloadUrl = attachment.file_data || "#";

        return `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          ${fileIcon}
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-gray-900 dark:text-white truncate">${attachment.file_name || "Attachment"}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              ${attachment.file_size || "—"} • ${attachment.upload_date ? new Date(attachment.upload_date).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button 
            data-action="download" 
            data-attachment-id="${attachment.attachment_id}"
            class="download-btn px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors font-medium"
          >
            Download
          </button>
          <button 
            data-action="delete" 
            data-attachment-id="${attachment.attachment_id}"
            class="delete-btn px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    `;
      })
      .join("");

    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h2>
          <button id="add-attachment" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + Upload File
          </button>
        </div>
        
        <!-- File Upload Area (Initially Hidden) -->
        <div id="upload-area" class="hidden mb-4">
          <form id="upload-form" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <label for="file-input" class="block mb-2">
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  <span class="font-semibold cursor-pointer text-blue-600 hover:text-blue-700">Click to upload</span>
                  or drag and drop
                </span>
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
                PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)
              </p>
              
              <input 
                type="file" 
                id="file-input" 
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv,.xlsx"
                class="hidden"
              />
              
              <div id="file-preview" class="mt-4 space-y-2"></div>
              
              <div class="flex gap-2 mt-4 justify-center">
                <button 
                  type="submit" 
                  id="upload-btn"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  Upload Files
                </button>
                <button 
                  type="button" 
                  id="cancel-upload"
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <!-- Attachments List -->
        <div id="attachments-list">
          ${attachmentsHTML}
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  renderEmpty() {
    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h2>
          <button id="add-attachment" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + Upload File
          </button>
        </div>

        <!-- File Upload Area (Initially Hidden) -->
        <div id="upload-area" class="hidden mb-4">
          <form id="upload-form" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <label for="file-input" class="block mb-2">
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  <span class="font-semibold cursor-pointer text-blue-600 hover:text-blue-700">Click to upload</span>
                  or drag and drop
                </span>
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
                PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)
              </p>
              
              <input 
                type="file" 
                id="file-input" 
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv,.xlsx"
                class="hidden"
              />
              
              <div id="file-preview" class="mt-4 space-y-2"></div>
              
              <div class="flex gap-2 mt-4 justify-center">
                <button 
                  type="submit" 
                  id="upload-btn"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  Upload Files
                </button>
                <button 
                  type="button" 
                  id="cancel-upload"
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Empty State -->
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mb-4">No attachments yet</p>
          <p class="text-xs text-gray-400 dark:text-gray-500">Upload files to keep all documents in one place</p>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const addBtn = this.querySelector("#add-attachment");
    const uploadArea = this.querySelector("#upload-area");
    const cancelBtn = this.querySelector("#cancel-upload");
    const fileInput = this.querySelector("#file-input");
    const uploadForm = this.querySelector("#upload-form");
    const uploadBtn = this.querySelector("#upload-btn");

    // upload area
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        uploadArea?.classList.remove("hidden");
        addBtn.classList.add("hidden");
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        uploadArea?.classList.add("hidden");
        addBtn?.classList.remove("hidden");
        if (fileInput) fileInput.value = "";
        this.updateFilePreview([]);
      });
    }

    // file selection
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        this.updateFilePreview(files);
        uploadBtn.disabled = files.length === 0;
      });
    }

    // Form
    if (uploadForm) {
      uploadForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFileUpload(fileInput.files);
      });
    }

    this.querySelectorAll(".download-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const attachmentId = parseInt(e.target.dataset.attachmentId);
        this.handleDownload(attachmentId);
      });
    });

    this.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const attachmentId = parseInt(e.target.dataset.attachmentId);
        this.handleDelete(attachmentId);
      });
    });

    const dropZone = this.querySelector("#upload-form");
    if (dropZone) {
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add(
          "border-blue-500",
          "bg-blue-50",
          "dark:bg-blue-900/20",
        );
      });

      dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropZone.classList.remove(
          "border-blue-500",
          "bg-blue-50",
          "dark:bg-blue-900/20",
        );
      });

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove(
          "border-blue-500",
          "bg-blue-50",
          "dark:bg-blue-900/20",
        );

        const files = Array.from(e.dataTransfer.files);
        fileInput.files = e.dataTransfer.files;
        this.updateFilePreview(files);
        uploadBtn.disabled = files.length === 0;
      });
    }
  }

  updateFilePreview(files) {
    const preview = this.querySelector("#file-preview");
    if (!preview) return;

    if (files.length === 0) {
      preview.innerHTML = "";
      return;
    }

    const filesHTML = Array.from(files)
      .map((file, index) => {
        const size = this.formatFileSize(file.size);
        const icon = this.getFileIconForPreview(file);

        return `
        <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            ${icon}
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">${file.name}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">${size}</p>
            </div>
          </div>
          <button 
            type="button" 
            data-index="${index}"
            class="remove-file-btn text-red-500 hover:text-red-700 p-1"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `;
      })
      .join("");

    preview.innerHTML = filesHTML;

    // Remove file buttons
    preview.querySelectorAll(".remove-file-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const fileInput = this.querySelector("#file-input");
        fileInput.value = "";
        this.updateFilePreview([]);
        this.querySelector("#upload-btn").disabled = true;
      });
    });
  }

  getFileIconForPreview(file) {
    const iconClass = "w-8 h-8 text-gray-500 dark:text-gray-400";

    if (file.type.includes("image")) {
      const objectUrl = URL.createObjectURL(file);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);

      return `<img src="${objectUrl}" alt="Preview" class="w-8 h-8 rounded object-cover border border-gray-300 dark:border-gray-600" />`;
    } else if (file.type.includes("pdf")) {
      return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/></svg>`;
    } else if (file.type.includes("word") || file.type.includes("document")) {
      return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/></svg>`;
    } else if (
      file.type.includes("excel") ||
      file.type.includes("spreadsheet")
    ) {
      return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/></svg>`;
    } else {
      return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
    }
  }

  async handleFileUpload(files) {
    const leadId = this.getAttribute("lead-id");
    const dbWorker = window.dbWorker;

    if (!dbWorker || !files || files.length === 0) {
      alert("No files selected");
      return;
    }

    const uploadBtn = this.querySelector("#upload-btn");
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    try {
      for (const file of files) {
        // file size - 10MB limit
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }
        const base64Data = await this.fileToBase64(file);
        const attachment = {
          attachment_id: generateId("attachment"),
          lead_id: leadId,
          file_name: file.name,
          file_size: this.formatFileSize(file.size),
          file_type: file.type,
          file_data: base64Data,
          upload_date: new Date().toISOString(),
        };
        await this.saveAttachment(attachment, dbWorker);
      }

      await this.loadAttachmentsData();
      const fileInput = this.querySelector("#file-input");
      if (fileInput) fileInput.value = "";
      this.updateFilePreview([]);
      this.querySelector("#upload-area")?.classList.add("hidden");
      this.querySelector("#add-attachment")?.classList.remove("hidden");

      alert("Files uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload files: " + error.message);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Upload Files";
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  saveAttachment(attachment, dbWorker) {
    const leadId = this.getAttribute("lead-id");
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, error, storeName } = e.data;

        if (action === "insertSuccess" && storeName === "Attachments") {
          dbWorker.removeEventListener("message", messageHandler);
          eventBus.emit(EVENTS.WEB_SOCKET_SEND, {
            message: `Attachment uploaded for ${leadId}`,
          });
          resolve();
        } else if (action === "insertError" && storeName === "Attachments") {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error(error || "Failed to save attachment"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "createAttachment",
        attachmentData: attachment,
        storeName: "Attachments",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 10000);
    });
  }

  handleDownload(attachmentId) {
    const attachment = this.attachments.find(
      (a) => a.attachment_id === attachmentId,
    );
    if (!attachment || !attachment.file_data) {
      alert("File not found");
      return;
    }
    const link = document.createElement("a");
    link.href = attachment.file_data;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async handleDelete(attachmentId) {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    const dbWorker = window.dbWorker;
    if (!dbWorker) return;

    try {
      await this.deleteAttachment(attachmentId, dbWorker);
      await this.loadAttachmentsData();
      alert("Attachment deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete attachment");
    }
  }

  deleteAttachment(attachmentId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, error, storeName } = e.data;

        if (action === "deleteSuccess" && storeName === "Attachments") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve();
        } else if (action === "deleteError" && storeName === "Attachments") {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error(error || "Failed to delete attachment"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "deleteAttachment",
        id: attachmentId,
        storeName: "Attachments",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  getFileIcon(fileType, fileData = null) {
    const iconClass = "w-8 h-8 text-gray-500 dark:text-gray-400";
    if (fileType.includes("image") && fileData) {
      return `<img src="${fileData}" alt="Preview" class="w-8 h-8 rounded object-cover border border-gray-300 dark:border-gray-600" />`;
    } else if (fileType.includes("image")) {
      return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    } else if (fileType.includes("pdf")) {
      return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/></svg>`;
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/></svg>`;
    } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
      return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/></svg>`;
    } else {
      return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
    }
  }
}

customElements.define("attachments-content", AttachmentsContent);
