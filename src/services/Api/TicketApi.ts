/** @format */

import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ||
	"https://api.turningpages.io/api/v1/";

export const GetAllTicketsAPI = () => {
	const token = localStorage.getItem("token");

	return axios.get(`${API_BASE_URL}support/ad/all`, {
		headers: { "x-access-token": token },
	});
};

export const UpdateTicketStatusAPI = (body) => {
	const token = localStorage.getItem("token");

	return axios.post(`${API_BASE_URL}support/ad/status/update`, body, {
		headers: { "x-access-token": token },
	});
};


export const UpdateTicketAPI = (body) => {
	const token = localStorage.getItem("token");

	return axios.post(`${API_BASE_URL}support/ad/admin`, body, {
		headers: { "x-access-token": token },
	});
};
