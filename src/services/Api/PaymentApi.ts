/** @format */

import axios from "axios";
import { API_BASE_URL } from "@/config/env";

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
