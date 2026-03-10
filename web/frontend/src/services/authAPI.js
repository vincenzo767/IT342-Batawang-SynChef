import axios from "axios";
const API_BASE_URL = "/api";
const authAPI = {
  register: (data) => axios.post(`${API_BASE_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_BASE_URL}/auth/login`, data),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
var authAPI_default = authAPI;
export {
  authAPI_default as default
};
