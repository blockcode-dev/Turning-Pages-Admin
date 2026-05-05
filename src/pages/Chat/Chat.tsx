/** @format */

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Chat.scss";

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import {
	GetAllChatListApi,
	CreateChatApi,
	GetAllParticipants,
} from "@/services/Api/ChatApi";

/* ─── Types ─────────────────────────────────────────── */
interface ChatRoom {
	type: string;
	book_details?: { title: string };
	chat_participant_ad?: { name: string };
	last_message?: string;
	participants?: any[];
}

interface User {
	id: string | number;
	name: string;
	role: string;
	avatar: string;
	last_message?: string;
	chat_room: ChatRoom;
}

interface Message {
	id: string;
	text: string;
	user: "self" | "other";
	senderName: string;
	time: string;
	date: string; // "Today" | "Yesterday" | "Mar 20"
}

/* ─── Helpers ───────────────────────────────────────── */
const getInitials = (name: string = "") =>
	name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

const avatarColor = (name: string = "") => {
	const colors = [
		"linear-gradient(135deg,#1e3a5f,#2d5986)",
		"linear-gradient(135deg,#3b1f5e,#6b3fa0)",
		"linear-gradient(135deg,#0f4c3a,#1a7a5e)",
		"linear-gradient(135deg,#5e2d1f,#a04f30)",
		"linear-gradient(135deg,#1f3a5e,#3066a0)",
	];
	const idx = name.charCodeAt(0) % colors.length;
	return colors[idx];
};

const avatarTextColor = (name: string = "") => {
	const cols = ["#90cdf4", "#d6bcfa", "#6ee7b7", "#fdba74", "#93c5fd"];
	return cols[name.charCodeAt(0) % cols.length];
};

const formatDateLabel = (date: Date): string => {
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	if (date.toDateString() === today.toDateString()) return "Today";
	if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
	return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

/* ─── Component ─────────────────────────────────────── */
const Chat: React.FC = () => {
	const { book_room_id } = useParams<{ book_room_id: string }>();
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [messagesByRoom, setMessagesByRoom] = useState<
		Record<string, Message[]>
	>({});
	const [text, setText] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [userMap, setUserMap] = useState<Record<string, any>>({});

	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const senderId = localStorage.getItem("admin_id");
	const isDirectChat = !!book_room_id;
	const [participants, setParticipants] = useState<any[]>([]);
	const [showParticipants, setShowParticipants] = useState(false);

	const currentMessages: Message[] = selectedUser
		? messagesByRoom[String(selectedUser.id)] || []
		: [];

	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowParticipants(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		setShowParticipants(false);
	}, [selectedUser]);

	useEffect(() => {
		if (!selectedUser?.id) return;

		const fetchParticipants = async () => {
			try {
				const res = await GetAllParticipants(selectedUser.id);
				setParticipants(res?.data?.data || []);
			} catch (err) {
				console.error("Failed to load participants", err);
			}
		};

		fetchParticipants();
	}, [selectedUser]);

	/* ── Fetch chat list ── */
	useEffect(() => {
		const fetchChatList = async () => {
			const res = await GetAllChatListApi();
			const chatData = res?.data?.data || [];

			const mappedUsers: User[] = chatData.map((item: any) => ({
				id: item.chat_room_id,
				name:
					item?.chat_room?.type === "BOOK_GROUP"
						? item?.chat_room?.book_details?.title
						: item?.chat_room?.chat_participant_ad?.name,
				role: item.role,
				avatar: "👤",
				last_message: item.chat_room?.last_message,
				chat_room: item.chat_room,
			}));

			setUsers(mappedUsers);

			if (book_room_id) {
				const found = mappedUsers.find(
					(u) => String(u.id) === String(book_room_id),
				);
				if (found) setSelectedUser(found);
			} else if (mappedUsers.length > 0) {
				setSelectedUser(mappedUsers[0]);
			}

			const map: Record<string, any> = {};
			chatData.forEach((item: any) => {
				item.chat_room?.participants?.forEach((p: any) => {
					// 👤 USER
					if (p.role === "USER" && p.user_details) {
						map[String(p.user_id)] = {
							name: p.user_details.user_profile?.name,
						};
					}

					// 🧑‍💼 ADMIN / EDITOR
					if ((p.role === "ADMIN" || p.role === "EDITOR") && p.admin_details) {
						map[`admin_${p.user_id}`] = {
							name: p.admin_details.name,
						};
					}
				});

				// (optional fallback for creator admin)
				if (item.chat_room?.chat_participant_ad) {
					map[`admin_${item.chat_room.chat_participant_ad.id}`] = {
						name: item.chat_room.chat_participant_ad.name,
					};
				}
			});

			setUserMap(map);
		};

		fetchChatList();
	}, [book_room_id]);

	/* ── Firebase realtime ── */
	useEffect(() => {
		if (!selectedUser?.id) return;

		const chatRoomId = String(selectedUser.id);
		const q = query(
			collection(db, "messages", chatRoomId, "chat"),
			orderBy("created_at", "asc"),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const myId = localStorage.getItem("admin_id");
			const myRole = localStorage.getItem("role_id");

			const msgs: Message[] = snapshot.docs.map((doc) => {
				const data = doc.data();
				const isMyMessage =
					String(data.sender_id) === String(myId) &&
					String(data.sender_role) === String(myRole);

				const isAdminRole = ["1", "7", "8"].includes(String(data.sender_role));
				const senderKey = isAdminRole
					? `admin_${data.sender_id}`
					: String(data.sender_id);
				const senderName = userMap[senderKey]?.name || "Unknown";

				const msgDate: Date = data.created_at?.toDate
					? data.created_at.toDate()
					: new Date();

				return {
					id: doc.id,
					text: data.text,
					user: isMyMessage ? "self" : "other",
					senderName,
					time: msgDate.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					}),
					date: formatDateLabel(msgDate),
				};
			});

			setMessagesByRoom((prev) => ({ ...prev, [chatRoomId]: msgs }));
		});

		return () => unsubscribe();
	}, [selectedUser, senderId, userMap]);

	/* ── Send ── */
	const sendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim() || !selectedUser?.id) return;

		const messageText = text;
		setText("");

		await CreateChatApi({
			chat_room_id: selectedUser.id,
			message: messageText,
		});

		setUsers((prev) => {
			const updated = prev.map((u) =>
				u.id === selectedUser.id ? { ...u, last_message: messageText } : u,
			);
			return [
				updated.find((u) => u.id === selectedUser.id)!,
				...updated.filter((u) => u.id !== selectedUser.id),
			];
		});
	};

	/* ── Search ── */
	const filteredUsers = users.filter((user) =>
		user.name?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	/* ── Scroll to bottom ── */
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [currentMessages]);

	/* ── Build date-grouped messages ── */
	const renderMessages = () => {
		const elements: React.ReactNode[] = [];
		let lastDate = "";
		let lastSender = "";

		currentMessages.forEach((msg, idx) => {
			// Date divider
			if (msg.date !== lastDate) {
				elements.push(
					<div key={`date-${idx}`} className="date-divider">
						{msg.date}
					</div>,
				);
				lastDate = msg.date;
				lastSender = "";
			}

			const showSenderLabel =
				msg.user === "other" && msg.senderName !== lastSender;
			lastSender = msg.senderName;

			elements.push(
				<div key={msg.id} className={`msg-group ${msg.user}`}>
					{/* Sender name label above first bubble in a sequence */}
					{showSenderLabel && (
						<div className="msg-sender-label">{msg.senderName}</div>
					)}

					<div className="msg-row">
						{/* Avatar on the left for other's messages */}
						{msg.user === "other" && (
							<div
								className="bubble-avatar"
								style={{
									background: avatarColor(msg.senderName),
									color: avatarTextColor(msg.senderName),
								}}
								title={msg.senderName}
							>
								{getInitials(msg.senderName)}
							</div>
						)}

						<div className={`chat-message ${msg.user}`}>
							<span>{msg.text}</span>
							<div className="msg-footer">
								<span className="msg-time">{msg.time}</span>
							</div>
						</div>
					</div>
				</div>,
			);
		});

		return elements;
	};

	const isGroupChat = selectedUser?.chat_room?.type === "BOOK_GROUP";
	const participantCount =
		selectedUser?.chat_room?.participants?.length ?? null;

	return (
		<div className="chat-panel">
			{/* ── Sidebar ── */}
			{!isDirectChat && (
				<div className="chat-sidebar">
					<div className="chat-sidebar-header">
						<h2>Messages</h2>
						{users.length > 0 && (
							<span className="sidebar-badge">{users.length}</span>
						)}
					</div>

					<div className="chat-search-wrapper">
						<span className="chat-search-icon">🔍</span>
						<input
							type="text"
							placeholder="Search conversations…"
							className="chat-search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div className="chat-users">
						{filteredUsers.map((user) => (
							<div
								key={user.id}
								className={`chat-user ${selectedUser?.id === user.id ? "active" : ""}`}
								onClick={() => setSelectedUser(user)}
							>
								<div className="sidebar-avatar">
									<div
										className={`sidebar-avatar-inner ${
											user.chat_room?.type === "BOOK_GROUP" ? "group" : ""
										}`}
										style={{
											background: avatarColor(user.name),
											color: avatarTextColor(user.name),
										}}
									>
										{getInitials(user.name)}
									</div>
								</div>

								<div className="user-info">
									<div className="user-name">{user.name}</div>
									<div className="last-msg">
										{user.last_message || "No messages yet"}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* ── Chat Content ── */}
			<div className="chat-content">
				{selectedUser ? (
					<>
						{/* Header */}
						<div className="chat-header">
							  <button
    className="header-back-btn"
    onClick={() => window.history.back()}
    title="Go back"
  >
    &#8592;
  </button>

							<div
								className="header-avatar"
								style={{
									background: avatarColor(selectedUser.name),
									color: avatarTextColor(selectedUser.name),
								}}
							>
								{getInitials(selectedUser.name)}
							</div>

							<div className="header-info">
								<div className="header-name">{selectedUser.name}</div>
								<div className="header-sub">
									{isGroupChat
										? participantCount
											? `${participantCount} members`
											: "Group chat"
										: "Direct message"}
								</div>
							</div>

							<div className="header-actions" style={{ position: "relative" }}>
								<button
									className={`header-btn participants-toggle ${showParticipants ? "active" : ""}`}
									onClick={() => setShowParticipants(!showParticipants)}
									title="View members"
								>
									👥
								</button>

								{showParticipants && (
									<div className="participants-dropdown" ref={dropdownRef}>
										<div className="participants-header">
											<div className="participants-title-row">
												<span className="participants-title">Members</span>
												<span className="participants-count">
													{participants.length}
												</span>
											</div>
											<button
												className="participants-close"
												onClick={() => setShowParticipants(false)}
											>
												✕
											</button>
										</div>
										<div className="participants-list">
											{participants.map((p: any, i: number) => {
												const name =
													p.admin_details?.name ||
													p.user_details?.user_profile?.name ||
													"Unknown";
												const isAdmin = !!p.admin_details;
												const roleLabel = p.role;

												return (
													<div key={i} className="participant-item">
														<div
															className="participant-avatar"
															style={{
																background: avatarColor(name),
																color: avatarTextColor(name),
															}}
														>
															{getInitials(name)}
														</div>
														<div className="participant-info">
															<div className="participant-name">{name}</div>
													
																<span
																	className={`participant-role ${roleLabel.toLowerCase()}`}
																>
																	{roleLabel}
																</span>
															
														</div>
													</div>
												);
											})}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Messages */}
						<div className="chat-messages">
							{currentMessages.length === 0 ? (
								<div className="no-messages">
									No messages yet — say hello! 👋
								</div>
							) : (
								renderMessages()
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Input */}
						<div className="chat-input-area">
							<form className="chat-input" onSubmit={sendMessage}>
								<input
									ref={inputRef}
									value={text}
									onChange={(e) => setText(e.target.value)}
									placeholder="Type a message…"
								/>
								<div className="input-actions">
									<button
										type="submit"
										className="send-btn"
										disabled={!text.trim()}
										title="Send"
									>
										➤
									</button>
								</div>
							</form>
						</div>
					</>
				) : (
					<div className="no-chat-selected">
						<div className="empty-icon">💬</div>
						<p>No conversation selected</p>
						<span>Pick a chat from the left to get started</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default Chat;
