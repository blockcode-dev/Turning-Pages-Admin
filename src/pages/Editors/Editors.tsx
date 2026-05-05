/** @format */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpDown } from "lucide-react";
import "./Editors.scss";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus,
  Shield,
  UserX,
  Edit3,
  CheckCircle,
  Clock,
  Settings,
  FileText,
  Users,
  Key,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AddEditorAPI,
  DeleteEditorAPI,
  GetAllEditorsAPI,
  GetEditorStatsAPI,
  UpdateEditorStatusAPI,
} from "@/services/Api/EditorApi";
import { useNavigate } from "react-router-dom";

const rolePermissions = {
  "Super Admin": {
    color: "destructive",
    icon: Shield,
    permissions: [
      "Full system access",
      "Manage all users and editors",
      "Assign and reassign projects",
      "Edit all manuscripts",
      "Deliver manuscripts to authors",
      "Access analytics and reports",
      "Manage system settings",
    ],
  },
  "Senior Editor": {
    color: "default",
    icon: Edit3,
    permissions: [
      "Assign projects to assistant editors",
      "Edit assigned manuscripts",
      "Review assistant editor work",
      "Deliver manuscripts to authors",
      "Access project analytics",
    ],
  },
  "Assistant Editor": {
    color: "secondary",
    icon: FileText,
    permissions: [
      "Edit assigned manuscripts only",
      "Add notes and comments",
      "Track editing progress",
      "Request senior editor review",
    ],
  },
};

const getRoleBadge = (roleName: string) => {
  const config = rolePermissions[roleName];
  if (!config) return <Badge variant="outline">{roleName}</Badge>;

  const Icon = config.icon;

  return (
    <Badge variant={config.color} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {roleName}
    </Badge>
  );
};

const getStatusBadge = (isActive: boolean) =>
  isActive ? (
    <Badge className="bg-success text-success-foreground">
      <CheckCircle className="h-3 w-3 mr-1" />
      Active
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-muted-foreground">
      <Clock className="h-3 w-3 mr-1" />
      Inactive
    </Badge>
  );

const Editors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editors, setEditors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEditor, setNewEditor] = useState({
    name: "",
    email: "",
    role: "Assistant Editor",
  });

  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [deleteEditor, setDeleteEditor] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // LOAD EDITORS LIST
  const loadEditors = async () => {
    try {
      const res = await GetAllEditorsAPI();
      setEditors(res.data.data || []);
    } catch (error: any) {
      // 🔥 HANDLE AUTO LOGOUT
      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        toast({
          title: "Session expired",
          description: "Your account was removed or deactivated",
          variant: "destructive",
        });

        return navigate("/");
      }

      if (
        error.response?.data?.message ===
        "You are not authorized to access this route"
      ) {
        return navigate("/unauthorized");
      }

      toast({ title: "Failed to load editors", variant: "destructive" });
    }
  };

  // LOAD EDITOR STATS
  const loadStats = async () => {
    try {
      const res = await GetEditorStatsAPI();
      setStats(res.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        return navigate("/login");
      }

      toast({ title: "Failed to load stats", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadEditors();
    loadStats();
  }, []);

  const handleToggleStatus = async (editor: any) => {
    try {
      const newStatus = editor.is_active ? "deactive" : "active";

      await UpdateEditorStatusAPI({
        editorId: editor.id,
        status: newStatus,
      });

      toast({
        title: `Editor ${newStatus === "active" ? "Activated" : "Deactivated"}`,
      });

      loadEditors();
      loadStats();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        return navigate("/login");
      }
      toast({
        title: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleAddEditor = async () => {
    if (!newEditor.name || !newEditor.email) {
      toast({
        title: "Missing fields",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await AddEditorAPI({
        name: newEditor.name,
        email: newEditor.email,
        role_id: Number(newEditor.role), // IMPORTANT FIX
        department_id: 2,
      });

      toast({
        title: "Editor Added Successfully",
        description: `${newEditor.name} has been added as ${newEditor.role}.`,
      });

      setIsAddModalOpen(false);

      // Reset form
      setNewEditor({ name: "", email: "", role: "Assistant Editor" });

      // Reload
      loadEditors();
      loadStats();
    } catch (error: any) {
      toast({
        title: "Failed to add editor",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const sortedEditors = [...editors].sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (sortField) {
      case "name":
        valA = a.name || "";
        valB = b.name || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "email":
        valA = a.email || "";
        valB = b.email || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "role":
        valA = a.admin_role?.name || "";
        valB = b.admin_role?.name || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "status":
        valA = a.is_active ? 1 : 0;
        valB = b.is_active ? 1 : 0;
        return sortOrder === "asc" ? valA - valB : valB - valA;

      case "created_at":
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? valA - valB : valB - valA;

      default:
        return 0;
    }
  });

  const handleDeleteClick = (editor: any) => {
    setDeleteEditor(editor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteEditor) return;

    setDeletingId(deleteEditor.id);

    try {
      await DeleteEditorAPI(deleteEditor.id);

      toast({
        title: "Editor deleted successfully 🗑️",
      });

      setIsDeleteModalOpen(false);
      setDeleteEditor(null);

      loadEditors();
      loadStats();
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        return navigate("/login");
      }

      toast({
        title: "Failed to delete editor",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Access Controls
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage editor accounts, roles, and permissions
          </p>
        </div>

        {/* Add Editor Button (UI only, no API) */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Editor
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Editor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Enter full name"
                  value={newEditor.name}
                  onChange={(e) =>
                    setNewEditor((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  placeholder="Enter email"
                  type="email"
                  value={newEditor.email}
                  onChange={(e) =>
                    setNewEditor((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={newEditor.role}
                  onValueChange={(v) =>
                    setNewEditor((prev) => ({ ...prev, role: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">Assistant Editor</SelectItem>
                    <SelectItem value="7">Senior Editor</SelectItem>
                    <SelectItem value="1">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddEditor} className="flex-1">
                  Add
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Editors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.activeEditors || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.superAdmins || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Senior Editors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.seniorEditors || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Assistant Editors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats?.assistantEditors || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* ROLE PERMISSIONS — unchanged */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(rolePermissions).map(([role, config]) => {
              const Icon = config.icon;
              return (
                <div key={role} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{role}</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {config.permissions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-success mt-0.5" />
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* EDITORS TABLE — list only from API */}
      <Card>
        <CardHeader>
          <CardTitle>Editors ({editors.length})</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => {
                    setSortField("name");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                  className="sortable-th"
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpDown
                      size={13}
                      className={
                        sortField === "name" ? "opacity-100" : "opacity-40"
                      }
                    />
                    Editor
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => {
                    setSortField("role");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                  className="sortable-th"
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpDown
                      size={13}
                      className={
                        sortField === "role" ? "opacity-100" : "opacity-40"
                      }
                    />
                    Role
                  </div>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead
                  onClick={() => {
                    setSortField("status");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                  className="sortable-th"
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpDown
                      size={13}
                      className={
                        sortField === "status" ? "opacity-100" : "opacity-40"
                      }
                    />
                    Status
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedEditors.map((editor) => (
                <TableRow key={editor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {editor.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <span className="font-medium">{editor.name}</span>

                        {/* 👇 ADDED JOIN DATE HERE */}
                        <p className="text-xs text-muted-foreground">
                          Joined{" "}
                          {new Date(editor.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getRoleBadge(editor.admin_role?.name)}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {editor.email}
                  </TableCell>

                  <TableCell>{getStatusBadge(editor.is_active)}</TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteClick(editor)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className={
                        editor.is_active
                          ? "text-orange-600 hover:text-orange-700"
                          : "text-green-600 hover:text-green-700"
                      }
                      onClick={() => handleToggleStatus(editor)}
                    >
                      {editor.is_active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="delete-modal">
          <div className="delete-header">
            <div className="delete-icon">
              <UserX size={18} />
            </div>
            <div>
              <h2 className="delete-title">Delete Editor</h2>
              <p className="delete-sub">
                This will deactivate the editor account
              </p>
            </div>
          </div>

          <div className="delete-body">
            <p>
              Are you sure you want to delete{" "}
              <span className="delete-username">
                {deleteEditor?.name || "this editor"}
              </span>
              ?
            </p>

            <div className="delete-warning-box delete-warning-box--danger">
              <Shield size={14} />
              <span>This action cannot be undone</span>
            </div>
          </div>

          <div className="delete-actions">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingId === deleteEditor?.id}
            >
              {deletingId === deleteEditor?.id ? (
                "Deleting..."
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-1" />
                  Delete Editor
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Editors;
