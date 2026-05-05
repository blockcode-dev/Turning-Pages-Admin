/** @format */

// GenreApi.ts
import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ||
	"https://api.turningpages.io:9090/api/v1/";

export const GetAllQuoteTagsAPI = ({ page = 1, search = "" } = {}) => {
	const token = localStorage.getItem("token");

	return axios.get(
		`${API_BASE_URL}quotes/tags/list?page=${page}&limit=100&search=${search}`,
		{
			headers: { "x-access-token": token },
		},
	);
};

export const AddQuoteTagAPI = (payload: { title: string }) => {
	const token = localStorage.getItem("token");
	return axios.post(`${API_BASE_URL}quotes/tags`, payload, {
		headers: { "x-access-token": token },
	});
};

export const UpdateQuoteTagAPI = (
	id: number | string,
	payload: { title: string },
) => {
	const token = localStorage.getItem("token");
	return axios.put(`${API_BASE_URL}quotes/tags/${id}`, payload, {
		headers: { "x-access-token": token },
	});
};

export const DeleteQuoteTagAPI = (id: number | string) => {
	const token = localStorage.getItem("token");
	return axios.delete(`${API_BASE_URL}quotes/tags/${id}`, {
		headers: { "x-access-token": token },
	});
};

// quotes
export const GetAllQuotesAPI = ({ page = 1, search = "" } = {}) => {
	const token = localStorage.getItem("token");

	return axios.get(
		`${API_BASE_URL}quotes?page=${page}&limit=100&search=${search}`,
		{
			headers: { "x-access-token": token },
		}
	);
};

export const GetQuoteByIdAPI = (id: number | string) => {
	const token = localStorage.getItem("token");

	return axios.get(`${API_BASE_URL}quotes/${id}`, {
		headers: { "x-access-token": token },
	});
};

export const UpdateQuoteAPI = (id: number | string, payload: any) => {
	const token = localStorage.getItem("token");

	return axios.put(`${API_BASE_URL}quotes/${id}`, payload, {
		headers: { "x-access-token": token },
	});
};

export const AddQuoteAPI = (payload: {
	  add_type: "single";
	author: string;
	quote: string;
	desc: string;
	tags: number[];
}) => {
	const token = localStorage.getItem("token");
	return axios.post(`${API_BASE_URL}quotes`, payload, {
		headers: { "x-access-token": token },
	});
};

export const DeleteQuoteAPI = (id: number | string) => {
	const token = localStorage.getItem("token");
	return axios.delete(`${API_BASE_URL}quotes/${id}`, {
		headers: { "x-access-token": token },
	});
};


export const AddBulkQuoteAPI = (payload: {
	add_type: "multiple";
	quotes: {
		author?: string;
		quote: string;
		desc?: string;
	}[];
	tags?: number[];
}) => {
	const token = localStorage.getItem("token");

	return axios.post(`${API_BASE_URL}quotes`, payload, {
		headers: { "x-access-token": token },
	});
};