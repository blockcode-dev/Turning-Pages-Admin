/** @format */

import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ||
	"https://api.turningpages.io/api/v1/";

export const GetAllPaymentsAPI = () => {
	const token = localStorage.getItem("token");

	return axios.get(`${API_BASE_URL}payments/getAllPaymentList`, {
		headers: { "x-access-token": token },
	});
};

export const GetAllSubscriptionsAPI = () => {
	const token = localStorage.getItem("token");

	return axios.get(`${API_BASE_URL}payments/getAllSubscriptions`, {
		headers: { "x-access-token": token },
	});
};
