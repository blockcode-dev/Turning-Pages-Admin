import axios from "axios";
import { API_BASE_URL } from "@/config/env";

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