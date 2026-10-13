/** @format */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UpdateTicketAPI } from "@/services/Api/TicketApi";
import { GetAllEditorsAPI } from "@/services/Api/EditorApi";
import { Send, MessageCircle } from "lucide-react";

/* ─── Role label ────────────────────────────────────────────── */
const getRoleLabel = (role_id: number) => {
  switch (role_id) {
    case 1:
      return "Super Admin";
    case 7:
      return "Senior Editor";
    case 8:
      return "Assistant Editor";
    default:
      return "Admin";
  }
};

/* ─── Main component ────────────────────────────────────────── */
export default function TicketEditModal({ ticket, onClose }: any) {
  const { toast } = useToast();

  const [tab, setTab] = useState<"edit" | "conversation">("edit");
  const [status, setStatus] = useState(ticket.status ?? "open");
  const [priority, setPriority] = useState(ticket.priority ?? "medium");
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || "");
  const [editors, setEditors] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(ticket.ticket_messages || []);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    GetAllEditorsAPI()
      .then((res) => setEditors(res.data.data || []))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await UpdateTicketAPI({
        ticket_id: ticket.id,
        status,
        priority,
        assigned_to: assignedTo || null,
      });
      toast({ title: "Ticket updated ✅" });
      onClose();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);

    const temp = {
      id: Date.now(),
      message,
      sender_role: "admin",
      is_internal: false,
      created_at: new Date().toISOString(),
    };

    try {
      await UpdateTicketAPI({
        ticket_id: ticket.id,
        note: message,
      });

      setMessages((prev: any) => [...prev, temp]);
      setMessage("");
      toast({ title: "Message sent ✅" });
    } catch {
      toast({ title: "Failed to send", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const selectedEditor = editors.find(
    (e) => String(e.id) === String(assignedTo),
  );

  return (
    <Dialog open onOpenChange={onClose}>
      {" "}
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg max-h-[85vh] flex flex-col bg-white border border-border shadow-xl">
        {/* HEADER */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {ticket.ticket_code}
          </span>

          <DialogHeader className="mt-2">
            <DialogTitle className="text-base font-semibold text-foreground">
              {ticket.subject}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-muted p-1 rounded-lg w-fit">
            {(["edit", "conversation"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs font-medium px-4 py-1.5 rounded-md transition-all ${
                  tab === t
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "conversation"
                  ? `Conversation (${messages.length})`
                  : "Edit"}
              </button>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* EDIT TAB */}
          {tab === "edit" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm text-foreground border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-border"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_user">Waiting User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full text-sm text-foreground border border-border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-border"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Assign Editor */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Assign Editor
                </label>
                <select
                  value={assignedTo || ""}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full text-sm text-foreground border border-border rounded-xl px-3 py-2.5 bg-white"
                >
                  <option value="">— Unassigned —</option>
                  {editors.map((editor: any) => (
                    <option key={editor.id} value={editor.id}>
                      {editor.name || editor.email}
                    </option>
                  ))}
                </select>

                {selectedEditor && (
                  <p className="text-xs text-muted-foreground mt-1.5 pl-1">
                    {selectedEditor.email} ·{" "}
                    {getRoleLabel(selectedEditor.role_id)}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="text-sm px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted/50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* CONVERSATION TAB */}
          {tab === "conversation" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                      <MessageCircle size={20} className="text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isAdmin = msg.sender_role === "admin";
                    const isInternal = msg.is_internal;

                    const msgTime = new Date(msg.created_at).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${
                          isAdmin ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${
                            isAdmin ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm" : "bg-muted-foreground/40"
                          }`}
                        >
                          {isAdmin ? "A" : "U"}
                        </div>

                        <div
                          className={`flex flex-col gap-1 max-w-[68%] ${
                            isAdmin ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm min-w-[80px]
                          ${
                            isAdmin
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : isInternal
                                ? "bg-amber-50 border border-amber-200 text-amber-800"
                                : "bg-muted text-foreground"
                          }`}
                          >
                            {msg.message}
                          </div>

                          <span className="text-[10px] text-muted-foreground px-1">
                            {msgTime}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="px-4 py-3 bg-muted/50 border-t flex items-center gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  placeholder="Type a message…"
                  className="flex-1 text-sm bg-white border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending}
                  className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary-hover disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
