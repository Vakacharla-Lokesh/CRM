import { updateUserDetails } from "../events/userProfile";

export class SidebarManager {
  constructor() {
    this.sidebar = null;
    updateUserDetails();
  }

  getSidebar() {
    this.sidebar = document.getElementById("default-sidebar");
    return this.sidebar;
  }

  // Sidebar toggling removed - sidebar is now added in routes where necessary

  updateActive(path) {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const sidebarElement = document.getElementById("sidebar");

      if (!sidebarElement) {
        console.warn("Sidebar navigation element not found");
        return;
      }

      const links = sidebarElement.querySelectorAll("a[href]");

      links.forEach((link) => {
        const linkPath = link.getAttribute("href");

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
    }, 0);
  }

  isAdmin(role) {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const sidebarElement = document.getElementById("sidebar");
      const usersTab = document.querySelector("#data-users-list");
      const tenantsTab = document.querySelector("#data-tenants-list");

      if (role === "admin") {
        usersTab?.classList.remove("hidden");
        tenantsTab?.classList.add("hidden");
      } else if (role === "super_admin") {
        usersTab?.classList.remove("hidden");
        tenantsTab?.classList.remove("hidden");
      } else {
        usersTab?.classList.add("hidden");
        tenantsTab?.classList.add("hidden");
      }
    }, 0);
  }
}
