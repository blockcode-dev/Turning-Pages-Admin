import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.turningpages.io:9090/api/v1/";


export const GetAllEditorsAPI = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}admin/op/editors`, {
    headers: { "x-access-token": token },
  });
};

export const GetUserDetailsAPI = async (userId: number) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}admin/op/users/details/${userId}`, {
    headers: { "x-access-token": token },
  });
};


export const GetEditorStatsAPI = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE_URL}admin/op/stats/editors`, {
    headers: { "x-access-token": token },
  });
};

export const UpdateEditorStatusAPI = async (payload: { editorId: number; status: string }) => {
  const token = localStorage.getItem("token");
  return axios.patch(
    `${API_BASE_URL}admin/op/editor/status`,
    payload,
    {
      headers: { "x-access-token": token },
    }
  );
};
export const AddEditorAPI = (payload: { name: string; email: string; role_id: number; department_id: number }) => {
  const token = localStorage.getItem("token");

  return axios.post(`${API_BASE_URL}admin/auth/register`, payload, {
    headers: { "x-access-token": token },
  });
};




