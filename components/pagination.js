const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
  </style>
  
  <div class="flex items-center justify-between mt-6 px-6 py-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <!-- Left side: Items info -->
    <div class="text-sm text-gray-600 dark:text-gray-400">
      Showing <span id="start-item" class="font-semibold text-gray-900 dark:text-white">1</span> 
      to <span id="end-item" class="font-semibold text-gray-900 dark:text-white">10</span> 
      of <span id="total-items" class="font-semibold text-gray-900 dark:text-white">0</span> results
    </div>

    <!-- Center: Page size selector -->
    <div class="flex items-center gap-2">
      <label for="page-size" class="text-sm text-gray-600 dark:text-gray-400">
        Items per page:
      </label>
      <select 
        id="page-size"
        class="px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="5">5</option>
        <option value="10" selected>10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>

    <!-- Right side: Pagination buttons -->
    <div class="flex items-center gap-2">
      <button 
        id="prev-btn"
        class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Previous page"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <div id="page-numbers" class="flex gap-1">
        <!-- Page buttons will be inserted here -->
      </div>

      <button 
        id="next-btn"
        class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Next page"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
`;

class Pagination extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.cloneNode(true));

    this.currentPage = 1;
    this.pageSize = 10;
    this.totalItems = 0;
    this.totalPages = 0;
    this.tableBodyId = "";
    this.allData = [];
    this.filteredData = [];

    this._isReady = false;
    this._pendingInit = null;
    this._currentSearchTerm = "";
  }

  connectedCallback() {
    this._isReady = true;
    this.setupEventListeners();
    this.renderPagination();
    if (this._pendingInit) {
      const { tableBodyId, data } = this._pendingInit;
      this._pendingInit = null;
      this._doInitialize(tableBodyId, data);
    }
  }

  setupEventListeners() {
    const prevBtn = this.shadowRoot.getElementById("prev-btn");
    const nextBtn = this.shadowRoot.getElementById("next-btn");
    const pageSizeSelect = this.shadowRoot.getElementById("page-size");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.goToPreviousPage());
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.goToNextPage());
    }
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", (e) => {
        this.pageSize = parseInt(e.target.value);
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        this.renderPagination();
        this.displayCurrentPage();
      });
    }
  }

  /**
   * Initialize pagination with table data
   * @param {string} tableBodyId - The ID of the table tbody element
   * @param {Array} data - The full array of data
   */
  initialize(tableBodyId, data = []) {
    if (!this._isReady) {
      this._pendingInit = { tableBodyId, data };
      return;
    }

    this._doInitialize(tableBodyId, data);
  }

  /**
   * Internal initialization logic
   */
  _doInitialize(tableBodyId, data = []) {
    const pageNumbers = this.shadowRoot.getElementById("page-numbers");
    if (!pageNumbers) {
      setTimeout(() => this._doInitialize(tableBodyId, data), 10);
      return;
    }

    this.tableBodyId = tableBodyId;
    this.allData = [...data];
    this.filteredData = [...data];
    this._currentSearchTerm = "";
    this.totalItems = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    this.currentPage = 1;
    this.renderPagination();
    this.displayCurrentPage();
  }

  /**
   * Update data (useful when data is refreshed from database)
   * @param {Array} data - The new array of data
   */
  updateData(data) {
    if (!this._isReady) {
      this._pendingInit = { tableBodyId: this.tableBodyId, data };
      return;
    }

    this.allData = [...data];
    this.filteredData = [...data];
    this._currentSearchTerm = ""; // Reset search term
    this.totalItems = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    this.currentPage = 1;
    this.renderPagination();
    this.displayCurrentPage();
  }

  /**
   * Filter data based on search term
   * This is the key method that works with TableFilter
   */
  filterData(searchTerm) {
    if (!this._isReady) {
      return;
    }

    // Store the search term for later use
    this._currentSearchTerm = searchTerm;

    if (!searchTerm.trim()) {
      // Clear filter - show all data
      this.filteredData = [...this.allData];
    } else {
      // Filter based on search term
      const term = searchTerm.toLowerCase();
      this.filteredData = this.allData.filter((item) => {
        const text = JSON.stringify(item).toLowerCase();
        return text.includes(term);
      });
    }

    // Reset to first page when filtering
    this.totalItems = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    this.currentPage = 1;
    this.renderPagination();
    this.displayCurrentPage();

    // Dispatch event to notify about data change
    this.dispatchEvent(
      new CustomEvent("dataFiltered", {
        detail: {
          filteredData: this.filteredData,
          searchTerm: searchTerm,
        },
      }),
    );
  }

  /**
   * Display the current page's data
   * This method filters the DOM based on which rows should be visible
   */
  displayCurrentPage() {
    if (!this._isReady || !this.tableBodyId) {
      return;
    }

    const tbody = document.getElementById(this.tableBodyId);
    if (!tbody) {
      return;
    }

    // Get all data rows (excluding empty state rows)
    const allRows = Array.from(tbody.querySelectorAll("tr")).filter(
      (row) =>
        !row.classList.contains("filter-empty-state") &&
        !row.classList.contains("pagination-empty-state"),
    );

    const totalItems = this.filteredData.length;

    // Handle empty state
    if (totalItems === 0) {
      allRows.forEach((row) => (row.style.display = "none"));
      this.renderEmptyState(tbody);
      this.updatePaginationInfo(0, 0, 0);
      return;
    }

    // Remove any existing empty state
    const existingEmptyState = tbody.querySelector(".pagination-empty-state");
    if (existingEmptyState) {
      existingEmptyState.remove();
    }

    // Calculate which items to show on this page
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, totalItems);
    const currentPageData = this.filteredData.slice(startIndex, endIndex);

    // Hide all rows first
    allRows.forEach((row) => (row.style.display = "none"));

    // Show only rows that match the current page data
    currentPageData.forEach((dataItem) => {
      // Find the matching row in the DOM
      const matchingRow = allRows.find((row) => {
        const rowId =
          row.getAttribute("data-lead-id") ||
          row.getAttribute("data-deal-id") ||
          row.getAttribute("data-organization-id") ||
          row.getAttribute("data-user-id") ||
          row.getAttribute("data-id");

        const dataId =
          dataItem.lead_id ||
          dataItem.deal_id ||
          dataItem.organization_id ||
          dataItem.user_id ||
          dataItem.id;

        return rowId && dataId && String(rowId) === String(dataId);
      });

      if (matchingRow) {
        matchingRow.style.display = "";
      }
    });

    // Update the info text
    this.updatePaginationInfo(startIndex, endIndex, totalItems);

    // Dispatch page change event
    this.dispatchEvent(
      new CustomEvent("pageChanged", {
        detail: {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          totalItems: totalItems,
          startIndex: startIndex,
          endIndex: endIndex,
          currentPageData: currentPageData,
        },
      }),
    );
  }

  renderEmptyState(tbody) {
    const existingEmptyState = tbody.querySelector(".pagination-empty-state");
    if (!existingEmptyState) {
      const tr = document.createElement("tr");
      tr.className = "pagination-empty-state";
      const colspan = tbody.parentElement.querySelectorAll("th").length;
      tr.innerHTML = `
        <td colspan="${colspan}" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p class="text-sm font-medium">No results found</p>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  updatePaginationInfo(startIndex, endIndex, totalRows) {
    const startItem = this.shadowRoot.getElementById("start-item");
    const endItem = this.shadowRoot.getElementById("end-item");
    const totalItemsElement = this.shadowRoot.getElementById("total-items");

    if (!startItem || !endItem || !totalItemsElement) {
      return;
    }

    if (totalRows === 0) {
      startItem.textContent = "0";
      endItem.textContent = "0";
      totalItemsElement.textContent = "0";
    } else {
      startItem.textContent = String(startIndex + 1);
      endItem.textContent = String(endIndex);
      totalItemsElement.textContent = String(totalRows);
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderPagination();
      this.displayCurrentPage();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderPagination();
      this.displayCurrentPage();
    }
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.renderPagination();
      this.displayCurrentPage();
    }
  }

  renderPagination() {
    if (!this._isReady || !this.shadowRoot) {
      return;
    }

    const pageNumbersContainer = this.shadowRoot.getElementById("page-numbers");
    if (!pageNumbersContainer) {
      return;
    }

    this.updateButtonStates();
    this.renderPageNumbers();
  }

  updateButtonStates() {
    const prevBtn = this.shadowRoot.getElementById("prev-btn");
    const nextBtn = this.shadowRoot.getElementById("next-btn");

    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1 || this.totalPages === 0;
    }
    if (nextBtn) {
      nextBtn.disabled =
        this.currentPage === this.totalPages || this.totalPages === 0;
    }
  }

  renderPageNumbers() {
    const pageNumbersContainer = this.shadowRoot.getElementById("page-numbers");

    if (!pageNumbersContainer) {
      return;
    }

    pageNumbersContainer.innerHTML = "";

    if (this.totalPages === 0) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page button
    if (startPage > 1) {
      const firstPageBtn = this.createPageButton(1, "1");
      pageNumbersContainer.appendChild(firstPageBtn);

      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "px-2 py-1 text-gray-500 dark:text-gray-400";
        ellipsis.textContent = "...";
        pageNumbersContainer.appendChild(ellipsis);
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = this.createPageButton(i, String(i));
      pageNumbersContainer.appendChild(pageBtn);
    }

    // Last page button
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "px-2 py-1 text-gray-500 dark:text-gray-400";
        ellipsis.textContent = "...";
        pageNumbersContainer.appendChild(ellipsis);
      }

      const lastPageBtn = this.createPageButton(
        this.totalPages,
        String(this.totalPages),
      );
      pageNumbersContainer.appendChild(lastPageBtn);
    }
  }

  createPageButton(pageNum, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className =
      pageNum === this.currentPage
        ? "px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg transition-colors"
        : "px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors";

    button.addEventListener("click", () => this.goToPage(pageNum));
    return button;
  }

  getState() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(
      this.currentPage * this.pageSize,
      this.filteredData.length,
    );

    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalItems: this.filteredData.length,
      totalPages: this.totalPages,
      startIndex: startIndex,
      endIndex: endIndex,
      currentPageData: this.filteredData.slice(startIndex, endIndex),
      isFiltered: this._currentSearchTerm !== "",
    };
  }

  /**
   * Get current page data
   */
  getCurrentPageData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.filteredData.length,
    );
    return this.filteredData.slice(startIndex, endIndex);
  }

  /**
   * Reset pagination to first page
   */
  reset() {
    this.currentPage = 1;
    this._currentSearchTerm = "";
    this.filteredData = [...this.allData];
    this.totalItems = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    this.renderPagination();
    this.displayCurrentPage();
  }
}

customElements.define("pagination-component", Pagination);
