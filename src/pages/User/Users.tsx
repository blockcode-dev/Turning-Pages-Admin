/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Eye,
  UserX,
  RotateCcw,
  CalendarIcon,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  Users as UsersIcon,
  Plus,
  BookOpen,
  Coins,
  TrendingUp,
  Shield,
  Loader2,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AddUserCreditsAPI,
  DeleteUserAPI,
  GetAllUsersAPI,
  GetUserDetailsAPI,
  GetUserStatsAPI,
} from "@/services/Api/UserApi";
import "./Users.scss";

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [manuscriptFilter, setManuscriptFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [reduceCreditAmount, setReduceCreditAmount] = useState("");
  const [reduceCreditLoading, setReduceCreditLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await GetAllUsersAPI();
      setUsers(res.data.data || []);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    }
  };

  const loadStats = async () => {
    try {
      const res = await GetUserStatsAPI();
      setStats(res.data.data);
    } catch {
      toast({ title: "Failed to load stats", variant: "destructive" });
    }
  };

  const mapStatus = (status: string) =>
    status === "ACCEPTED" ? "active" : "inactive";

  const filteredUsers = users.filter((user) => {
    const name = user.user_profile?.name || "";
    const email = user.email || "";
    const manuscripts = user.manuscript_count || 0;
    const accountStatus = mapStatus(user.status);
    const joinDate = user.created_at?.slice(0, 4);
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || accountStatus === statusFilter;
    const matchesManuscripts =
      manuscriptFilter === "all" ||
      (manuscriptFilter === "1-3" && manuscripts >= 1 && manuscripts <= 3) ||
      (manuscriptFilter === "4-6" && manuscripts >= 4 && manuscripts <= 6) ||
      (manuscriptFilter === "7+" && manuscripts >= 7);
    const matchesDate = dateFilter === "all" || joinDate === dateFilter;
    return matchesSearch && matchesStatus && matchesManuscripts && matchesDate;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (sortField) {
      case "name":
        valA = a.user_profile?.name || "";
        valB = b.user_profile?.name || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "email":
        valA = a.email || "";
        valB = b.email || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "manuscripts":
        valA = a.manuscript_count || 0;
        valB = b.manuscript_count || 0;
        return sortOrder === "asc" ? valA - valB : valB - valA;

      case "created_at":
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? valA - valB : valB - valA;

      default:
        return 0;
    }
  });

  const handleViewProfile = async (userId: number) => {
    try {
      const res = await GetUserDetailsAPI(userId);
      setSelectedUser(res.data.data);
      setIsProfileModalOpen(true);
    } catch {
      toast({ title: "Failed to load user profile", variant: "destructive" });
    }
  };

  const handleAddCredits = async () => {
    if (!selectedUser?.id || !creditAmount) {
      toast({ title: "Enter valid credit amount", variant: "destructive" });
      return;
    }
    try {
      setCreditLoading(true);
      await AddUserCreditsAPI({
        user_id: selectedUser.id,
        credit: Number(creditAmount),
        action: "add",
      });
      toast({ title: "Credits added successfully 💰" });
      setCreditAmount("");
      const res = await GetUserDetailsAPI(selectedUser.id);
      setSelectedUser(res.data.data);
    } catch (err: any) {
    if (
      err.response?.data?.message ===
      "You are not authorized to access this route"
    ) {
      return navigate("/unauthorized");
    }

    toast({
      title: "Failed to add credits",
      description: err.response?.data?.message || "Something went wrong",
      variant: "destructive",
    });
  } finally {
    setCreditLoading(false);
  }
  };

 const handleReduceCredits = async () => {
  if (!selectedUser?.id || !reduceCreditAmount) {
    toast({ title: "Enter valid credit amount", variant: "destructive" });
    return;
  }

  try {
    setReduceCreditLoading(true);

    await AddUserCreditsAPI({
      user_id: selectedUser.id,
      credit: Number(reduceCreditAmount),
      action: "reduce",
    });

    toast({ title: "Credits reduced successfully 💸" });
    setReduceCreditAmount("");

    const res = await GetUserDetailsAPI(selectedUser.id);
    setSelectedUser(res.data.data);
  } catch (err: any) {
    if (
      err.response?.data?.message ===
      "You are not authorized to access this route"
    ) {
      return navigate("/unauthorized");
    }

    toast({
      title: "Failed to reduce credits",
      description: err.response?.data?.message || "Something went wrong",
      variant: "destructive",
    });
  } finally {
    setReduceCreditLoading(false);
  }
};

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2) || "??";

  const getProjectStatusLabel = (status: string) => {
    if (status === "completed")
      return { label: "Completed", cls: "status-complete" };
    if (status === "in-editing")
      return { label: "In Editing", cls: "status-editing" };
    return { label: "Draft", cls: "status-draft" };
  };

  const handleDeleteClick = (user: any) => {
    setDeleteUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    setTogglingId(deleteUser.id);

    try {
      await DeleteUserAPI(deleteUser.id);

      toast({
        title: "User deleted successfully 🗑️",
      });

      setIsDeleteModalOpen(false);
      setDeleteUser(null);

      loadUsers();
      loadStats();
    } catch {
      toast({
        title: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="users-root">
      {/* ── PAGE HEADER ── */}
      <div className="users-header">
        <div>
          <h1 className="users-title">Users</h1>
          <p className="users-sub">Manage accounts, credits & manuscripts</p>
        </div>
      <div className="users-header-actions">
  <div className="users-total-pill">
    <UsersIcon size={14} />
    {users.length} total
  </div>
  <button className="btn-add-user" onClick={() => navigate("/users/add")}>
    <Plus size={15} />
    Add user
  </button>
</div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="stats-strip">
        {/* <div className="stat-card">
          <div className="stat-icon stat-icon--blue">
            <UsersIcon size={16} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div> */}
        <div className="stat-card">
          <div className="stat-icon stat-icon--green">
            <CheckCircle size={16} />
          </div>
          <div>
            <div className="stat-value stat-value--green">
              {stats?.activeUsers || 0}
            </div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--gray">
            <Clock size={16} />
          </div>
          <div>
            <div className="stat-value">{stats?.inactiveUsers || 0}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--amber">
            <FileText size={16} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalManuscripts || 0}</div>
            <div className="stat-label">Manuscripts</div>
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div className="filters-container">
        {/* SEARCH */}
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search users by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTERS */}
        <div className="filters-scroll">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="filter-select">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={manuscriptFilter} onValueChange={setManuscriptFilter}>
            <SelectTrigger className="filter-select">
              <SelectValue placeholder="Manuscripts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manuscripts</SelectItem>
              <SelectItem value="1-3">1–3</SelectItem>
              <SelectItem value="4-6">4–6</SelectItem>
              <SelectItem value="7+">7+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="filter-select">
              <SelectValue placeholder="Year joined" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="filters-actions">
          <button
            className="btn-clear-filters"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setManuscriptFilter("all");
              setDateFilter("all");
            }}
          >
            <RotateCcw size={14} />
            Clear
          </button>

          <div className="filter-count">{filteredUsers.length} results</div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th
                onClick={() => {
                  setSortField("name");
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                }}
                className="sortable-th"
              >
                <div className="th-content">
                  <ArrowUpDown
                    size={13}
                    className={`sort-icon ${
                      sortField === "name" ? "active" : ""
                    }`}
                  />
                  <span>User</span>
                </div>
              </th>
              <th>Email</th>
              <th>Manuscripts</th>
              <th
                onClick={() => {
                  setSortField("created_at");
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                }}
                className="sortable-th"
              >
                <div className="th-content">
                  <ArrowUpDown
                    size={13}
                    className={`sort-icon ${
                      sortField === "created_at" ? "active" : ""
                    }`}
                  />
                  <span>Joined</span>
                </div>
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((u) => {
              const name = u.user_profile?.name || "N/A";
              const isActive = u.status === "ACCEPTED";
              const isToggling = togglingId === u.id;

              return (
                <tr key={u.id} className="user-row">
                  <td>
                    <div className="user-cell">
                      <Avatar className="user-avatar">
                        <AvatarImage src={u.user_attachments?.[0]?.file_uri} />
                        <AvatarFallback className="avatar-fallback">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="user-name-1">{name}</span>
                    </div>
                  </td>
                  <td className="cell-email">{u.email}</td>
                  <td>
                    <div className="manuscript-cell">
                      <BookOpen size={13} />
                      <span>{u.manuscript_count || 0}</span>
                    </div>
                  </td>
                  <td className="cell-date">
                    {format(new Date(u.created_at), "MMM dd, yyyy")}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${isActive ? "badge-active" : "badge-inactive"}`}
                    >
                      {isActive ? (
                        <CheckCircle size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleViewProfile(u.id)}
                      >
                        <Eye size={13} />
                        View
                      </button>

                      <button
                        className="btn-toggle btn-deactivate"
                        onClick={() => handleDeleteClick(u)}
                        disabled={isToggling}
                      >
                        {isToggling ? (
                          <Loader2 size={13} className="spin" />
                        ) : (
                          <UserX size={13} />
                        )}
                        Delete
                      </button>
                      {/* <button
                        className={`btn-toggle ${isActive ? "btn-deactivate" : "btn-activate"}`}
                        onClick={() => handleToggleStatus(u)}
                        disabled={isToggling}
                      >
                        {isToggling ? (
                          <Loader2 size={13} className="spin" />
                        ) : isActive ? (
                          <UserX size={13} />
                        ) : (
                          <UserCheck size={13} />
                        )}
                        {isActive ? "Deactivate" : "Activate"}
                      </button> */}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <UsersIcon size={32} />
            <p>No users match your filters</p>
          </div>
        )}
      </div>

      {/* ── USER PROFILE MODAL ── */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="user-modal">
          <DialogHeader className="modal-header-hidden">
            <DialogTitle className="sr-only">User Profile</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="modal-body">
              {/* HERO */}
              <div className="modal-hero">
                <div className="modal-hero-bg" />
                <div className="modal-hero-content">
                  <Avatar className="modal-avatar">
                    <AvatarImage
                      src={selectedUser.user_attachments?.[0]?.file_uri || ""}
                    />
                    <AvatarFallback className="modal-avatar-fallback">
                      {getInitials(selectedUser.user_profile?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="modal-user-info">
                    <h2 className="modal-name">
                      {selectedUser.user_profile?.name}
                    </h2>
                    <div className="modal-email">
                      <Mail size={13} />
                      {selectedUser.email}
                    </div>
                    <div className="modal-meta-row">
                      <span className="modal-meta-item">
                        <CalendarIcon size={12} />
                        Joined{" "}
                        {format(new Date(selectedUser.created_at), "MMM yyyy")}
                      </span>
                      <span
                        className={`modal-status ${selectedUser.status === "ACCEPTED" ? "modal-status--active" : "modal-status--inactive"}`}
                      >
                        {selectedUser.status === "ACCEPTED"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QUICK STATS */}
                <div className="modal-quick-stats">
                  <div className="modal-stat">
                    <div className="modal-stat-value">
                      {selectedUser.total_credit ?? 0}
                    </div>
                    <div className="modal-stat-label">Credits</div>
                  </div>
                  <div className="modal-stat-divider" />
                  <div className="modal-stat">
                    <div className="modal-stat-value">
                      {selectedUser.user_books?.length || 0}
                    </div>
                    <div className="modal-stat-label">Projects</div>
                  </div>
                  <div className="modal-stat-divider" />
                  <div className="modal-stat">
                    <div className="modal-stat-value">
                      {selectedUser.manuscript_count || 0}
                    </div>
                    <div className="modal-stat-label">Manuscripts</div>
                  </div>
                </div>
              </div>

              {/* ADD CREDITS */}
              <div className="credits-section">
                <div className="section-label">
                  <Coins size={14} />
                  Add Credits
                </div>

                <div className="quick-credits">
                  {[50, 120, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      className={`quick-credit-btn ${creditAmount === String(amt) ? "selected" : ""}`}
                      onClick={() => setCreditAmount(String(amt))}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                <div className="credit-input-row">
                  <div className="credit-input-wrap">
                    <Zap size={14} className="credit-input-icon" />
                    <input
                      type="number"
                      className="credit-input"
                      placeholder="Custom amount"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn-add-credits"
                    onClick={handleAddCredits}
                    disabled={creditLoading}
                  >
                    {creditLoading ? (
                      <Loader2 size={14} className="spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    {creditLoading ? "Adding…" : "Add Credits"}
                  </button>
                </div>
              </div>

              {/* REDUCE CREDITS */}
              <div className="credits-section credits-section--reduce">
                <div className="section-label">
                  <Coins size={14} />
                  Reduce Credits
                </div>

                <div className="quick-credits">
                  {[50, 120, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      className={`quick-credit-btn quick-credit-btn--reduce ${reduceCreditAmount === String(amt) ? "selected" : ""}`}
                      onClick={() => setReduceCreditAmount(String(amt))}
                    >
                      -{amt}
                    </button>
                  ))}
                </div>

                <div className="credit-input-row">
                  <div className="credit-input-wrap">
                    <Zap size={14} className="credit-input-icon" />
                    <input
                      type="number"
                      className="credit-input"
                      placeholder="Custom amount"
                      value={reduceCreditAmount}
                      onChange={(e) => setReduceCreditAmount(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn-add-credits btn-reduce-credits"
                    onClick={handleReduceCredits}
                    disabled={reduceCreditLoading}
                  >
                    {reduceCreditLoading ? (
                      <Loader2 size={14} className="spin" />
                    ) : (
                      <TrendingUp
                        size={14}
                        style={{ transform: "rotate(180deg)" }}
                      />
                    )}
                    {reduceCreditLoading ? "Reducing…" : "Reduce Credits"}
                  </button>
                </div>
              </div>

              {/* PROJECTS */}
              {selectedUser.user_books?.length > 0 && (
                <div className="projects-section">
                  <div className="section-label">
                    <BookOpen size={14} />
                    Projects ({selectedUser.user_books.length})
                  </div>

                  <div className="project-list">
                    {selectedUser.user_books.map((book: any) => {
                      const { label, cls } = getProjectStatusLabel(book.status);
                      return (
                        <div key={book.id} className="project-card">
                          <div className="project-card-left">
                            <div className="project-book-icon">
                              <FileText size={14} />
                            </div>
                            <div>
                              <div className="project-title">{book.title}</div>
                              <div className="project-genre">
                                {book.book_genre?.title || "No genre"}
                              </div>
                            </div>
                          </div>
                          <span className={`project-status ${cls}`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ACCOUNT ACTIONS */}
              {/* <div className="modal-actions">
                <button
                  className="modal-action-btn modal-action-deactivate"
                  onClick={() => {
                    handleDeleteClick(selectedUser);
                    setIsProfileModalOpen(false);
                  }}
                  //   onClick={() => {
                  //     handleToggleStatus(selectedUser);
                  //     setIsProfileModalOpen(false);
                  //   }}
                >
                  <UserX size={14} />
                  {selectedUser.status === "ACCEPTED"
                    ? "Deactivate Account"
                    : "Activate Account"}
                </button>
              </div> */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="delete-modal">
          {/* HEADER */}
          <div className="delete-header">
            <div className="delete-icon">
              <UserX size={18} />
            </div>
            <div>
              <h2 className="delete-title">Delete User</h2>
              <p className="delete-sub">
                 This action will permanently delete the account and all associated data.
              </p>
            </div>
          </div>

          {/* BODY */}
          <div className="delete-body">
            <p>
              Are you sure you want to delete{" "}
              <span className="delete-username">
                {deleteUser?.user_profile?.name || "this user"}
              </span>
              ?
            </p>

            <div className="delete-warning-box">
              <Shield size={14} />
              <span>This action cannot be undone</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="delete-actions">
            <button
              className="btn-cancel"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>

            <button
              className="btn-delete"
              onClick={handleConfirmDelete}
              disabled={togglingId === deleteUser?.id}
            >
              {togglingId === deleteUser?.id ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <>
                  <UserX size={14} />
                  Delete User
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
