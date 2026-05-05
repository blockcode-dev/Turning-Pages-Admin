/** @format */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Clock,
  Hash,
  Activity,
  AlertTriangle,
  MessageCircle,
  User,
  UserCog,
  FileText,
  ChevronRight,
} from "lucide-react";

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CFG: Record<
  string,
  { label: string; dot: string; chip: string; bar: string }
> = {
  open: {
    label: "Open",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    bar: "from-emerald-400 to-teal-400",
  },
  closed: {
    label: "Closed",
    dot: "bg-slate-400",
    chip: "bg-slate-100 text-slate-600 border border-slate-200",
    bar: "from-slate-300 to-slate-400",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 border border-amber-200",
    bar: "from-amber-400 to-orange-400",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700 border border-blue-200",
    bar: "from-blue-400 to-indigo-400",
  },
  waiting_user: {
    label: "Waiting User",
    dot: "bg-yellow-500",
    chip: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    bar: "from-yellow-400 to-amber-400",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700 border border-violet-200",
    bar: "from-violet-400 to-purple-400",
  },
};

/* ─── Priority config ───────────────────────────────────────── */
const PRIORITY_CFG: Record<
  string,
  { label: string; dot: string; chip: string; icon: string }
> = {
  low: {
    label: "Low",
    dot: "bg-slate-400",
    chip: "bg-slate-100 text-slate-500 border border-slate-200",
    icon: "↓",
  },
  medium: {
    label: "Medium",
    dot: "bg-yellow-500",
    chip: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: "→",
  },
  high: {
    label: "High",
    dot: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: "↑",
  },
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-700 border border-red-200",
    icon: "⚠",
  },
};

/* ─── Role label ────────────────────────────────────────────── */
const getRoleLabel = (role_id: number) => {
  switch (role_id) {
    case 1: return "Super Admin";
    case 7: return "Senior Editor";
    case 8: return "Assistant Editor";
    default: return "Admin";
  }
};

/* ─── Helpers ───────────────────────────────────────────────── */
const getInitials = (name: string) =>
  name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
  "from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
];
const getAvatarColor = (str: string) =>
  AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

/* ─── Stat Pill ─────────────────────────────────────────────── */
function StatPill({
  icon: Icon,
  label,
  value,
  dot,
  chipClass,
}: {
  icon: any;
  label: string;
  value: string;
  dot?: string;
  chipClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center">
          <Icon size={13} className="text-slate-400" />
        </div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {dot && <span className={`h-2 w-2 rounded-full ${dot} shadow-sm`} />}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${chipClass}`}>{value}</span>
      </div>
    </div>
  );
}

/* ─── Section Card ──────────────────────────────────────────── */
function SectionCard({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <Icon size={11} className="text-slate-400" />
        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
          {label}
        </span>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export default function TicketViewModal({ ticket, onClose }: any) {
  const [tab, setTab] = useState<"details" | "conversation">("details");

  const name = ticket.ticket_user?.user_profile?.name ?? "Unknown User";
  const email = ticket.ticket_user?.email ?? "";

  const statusKey = (ticket.status ?? "open").toLowerCase();
  const priorityKey = (ticket.priority ?? "medium").toLowerCase();
  const s = STATUS_CFG[statusKey] ?? STATUS_CFG["open"];
  const p = PRIORITY_CFG[priorityKey] ?? PRIORITY_CFG["medium"];

  const createdAt = new Date(ticket.created_at);
  const dateStr = createdAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = createdAt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const messages = ticket.ticket_messages ?? [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl max-h-[90vh] flex flex-col bg-white"
        style={{
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Gradient top bar */}
        <div className={`h-[3px] w-full bg-gradient-to-r ${s.bar}`} />

        {/* ── HEADER ── */}
        <div className="px-6 pt-5 pb-4 bg-white border-b border-slate-100">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200">
              <Hash size={10} className="opacity-60" />
              {ticket.ticket_code}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-100">
              <CalendarDays size={10} className="opacity-60" />
              {dateStr}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-100">
              <Clock size={10} className="opacity-60" />
              {timeStr}
            </span>

            {/* Status badge */}
            <span
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${s.chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>

          {/* Title */}
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold text-slate-800 leading-snug pr-2">
              {ticket.subject}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1.5 mt-4">
            {(["details", "conversation"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all duration-200 border ${
                  tab === t
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {t === "conversation"
                  ? `Conversation (${messages.length})`
                  : "Details"}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">

          {/* ── DETAILS TAB ── */}
          {tab === "details" && (
            <div className="px-6 py-5 space-y-3">

              {/* Status + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <StatPill
                  icon={Activity}
                  label="Status"
                  value={s.label}
                  dot={s.dot}
                  chipClass={s.chip}
                />
                <StatPill
                  icon={AlertTriangle}
                  label="Priority"
                  value={`${p.icon}  ${p.label}`}
                  dot={p.dot}
                  chipClass={p.chip}
                />
              </div>

              {/* Submitted by */}
              <SectionCard icon={User} label="Submitted by">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                  >
                    {getInitials(name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{email}</p>
                  </div>
                </div>
              </SectionCard>

              {/* Assigned to */}
              {ticket.assigned_admin && (
                <SectionCard icon={UserCog} label="Assigned to">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getAvatarColor(ticket.assigned_admin.name)} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                    >
                      {getInitials(ticket.assigned_admin.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {ticket.assigned_admin.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">
                          {getRoleLabel(ticket.assigned_admin.role_id)}
                        </span>
                        <ChevronRight size={9} className="text-slate-300" />
                        <span className="text-[11px] text-slate-400">
                          {ticket.assigned_admin.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Description */}
              {ticket.description && (
                <SectionCard icon={FileText} label="Description">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {ticket.description}
                  </p>
                </SectionCard>
              )}
            </div>
          )}

          {/* ── CONVERSATION TAB ── */}
          {tab === "conversation" && (
            <div className="px-6 py-5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white border border-slate-100 shadow-sm">
                    <MessageCircle size={22} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    No messages yet
                  </p>
                  <p className="text-xs text-slate-400">
                    Conversation will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg: any) => {
                    const isAdmin = msg.sender_role === "admin";
                    const isInternal = msg.is_internal;
                    const msgTime = new Date(msg.created_at).toLocaleTimeString(
                      undefined,
                      { hour: "2-digit", minute: "2-digit" }
                    );

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                            isAdmin
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                              : "bg-gradient-to-br from-slate-400 to-slate-500"
                          }`}
                        >
                          {isAdmin ? "A" : "U"}
                        </div>

                        <div
                          className={`flex flex-col gap-1 max-w-[68%] ${isAdmin ? "items-end" : "items-start"}`}
                        >
                         
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isInternal
                                ? "bg-amber-50 border border-amber-200 text-amber-800"
                                : isAdmin
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700"
                            }`}
                            style={
                              isAdmin && !isInternal
                                ? { boxShadow: "0 4px 14px rgba(59,130,246,0.25)" }
                                : {}
                            }
                          >
                            {msg.message}
                          </div>
                          <span className="text-[10px] text-slate-400 px-1">
                            {msgTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}