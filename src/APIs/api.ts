import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:8416",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

export const login = async (data: { email: string; password: string }) =>
  api.post("/api/users/login", data);
