import axios from "axios";
import { getToken, logout } from "./auth";

const BASE = "http://127.0.0.1:8000/api";

// Add token to every request automatically
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export const uploadJudgment = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(`${BASE}/upload`, formData);
  return res.data;
};

export const getRecord = async (id: string) => {
  const res = await axios.get(`${BASE}/records/${id}`);
  return res.data;
};

export const getAllRecords = async () => {
  const res = await axios.get(`${BASE}/records`);
  return res.data;
};

export const verifyRecord = async (
  id: string,
  status: string,
  notes: string,
  editedPlan?: object
) => {
  const res = await axios.post(`${BASE}/records/${id}/verify`, {
    status,
    reviewer_notes: notes,
    edited_action_plan: editedPlan || null,
  });
  return res.data;
};

export const getDashboard = async (department?: string) => {
  const url = department
    ? `${BASE}/dashboard?department=${department}`
    : `${BASE}/dashboard`;
  const res = await axios.get(url);
  return res.data;
};