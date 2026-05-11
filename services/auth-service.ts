// Dummy auth service structure
export const AuthService = {
  async login(credentials: any) {
    // Logic for JWT login
    return { user: { id: "1", name: "Alex" }, token: "jwt-token" };
  },
  async logout() {
    // Logic for logout
  }
}
