import { API_BASE_URL } from "../http";

export const AuthAPI = {
  async login(formData: URLSearchParams) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      let message = "Login failed";
      try {
        const data = await response.json();
        message = data.detail ?? message;
      } catch {}
      throw new Error(message);
    }

    return response.json(); // { access_token, token_type }
  },

  logout() {
    localStorage.removeItem("token");
  },
};
