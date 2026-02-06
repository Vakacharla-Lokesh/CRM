import userManager from "../events/handlers/userManager.js";

(function () {
  "use strict";
  class TableFilter {
    constructor(tableBodyId, filterInputId) {
      this.tbody = document.getElementById(tableBodyId);
      this.filterInput = document.getElementById(filterInputId);
      this.table = this.tbody?.closest("table");

      if (this.filterInput && this.tbody) {
        this.setupFilter();
      }
    }

    debounce = (func, delay) => {
      let timerId;
      return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => func(...args), delay);
      };
    };

    performSearch = (searchTerm) => {
      this.filterRows(searchTerm);
    };

    debouncedSearch = this.debounce(this.performSearch, 500);

    setupFilter() {
      this.filterInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        this.debouncedSearch(searchTerm);
      });
    }

    filterRows(searchTerm) {
      const rows = this.tbody.querySelectorAll("tr");
      let visibleCount = 0;

      rows.forEach((row) => {
        if (
          row.querySelector("td[colspan]") ||
          row.classList.contains("filter-empty-state")
        ) {
          return;
        }

        const text = row.textContent.toLowerCase();
        const matches = text.includes(searchTerm);

        if (matches) {
          row.style.display = "";
          visibleCount++;
        } else {
          row.style.display = "none";
        }
      });

      this.updateEmptyState(visibleCount, searchTerm);
    }

    updateEmptyState(visibleCount, searchTerm) {
      const existingEmptyState = this.tbody.querySelector(
        ".filter-empty-state",
      );

      if (visibleCount === 0 && searchTerm) {
        if (!existingEmptyState) {
          const colspan = this.table.querySelectorAll("thead th").length;
          const emptyRow = document.createElement("tr");
          emptyRow.className = "filter-empty-state";
          emptyRow.innerHTML = `
            <td colspan="${colspan}" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p class="text-sm font-medium">No results found for "${this.escapeHtml(searchTerm)}"</p>
              <p class="text-xs mt-1">Try adjusting your search terms</p>
            </td>
          `;
          this.tbody.appendChild(emptyRow);
        }
      } else if (existingEmptyState) {
        existingEmptyState.remove();
      }
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }
  class BulkDeleteManager {
    constructor(path) {
      this.tableBodyId = path.tableBodyId;
      this.selectAllId = path.selectAllId;
      this.bulkDeleteBtnId = path.bulkDeleteBtnId;
      this.itemCheckboxClass = path.itemCheckboxClass || "item-checkbox";
      this.storeName = path.storeName;

      this.selectAllCheckbox = document.getElementById(this.selectAllId);
      this.bulkDeleteBtn = document.getElementById(this.bulkDeleteBtnId);
      this.tbody = document.getElementById(this.tableBodyId);
      this.table = this.tbody?.closest("table");

      if (this.selectAllCheckbox && this.bulkDeleteBtn && this.tbody) {
        this.init();
      }
    }

    init() {
      console.log("Inside init of bulk delete: ");
      this.bulkDeleteBtn.style.display = "none";
      this.selectAllCheckbox.addEventListener("change", (e) => {
        this.toggleAllCheckboxes(e.target.checked);
        this.updateBulkDeleteButton();
      });
      this.tbody.addEventListener("change", (e) => {
        if (e.target.classList.contains(this.itemCheckboxClass)) {
          this.updateSelectAllState();
          this.updateBulkDeleteButton();
        }
      });
      this.bulkDeleteBtn.addEventListener("click", () => {
        this.handleBulkDelete();
      });
    }

    toggleAllCheckboxes(checked) {
      const checkboxes = this.getVisibleItemCheckboxes();
      checkboxes.forEach((cb) => {
        cb.checked = checked;
      });
    }

    updateSelectAllState() {
      const checkboxes = this.getVisibleItemCheckboxes();
      const allChecked =
        checkboxes.length > 0 &&
        Array.from(checkboxes).every((cb) => cb.checked);
      const someChecked = Array.from(checkboxes).some((cb) => cb.checked);

      this.selectAllCheckbox.checked = allChecked;
      this.selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }

    updateBulkDeleteButton() {
      const selectedCount = this.getSelectedCount();

      if (selectedCount > 0) {
        this.bulkDeleteBtn.style.display = "inline-flex";
        this.bulkDeleteBtn.innerHTML = `
          <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Delete (${selectedCount})
        `;
      } else {
        this.bulkDeleteBtn.style.display = "none";
      }
    }

    getVisibleItemCheckboxes() {
      const checkboxes = this.tbody.querySelectorAll(
        `.${this.itemCheckboxClass}`,
      );
      return Array.from(checkboxes).filter((cb) => {
        const row = cb.closest("tr");
        return row && row.style.display !== "none";
      });
    }

    getSelectedCheckboxes() {
      return Array.from(this.getVisibleItemCheckboxes()).filter(
        (cb) => cb.checked,
      );
    }

    getSelectedCount() {
      return this.getSelectedCheckboxes().length;
    }

    getSelectedIds() {
      return this.getSelectedCheckboxes()
        .map((cb) => {
          if (cb.value && cb.value !== "on") {
            return cb.value;
          }

          const row = cb.closest("tr");
          if (row) {
            const datasetKey = Object.keys(row.dataset).find((key) =>
              key.toLowerCase().includes("id"),
            );
            if (datasetKey) {
              return row.dataset[datasetKey];
            }
          }

          return null;
        })
        .filter(Boolean);
    }

    async handleBulkDelete() {
      const selectedIds = this.getSelectedIds();

      if (selectedIds.length === 0) {
        this.showNotification("No items selected", "error");
        return;
      }

      const itemName = this.storeName.slice(0, -1).toLowerCase();
      const confirmMessage = `Are you sure you want to delete ${selectedIds.length} ${itemName}(s)?\n\nThis action cannot be undone.`;

      if (!confirm(confirmMessage)) {
        return;
      }

      const dbWorker = window.dbWorker;
      if (!dbWorker) {
        this.showNotification("Database not available", "error");
        return;
      }

      const originalHTML = this.bulkDeleteBtn.innerHTML;
      this.bulkDeleteBtn.disabled = true;
      this.bulkDeleteBtn.innerHTML = `
        <svg class="animate-spin h-4 w-4 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Deleting...
      `;

      let successCount = 0;
      let errorCount = 0;

      try {
        for (const id of selectedIds) {
          try {
            await this.deleteItem(id, dbWorker);
            successCount++;
          } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
            errorCount++;
          }
        }

        if (errorCount === 0) {
          this.showNotification(
            `Successfully deleted ${successCount} item(s)`,
            "success",
          );
        } else {
          this.showNotification(
            `Deleted ${successCount} item(s), ${errorCount} failed`,
            "error",
          );
        }

        this.refreshTable(dbWorker);

        this.selectAllCheckbox.checked = false;
        this.selectAllCheckbox.indeterminate = false;
        this.updateBulkDeleteButton();
      } catch (error) {
        console.error("Bulk delete error:", error);
        this.showNotification(`Error: ${error.message}`, "error");
      } finally {
        this.bulkDeleteBtn.disabled = false;
        this.bulkDeleteBtn.innerHTML = originalHTML;
      }
    }

    deleteItem(id, dbWorker) {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          dbWorker.removeEventListener("message", messageHandler);
          reject(new Error("Request timeout"));
        }, 5000);

        const messageHandler = (e) => {
          const { action, error, storeName, id: deletedId } = e.data;

          if (storeName === this.storeName) {
            if (action === "deleteSuccess") {
              clearTimeout(timeoutId);
              dbWorker.removeEventListener("message", messageHandler);
              resolve();
            } else if (action === "deleteError") {
              clearTimeout(timeoutId);
              dbWorker.removeEventListener("message", messageHandler);
              reject(new Error(error || "Delete failed"));
            }
          }
        };

        dbWorker.addEventListener("message", messageHandler);

        const actionName = `delete${this.storeName.slice(0, -1)}`;

        dbWorker.postMessage({
          action: actionName,
          id: id,
          storeName: this.storeName,
        });
      });
    }

    refreshTable(dbWorker) {
      const user = userManager.getUser();
      if (!user) {
        this.showNotification("Please sign in again.", "error");
        return;
      }
      const actionName = `getAll${this.storeName}`;
      const allCheckboxes = this.tbody.querySelectorAll(
        `.${this.itemCheckboxClass}`,
      );
      allCheckboxes.forEach((cb) => (cb.checked = false));
      this.selectAllCheckbox.checked = false;
      this.selectAllCheckbox.indeterminate = false;
      this.bulkDeleteBtn.style.display = "none";

      dbWorker.postMessage({
        action: actionName,
        tenant_id: user.tenant_id,
        role: user.role,
      });
    }

    showNotification(message, type = "info") {
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
  }
  function initializeTableFeatures(currentPathParam) {
    let currentPath;
    if (typeof currentPathParam === "string") {
      currentPath = currentPathParam;
    } else {
      currentPath = sessionStorage.getItem("currentTab");
    }
    console.log("Inside initializeTableFeatures: ", currentPath);
    const safeInitialize = (
      page,
      tableBodyId,
      searchInputId,
      selectAllId,
      bulkDeleteBtnId,
      storeName,
    ) => {
      const maxRetries = 5;
      let retryCount = 0;
      const attemptInit = () => {
        const searchInput = document.getElementById(searchInputId);
        const tbody = document.getElementById(tableBodyId);

        if (searchInput && tbody) {
          new TableFilter(tableBodyId, searchInputId);
          new BulkDeleteManager({
            tableBodyId: tableBodyId,
            selectAllId: selectAllId,
            bulkDeleteBtnId: bulkDeleteBtnId,
            itemCheckboxClass: "item-checkbox",
            storeName: storeName,
          });
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptInit, 100);
        } else {
          console.warn(
            `Failed to initialize features for ${page} - elements not found`,
          );
        }
      };

      attemptInit();
    };

    // LEADS PAGE
    if (currentPath === "/leads") {
      console.log("Inside leads initialize: ");
      safeInitialize(
        "/leads",
        "leads-body",
        "leads-search-input",
        "select-all-leads",
        "bulk-delete-leads",
        "Leads",
      );
    }

    // ORGANIZATIONS PAGE
    if (currentPath === "/organizations") {
      safeInitialize(
        "/organizations",
        "organizations-body",
        "organizations-search-input",
        "select-all-organizations",
        "bulk-delete-organizations",
        "Organizations",
      );
    }

    // DEALS PAGE
    if (currentPath === "/deals") {
      safeInitialize(
        "/deals",
        "deals-body",
        "deals-search-input",
        "select-all-deals",
        "bulk-delete-deals",
        "Deals",
      );
    }

    // USERS PAGE
    if (currentPath === "/users") {
      safeInitialize(
        "/users",
        "users-body",
        "users-search-input",
        "select-all-users",
        "bulk-delete-users",
        "Users",
      );
    }

    // TENANTS PAGE
    if (currentPath === "/tenants") {
      safeInitialize(
        "/tenants",
        "tenants-body",
        "tenants-search-input",
        "select-all-tenants",
        "bulk-delete-tenants",
        "Tenants",
      );
    }
  }
  document.addEventListener("DOMContentLoaded", initializeTableFeatures);

  window.addEventListener("popstate", () => {
    setTimeout(initializeTableFeatures, 100);
  });

  window.TableFeatures = {
    TableFilter,
    BulkDeleteManager,
    initialize: initializeTableFeatures,
  };
})();
