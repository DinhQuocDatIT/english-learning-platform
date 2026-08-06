class AuthStorage {
  static setToken(token) {
    localStorage.setItem("token", token);
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static setUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  static getUser() {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  }

  static getRole() {
    const user = this.getUser();

    return user?.role || null;
  }

  static removeAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}

export default AuthStorage;
