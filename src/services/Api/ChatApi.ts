/** @format */

import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ||
	"https://api.turningpages.io:9090/api/v1/";

export const GetAllChatListApi = () => {
	const token = localStorage.getItem("token");

	return axios.get(`${API_BASE_URL}chats/getAllAdminChats`, {
		headers: { "x-access-token": token },
	});
};

export const GetAllParticipants = (id) => {

	return axios.get(`${API_BASE_URL}chats/${id}/participants`, {});
};

export const CreateChatApi = (body) => {
	const token = localStorage.getItem("token");

	return axios.post(`${API_BASE_URL}chats/message/send/admin`, body, {
		headers: { "x-access-token": token },
	});
};
