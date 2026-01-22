class AttachmentsContent extends HTMLElement {
  connectedCallback() {
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

      const attachments = await this.fetchAttachmentsById(
        Number(leadId),
        dbWorker,
      );

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

  fetchAttachmentsById(leadId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, data, error, id } = e.data;

        if (action === "getByIdSuccess" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve(data || []);
        } else if (action === "getByIdError" && id === leadId) {
          dbWorker.removeEventListener("message", messageHandler);
          resolve([]);
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getAttachmentsById",
        storeName: "Attachments",
        id: leadId,
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        resolve([]);
      }, 5000);
    });
  }

  renderAttachments(attachments) {
    const attachmentsHTML = attachments
      .map(
        (attachment) => `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">${attachment.file_name || "Attachment"}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${attachment.file_size || "—"} • ${attachment.upload_date ? new Date(attachment.upload_date).toLocaleDateString() : "—"}</p>
          </div>
        </div>
        <a href="${attachment.file_url || "#"}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
          Download
        </a>
      </div>
    `,
      )
      .join("");

    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h2>
          <button id="add-attachment" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
            + Upload File
          </button>
        </div>
        ${attachmentsHTML}
      </div>
    `;
  }

  renderEmpty() {
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center w-full">
        <label for="dropzone-file-${Date.now()}" class="flex flex-col items-center justify-center w-full h-64 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg class="w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <p class="mb-2 text-sm text-gray-700 dark:text-gray-300"><span class="font-semibold">Click to upload</span> or drag and drop</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, PDF, DOC (MAX. 10MB)</p>
          </div>
          <input id="dropzone-file-${Date.now()}" type="file" class="hidden" />
        </label>
      </div> 
    `;
  }
}

customElements.define("attachments-content", AttachmentsContent);
