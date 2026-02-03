/**
 * Notification Controller - Handles toast notifications and form errors
 * Provides visual feedback for user actions
 */

let toastContainer = null;
let toastIdCounter = 0;

/**
 * Initialize toast container if it doesn't exist
 */
function initToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-20 right-4 z-[9999] flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export const notificationController = {
  /**
   * Show toast notification (top-right corner)
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'info', 'warning'
   */
  showToast(message, type = 'info') {
    const container = initToastContainer();
    const toastId = `toast-${toastIdCounter++}`;
    
    // Color schemes based on type
    const colorSchemes = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    };
    
    // Icons for each type
    const icons = {
      success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>`,
      error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>`,
      warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>`,
      info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`
    };
    
    const colorScheme = colorSchemes[type] || colorSchemes.info;
    const icon = icons[type] || icons.info;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `
      ${colorScheme}
      w-80 px-4 py-4 rounded-lg shadow-lg 
      flex items-center gap-3
      transform translate-x-full
      transition-transform duration-300 ease-out
    `;
    
    toast.innerHTML = `
      <div class="flex-shrink-0">
        ${icon}
      </div>
      <div class="flex-1 text-sm font-medium">
        ${message}
      </div>
      <button class="flex-shrink-0 hover:opacity-75 transition-opacity" onclick="this.parentElement.remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    `;
    
    container.appendChild(toast);
    
    // Trigger slide-in animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
      });
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  },
  
  /**
   * Show inline form error
   * @param {string} formId - Form element ID
   * @param {string} message - Error message
   */
  showFormError(formId, message) {
    const form = document.getElementById(formId);
    if (!form) {
      console.warn(`Form #${formId} not found`);
      return;
    }
    
    // Remove existing error if any
    this.clearFormErrors(formId);
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg';
    errorDiv.innerHTML = `
      <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        ${message}
      </p>
    `;
    
    // Find submit button and insert error before it
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.parentElement.insertBefore(errorDiv, submitBtn);
    } else {
      form.appendChild(errorDiv);
    }
  },
  
  /**
   * Clear form errors
   * @param {string} formId - Form element ID
   */
  clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const errors = form.querySelectorAll('.form-error');
    errors.forEach(error => error.remove());
  }
};
