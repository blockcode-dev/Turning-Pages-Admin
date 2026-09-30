// GenreApi.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.turningpages.io/api/v1/";

export const GetAllGenresAPI = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}genres`, {
    headers: { "x-access-token": token },
  });
};

export const AddGenreAPI = (payload: { title: string }) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_BASE_URL}genres`, payload, {
    headers: { "x-access-token": token },
  });
};

export const UpdateGenreAPI = (id: number | string, payload: { title: string }) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API_BASE_URL}genres/${id}`, payload, {
    headers: { "x-access-token": token },
  });
};

export const DeleteGenreAPI = (id: number | string) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${API_BASE_URL}genres/${id}`, {
    headers: { "x-access-token": token },
  });
};
