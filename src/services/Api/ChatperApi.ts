import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.turningpages.io:9090/api/v1/";



export const GetProjectDetailsAPI = async (id: string | number) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}admin/op/projects/${id}`, {
    headers: { "x-access-token": token },
  });
};

export const GetChapterById = async (id: string | number) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}chapters${id}`, {
    headers: { "x-access-token": token },
  });
};

export const CreateChapter = (payload) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}chapters/create/admin`, payload, {
    headers: { "x-access-token": token },
  });
};

export const UpdateChapter = (payload) => {
  const token = localStorage.getItem("token");
  return axios.patch(`${API_BASE_URL}chapters/update/admin`, payload, {
    headers: { "x-access-token": token },
  });
};

export const DeleteChapter = (id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${API_BASE_URL}chapters/remove/admin/${id}`, {
    headers: { "x-access-token": token },
  });
};

// tools
export const PlagiarismCheck = (payload) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}books/plagiarism/check/admin`, payload, {
    headers: { "x-access-token": token },
  });
};

export const FactChecking = (payload) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}books/fact/check/admin`, payload, {
    headers: { "x-access-token": token },
  });
};

export const ConsistencyCheck = (payload) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}books/consistency/check/admin`, payload, {
    headers: { "x-access-token": token },
  });
};

export const GenerateSummary = (payload) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}books/chapter/summerize/admin`, payload, {
    headers: { "x-access-token": token },
  });
};

export const UpdateBookStatus = async (payload) => {
  const token = localStorage.getItem("token");
  return await axios.post(`${API_BASE_URL}admin/op/book/submission/update`, payload,{
    headers: { "x-access-token": token },
  });
};