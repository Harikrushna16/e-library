import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:5513",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

export const login = async (data: { email: string; password: string }) => {
  return api.post("/auth/users/login", data);
};
