import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.turningpages.io:9090/api/v1/";


export const GetAllProjectsAPI = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}admin/op/projects`, {
    headers: { "x-access-token": token },
  });
};

export const GetProjectDetailsAPI = async (id: string | number) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}admin/op/projects/${id}`, {
    headers: { "x-access-token": token },
  });
};

export const GetAllEditingQueueAPI = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}admin/op/books/editing/queue`, {
    headers: { "x-access-token": token },
  });
};

