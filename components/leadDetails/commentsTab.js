class CommentsContent extends HTMLElement {
  constructor() {
    super();
    this.comments = [];
    this.leadId = null;
  }

  connectedCallback() {
    this.leadId = this.getAttribute("lead-id");
    this.loadCommentsData();
  }

  async loadCommentsData() {
    try {
      if (!this.leadId) {
        this.renderEmptyState("No lead ID found");
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.renderEmptyState("Database not available");
        return;
      }

      const comments = await this.fetchCommentsByLeadId(this.leadId, dbWorker);

      if (comments && comments.length > 0) {
        this.comments = comments;
        this.renderComments(comments);
      } else {
        this.comments = [];
        this.renderEmptyState("No comments added yet");
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      this.renderEmptyState("Error loading comments");
    }
  }

  fetchCommentsByLeadId(leadId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, rows, error, storeName } = e.data;

        if (action === "getAllSuccess" && storeName === "Comments") {
          dbWorker.removeEventListener("message", messageHandler);

          // Filter comments for this specific lead
          const leadComments = (rows || []).filter(
            (comment) => comment.lead_id == leadId,
          );
          resolve(leadComments);
        } else if (action === "getAllError" && storeName === "Comments") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve([]);
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "getAllComments",
        storeName: "Comments",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        resolve([]);
      }, 5000);
    });
  }

  renderComments(comments) {
    const commentsHTML = comments
      .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
      .map(
        (comment) => `
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 bg-white dark:bg-gray-800">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold text-gray-900 dark:text-white">${this.escapeHtml(comment.comment_title || "Comment")}</h3>
          <span class="text-xs text-gray-500 dark:text-gray-400">${comment.created_on ? new Date(comment.created_on).toLocaleDateString() : "—"}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">${this.escapeHtml(comment.comment_desc || "No content")}</p>
        <div class="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <span class="text-xs text-gray-500 dark:text-gray-400">ID: ${comment.comment_id}</span>
          <button 
            data-comment-id="${comment.comment_id}" 
            class="delete-comment-btn text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    `,
      )
      .join("");

    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Comments (${comments.length})</h2>
          <button id="add-comment-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + Add Comment
          </button>
        </div>
        
        <div id="comments-list" class="space-y-3">
          ${commentsHTML}
        </div>
      </div>

      <!-- Add Comment Modal -->
      <div id="add-comment-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="relative w-full max-w-lg p-4 mx-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add New Comment</h3>
              <button id="close-comment-modal" type="button" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form id="add-comment-form" class="px-6 py-4">
              <div class="mb-4">
                <label for="comment-title" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="comment-title"
                  required
                  class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter comment title"
                />
              </div>

              <div class="mb-6">
                <label for="comment-desc" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Comment <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="comment-desc"
                  required
                  rows="4"
                  class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Write your comment here..."
                ></textarea>
              </div>

              <div class="flex gap-3">
                <button
                  type="submit"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
                >
                  Add Comment
                </button>
                <button
                  type="button"
                  id="cancel-comment-btn"
                  class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  renderEmptyState(message) {
    this.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400 mb-4">${message}</p>
        <button id="add-comment-empty-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          + Add Comment
        </button>
      </div>
    `;

    this.setupEmptyStateListeners();
  }

  setupEventListeners() {
    const addBtn = this.querySelector("#add-comment-btn");
    const modal = this.querySelector("#add-comment-modal");
    const closeBtn = this.querySelector("#close-comment-modal");
    const cancelBtn = this.querySelector("#cancel-comment-btn");
    const form = this.querySelector("#add-comment-form");
    const deleteButtons = this.querySelectorAll(".delete-comment-btn");

    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.closeModal());
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddComment();
      });
    }

    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const commentId = Number(btn.getAttribute("data-comment-id"));
        this.handleDeleteComment(commentId);
      });
    });
  }

  setupEmptyStateListeners() {
    const addBtn = this.querySelector("#add-comment-empty-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        this.renderEmptyWithModal();
      });
    }
  }

  renderEmptyWithModal() {
    this.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Comments (0)</h2>
          <button id="add-comment-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + Add Comment
          </button>
        </div>
        
        <div class="flex flex-col items-center justify-center text-center py-12">
          <svg class="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
          <p class="text-gray-500 dark:text-gray-400">No comments added yet</p>
        </div>
      </div>

      <!-- Add Comment Modal -->
      <div id="add-comment-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="relative w-full max-w-lg p-4 mx-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add New Comment</h3>
              <button id="close-comment-modal" type="button" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form id="add-comment-form" class="px-6 py-4">
              <div class="mb-4">
                <label for="comment-title" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="comment-title"
                  required
                  class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter comment title"
                />
              </div>

              <div class="mb-6">
                <label for="comment-desc" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Comment <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="comment-desc"
                  required
                  rows="4"
                  class="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Write your comment here..."
                ></textarea>
              </div>

              <div class="flex gap-3">
                <button
                  type="submit"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
                >
                  Add Comment
                </button>
                <button
                  type="button"
                  id="cancel-comment-btn"
                  class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.openModal();
  }

  openModal() {
    const modal = this.querySelector("#add-comment-modal");
    if (modal) {
      modal.classList.remove("hidden");

      // Focus on the title input
      setTimeout(() => {
        const titleInput = this.querySelector("#comment-title");
        if (titleInput) titleInput.focus();
      }, 100);
    }
  }

  closeModal() {
    const modal = this.querySelector("#add-comment-modal");
    const form = this.querySelector("#add-comment-form");

    if (modal) {
      modal.classList.add("hidden");
    }

    if (form) {
      form.reset();
    }
  }

  async handleAddComment() {
    const titleInput = this.querySelector("#comment-title");
    const descInput = this.querySelector("#comment-desc");

    const title = titleInput?.value?.trim();
    const desc = descInput?.value?.trim();

    if (!title || !desc) {
      alert("Please fill in all required fields");
      return;
    }

    const dbWorker = window.dbWorker;
    if (!dbWorker) {
      alert("Database not available");
      return;
    }

    const commentData = {
      comment_id: Date.now(),
      comment_title: title,
      comment_desc: desc,
      lead_id: this.leadId,
      created_on: new Date(),
    };

    try {
      await this.createComment(commentData, dbWorker);
      this.closeModal();
      this.loadCommentsData();
      this.showNotification("Comment added successfully!", "success");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment: " + error.message);
    }
  }

  createComment(commentData, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, error, storeName } = e.data;

        if (action === "insertSuccess" && storeName === "Comments") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve();
        } else if (action === "insertError" && storeName === "Comments") {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error(error || "Failed to create comment"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "createComment",
        commentData,
        storeName: "Comments",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  async handleDeleteComment(commentId) {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const dbWorker = window.dbWorker;
    if (!dbWorker) {
      alert("Database not available");
      return;
    }

    try {
      await this.deleteComment(commentId, dbWorker);
      this.loadCommentsData();
      this.showNotification("Comment deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Error deleting comment: " + error.message);
    }
  }

  deleteComment(commentId, dbWorker) {
    return new Promise((resolve, reject) => {
      const messageHandler = (e) => {
        const { action, error, storeName } = e.data;

        if (action === "deleteSuccess" && storeName === "Comments") {
          dbWorker.removeEventListener("message", messageHandler);
          resolve();
        } else if (action === "deleteError" && storeName === "Comments") {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error(error || "Failed to delete comment"));
        }
      };

      dbWorker.addEventListener("message", messageHandler);
      dbWorker.postMessage({
        action: "deleteComment",
        id: commentId,
        storeName: "Comments",
      });

      setTimeout(() => {
        dbWorker.removeEventListener("message", messageHandler);
        reject(new Error("Request timeout"));
      }, 5000);
    });
  }

  showNotification(message, type = "info") {
    // Simple notification - you can enhance this
    const notification = document.createElement("div");
    notification.className = `fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg transition-all transform translate-x-0 z-50 ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "error"
          ? "bg-red-500 text-white"
          : "bg-blue-500 text-white"
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define("comments-content", CommentsContent);
