class User {
  constructor() {
    this._authToken = null;
    this._role = null;
    this._user_id = null;
    this._user_name = null;
    this._tenant_id = null;
  }

  initialize() {
    const userDetails = JSON.parse(localStorage.getItem("user"));
    this._authToken = userDetails.authToken;
    this._role = userDetails.role;
    this._user_id = userDetails.user_id;
    this._user_name = userDetails.user_name;
    this._tenant_id = userDetails._tenant_id;
  }

  destroy() {
    this._authToken = null;
    this._role = null;
    this._user_id = null;
    this._user_name = null;
    this._tenant_id = null;
  }

  isAdmin() {
    return this._role == "admin";
  }

  isSuperAdmin() {
    return this._role == "super_admin";
  }

  get id() {
    return this._user_id;
  }

  get tenant_id() {
    return this._tenant_id;
  }

  get role() {
    return this._role;
  }

  get exists() {
    return this._authToken !== null;
  }

  get name() {
    return this._user_name;
  }
}

const user = new User();

export { user as default };
