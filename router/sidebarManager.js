export class SidebarManager {
  constructor() {
    this.sidebar = null;
  }

  getSidebar() {
    if (!this.sidebar) {
      this.sidebar = document.getElementById("default-sidebar");
    }
    return this.sidebar;
  }

  toggleSidebar(routePath) {
    const sidebar = this.getSidebar();

    if (!sidebar) return;

    const isPublicRoute =
      routePath === "/pages/login.html" || routePath === "/pages/signup.html";

    if (isPublicRoute) {
      sidebar.classList.add("hidden");
    } else {
      sidebar.classList.remove("hidden");
    }
  }

  updateActiveState(path) {
    const sidebarElement = document.getElementById("sidebar");

    if (!sidebarElement) return;
    
    const links = sidebarElement.querySelectorAll("a[data-link]");

    links.forEach((link) => {
      const linkPath = link.getAttribute("data-link");

      if (linkPath === path) {
        link.classList.remove("text-gray-700", "dark:text-gray-300");
        link.classList.add(
          "bg-blue-100",
          "dark:bg-blue-900",
          "text-blue-600",
          "dark:text-blue-300",
          "font-medium",
        );
      } else {
        link.classList.remove(
          "bg-blue-100",
          "dark:bg-blue-900",
          "text-blue-600",
          "dark:text-blue-300",
          "font-medium",
        );
        link.classList.add("text-gray-700", "dark:text-gray-300");
      }
    });
  }
}
