/** @format */

import axios from "axios";
import { API_BASE_URL } from "@/config/env";

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
