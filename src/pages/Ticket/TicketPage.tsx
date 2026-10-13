/** @format */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, Pencil } from "lucide-react";

import { GetAllTicketsAPI } from "@/services/Api/TicketApi";
import { useNavigate } from "react-router-dom";
import TicketViewModal from "./TicketViewModal";
import TicketEditModal from "./TicketEditModal";

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  const { toast } = useToast();

  const loadTickets = async () => {
    try {
      const res = await GetAllTicketsAPI();
      setTickets(res?.data?.data || []);
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "You are not authorized to access this route"
      ) {
        return navigate("/unauthorized");
      }

      toast({
        title: "Failed to load tickets",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  /* 🔥 FORMAT LABEL */
  const formatLabel = (text: string) => {
    return text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  /* 🎨 STATUS STYLE */
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "waiting_user":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "closed":
        return "bg-muted text-foreground border-border";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  /* 🎨 PRIORITY STYLE */
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-muted text-muted-foreground border-border";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Ticket Management</h1>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tickets.map((t, index) => (
                <TableRow key={t.id}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell className="font-medium text-xs text-muted-foreground">
                    {t.ticket_code}
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {t.ticket_user?.user_profile?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.ticket_user?.email}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[220px] truncate font-medium">
                    {t.subject}
                  </TableCell>

                  {/* 🔥 PRIORITY */}
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityStyle(
                        t.priority,
                      )}`}
                    >
                      {formatLabel(t.priority)}
                    </span>
                  </TableCell>

                  {/* 🔥 STATUS */}
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusStyle(
                        t.status,
                      )}`}
                    >
                      {formatLabel(t.status)}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelected(t);
                          setMode("view");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelected(t);
                          setMode("edit");
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODALS */}
      {selected && mode === "view" && (
        <TicketViewModal ticket={selected} onClose={() => setSelected(null)} />
      )}

      {selected && mode === "edit" && (
        <TicketEditModal
          ticket={selected}
          onClose={() => {
            setSelected(null);
            loadTickets();
          }}
        />
      )}
    </div>
  );
}
