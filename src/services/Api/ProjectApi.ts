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

export const AssignEditorToBookAPI = async (payload: { editor_id: number; book_id: number }) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}admin/op/editors/assign/book`, payload, {
    headers: { "x-access-token": token },
  });
};

export const GenerateCoverAPI = (payload: {
  title: string;
  genre: string;
  author: string;
  size: string;
  direction: string;
}) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `${API_BASE_URL}chapters/generate/cover`,
    payload,
    { headers: { "x-access-token": token } }
  );
};

export const UpdateBookCoverAPI = (payload: {
  book_id: number;
  title: string;
  author: string;
  genre_id: number;
  cover_img_name: string;
  description?: string;
}) => {
  const token = localStorage.getItem("token");
  return axios.put(
    `${API_BASE_URL}books`,
    payload,
    { headers: { "x-access-token": token } }
  );
};


