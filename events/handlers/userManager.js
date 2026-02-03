class UserManager {
  constructor() {
    this.user = null;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  setUser(user) {
    this.user = user;
    this.isInitialized = true;
    localStorage.setItem("user", JSON.stringify(user));
  }

  clearUser() {
    this.user = null;
    this.isInitialized = true;
    localStorage.removeItem("user");
  }

  getUser() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.user;
  }

  isAuthenticated() {
    return Boolean(this.getUser());
  }
}

const userManager = new UserManager();

export default userManager;
