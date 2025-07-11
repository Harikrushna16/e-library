import axios from "axios";
import useTokenStore from "@/store";

const api = axios.create({
  // todo: move this value to env variable.
  baseURL: "http://localhost:8416",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useTokenStore.getState().token;
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (data: { email: string; password: string }) =>
  api.post("/api/users/login", data);

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/api/users/register", data);

export const getBooks = async () => api.get("/api/books");

export const createBook = async (data: FormData) =>
  api.post("/api/books", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getBookById = async (id: string) => api.get(`/api/books/${id}`);

export const updateBook = async (id: string, data: FormData) =>
  api.patch(`/api/books/${id}`, data);

export const deleteBook = async (id: string) => api.delete(`/api/books/${id}`);
