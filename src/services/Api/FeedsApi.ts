import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.turningpages.io/api/v1/";

export const GetAllFeedsAPI = ({ page, limit, search }) => {
	const token = localStorage.getItem("token");

	return axios.get(
		`${API_BASE_URL}feeds/admin/all?page=${page}&limit=${limit}&search=${search || ""}`,
		{
			headers: { "x-access-token": token },
		}
	);
};

export const GetFeedByIdAPI = (id) => {
	const token = localStorage.getItem("token");

	return axios.get(`${API_BASE_URL}feeds/admin/${id}`, {
		headers: { "x-access-token": token },
	});
};