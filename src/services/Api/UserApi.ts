/** @format */

import axios from "axios";
import { API_BASE_URL } from "@/config/env";

export const GetAllUsersAPI = async () => {
	const token = localStorage.getItem("token");
	return axios.get(`${API_BASE_URL}admin/op/users/all`, {
		headers: { "x-access-token": token },
	});
};

export const CreateUserAPI = async (data: {
	name: string;
	email: string;
	password: string;
}) => {
	const token = localStorage.getItem("token");
	return axios.post(`${API_BASE_URL}admin/op/create-user`, data, {
		headers: { "x-access-token": token },
	});
};

export const GetUserDetailsAPI = async (userId: number) => {
	const token = localStorage.getItem("token");
	return axios.get(`${API_BASE_URL}admin/op/users/details/${userId}`, {
		headers: { "x-access-token": token },
	});
};

export const GetUserStatsAPI = async () => {
	const token = localStorage.getItem("token");
	return axios.get(`${API_BASE_URL}admin/op/stats/users`, {
		headers: { "x-access-token": token },
	});
};

export const UpdateUserStatusAPI = async (payload: {
	userId: number;
	status: string;
}) => {
	const token = localStorage.getItem("token");
	return axios.patch(`${API_BASE_URL}admin/op/user/status`, payload, {
		headers: { "x-access-token": token },
	});
};

export const AddUserCreditsAPI = async (data: {
	user_id: number;
	credit: number;
	action?: string;
}) => {
	const token = localStorage.getItem("token");
	return await axios.post(`${API_BASE_URL}admin/op/add/credit`, data, {
		headers: { "x-access-token": token },
	});
};

export const DeleteUserAPI = async (userId: number) => {
	const token = localStorage.getItem("token");
	return axios.delete(`${API_BASE_URL}admin/op/user/${userId}`, {
		headers: { "x-access-token": token },
	});
};
