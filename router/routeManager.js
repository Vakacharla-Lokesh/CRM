export class RouteManager {
  constructor() {
    this.routes = {
      "/": "/pages/home.html",
      "/home": "/pages/home.html",
      "/leads": "/pages/leads.html",
      "/organizations": "/pages/organizations.html",
      "/deals": "/pages/deals.html",
      "/leadDetails": "/pages/leadDetailPage.html",
      "/login": "/pages/login.html",
      "/signup": "/pages/signup.html",
      "/users": "/pages/users.html",
    };

    this.routeScripts = {
      "/login": "/js/login.js",
      "/signup": "/js/signup.js",
      "/deals": "/js/deals.js",
    };
  }

  isValidRoute(path) {
    return this.routes.hasOwnProperty(path);
  }

  getRoutePath(path) {
    return this.routes[path] || this.routes["/home"];
  }

  getRouteScript(path) {
    return this.routeScripts[path] || null;
  }

  resolvePath(path, user) {
    if (user) {
      return this.getRoutePath(path);
    } else {
      return this.routes["/login"];
    }
  }

  isAuthRequired(path) {
    return path !== "/login" && path !== "/signup";
  }

  isPublicRoute(path) {
    return path === "/login" || path === "/signup";
  }
}
