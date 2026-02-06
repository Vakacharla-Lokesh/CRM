class ExportProgress extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 h-10 flex items-center justify-between gap-3">
        <div class="flex-1">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div class="bar h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300 w-0"></div>
          </div>
        </div>
        <p class="text text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">0%</p>
      </div>
    `;

    let progress = 0;
    const bar = this.querySelector(".bar");
    const text = this.querySelector(".text");

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        text.textContent = "Done";
        text.classList.add("text-green-600", "dark:text-green-400");

        if (this.onComplete && typeof this.onComplete === "function") {
          this.onComplete();
        }

        setTimeout(() => {
          if (this.onCleanup && typeof this.onCleanup === "function") {
            this.onCleanup();
          }
          this.remove();
        }, 1000);
      } else {
        text.textContent = `${progress}%`;
      }

      bar.style.width = progress + "%";
    }, 200);
  }
}

customElements.define("export-progress", ExportProgress);
