class CommentsContent extends HTMLElement {
  connectedCallback() {
    this.loadCommentsData();
  }

  async loadCommentsData() {
    try {
      const leadId = this.getAttribute("lead-id");
      if (!leadId) {
        this.renderEmptyState("No lead ID found");
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.renderEmptyState("Database not available");
        return;
      }

      const comments = await this.fetchCommentsById(Number(leadId), dbWorker);

      if (comments && comments.length > 0) {
        this.renderComments(comments);
      } else {
        this.renderEmptyState("No comments added yet");
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      this.renderEmptyState("Error loading comments");
    }
  }

  fetchCommentsById(leadId, dbWorker) {
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
        action: "getCommentsById",
        storeName: "Comments",
        id: leadId,
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        resolve([]);
      }, 5000);
    });
  }

  renderComments(comments) {
    const commentsHTML = comments
      .map(
        (comment) => `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold text-gray-900 dark:text-white">${comment.comment_by || "Unknown User"}</h3>
          <span class="text-xs text-gray-500 dark:text-gray-400">${comment.comment_date ? new Date(comment.comment_date).toLocaleDateString() : "—"}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">${comment.comment_text || "No content"}</p>
      </div>
    `,
      )
      .join("");

    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
          <button id="add-comment" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
            + Add Comment
          </button>
        </div>
        ${commentsHTML}
      </div>
    `;
  }

  renderEmptyState(message) {
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">${message}</p>
        <button id="add-comment-empty" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
          + Add Comment
        </button>
      </div>
    `;
  }
}

customElements.define("comments-content", CommentsContent);
