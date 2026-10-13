/** @format */

import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldAlert,
  User,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateUserAPI } from "@/services/Api/UserApi";
import "./Adduser.scss";

/* ── Password generator ──
   Uses crypto.getRandomValues, guarantees one of each character class,
   and skips look-alike characters (0/O, 1/l/I) so it's easy to read aloud
   or type from a message. */
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "@#$%&*!?";

const randomIndex = (max: number) => {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
};

const generatePassword = (length = 12) => {
  const all = LOWER + UPPER + DIGITS + SYMBOLS;
  const chars = [
    LOWER[randomIndex(LOWER.length)],
    UPPER[randomIndex(UPPER.length)],
    DIGITS[randomIndex(DIGITS.length)],
    SYMBOLS[randomIndex(SYMBOLS.length)],
  ];
  while (chars.length < length) chars.push(all[randomIndex(all.length)]);
  // Fisher–Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};

/* Clipboard with a fallback for non-HTTPS / older browsers */
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Credentials = { name: string; email: string; password: string };

const AddUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);

  const [created, setCreated] = useState<Credentials | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Enter the user's full name.";
    if (!email.trim()) next.email = "Enter an email address.";
    else if (!EMAIL_RE.test(email.trim()))
      next.email = "This email address isn't valid. Check for typos.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const password = generatePassword();
    setLoading(true);
    try {
      const res = await CreateUserAPI({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      const data = res.data?.data || {};
      setCreated({
        name: name.trim(),
        email: data.email || email.trim().toLowerCase(),
        password: data.password || password,
      });
      setShowPassword(true);
      toast({ title: "User created" });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === "You are not authorized to access this route") {
        navigate("/unauthorized");
        return;
      }
      if (msg?.toLowerCase().includes("already exists")) {
        setErrors({ email: "An account with this email already exists." });
      } else {
        toast({
          title: "Couldn't create user",
          description: msg || "Check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (key: string, text: string, label: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedKey(key);
      toast({ title: `${label} copied` });
      window.setTimeout(
        () => setCopiedKey((k) => (k === key ? null : k)),
        1800,
      );
    } else {
      toast({ title: "Copy failed. Select the text manually.", variant: "destructive" });
    }
  };

  const handleCreateAnother = () => {
    setCreated(null);
    setName("");
    setEmail("");
    setErrors({});
    setCopiedKey(null);
    window.setTimeout(() => nameRef.current?.focus(), 0);
  };

  const loginMessage = created
    ? `Hi ${created.name.split(" ")[0]},\n\nYour TurningPages account is ready.\n\nEmail: ${created.email}\nPassword: ${created.password}\n\nPlease sign in and change your password after your first login.`
    : "";

  return (
    <div className="add-user-root">
      <button className="au-back" onClick={() => navigate("/users")}>
        <ArrowLeft size={15} />
        Back to users
      </button>

      <div className="au-layout">
        {/* ── LEFT: context ── */}
        <aside className="au-intro">
          <div className="au-intro-icon">
            <UserPlus size={20} />
          </div>
          <h1 className="au-title">
            {created ? "Account ready" : "Add a user"}
          </h1>
          <p className="au-sub">
            {created
              ? "Copy these login details and send them to the user yourself. A copy was also emailed to them."
              : "Enter their name and email. We'll create the account with a secure password you can share with them."}
          </p>

          <ol className="au-steps">
            <li className={`au-step ${!created ? "is-current" : "is-done"}`}>
              <span className="au-step-dot">
                {created ? <Check size={12} /> : 1}
              </span>
              Enter details
            </li>
            <li className={`au-step ${created ? "is-current" : ""}`}>
              <span className="au-step-dot">2</span>
              Share login details
            </li>
          </ol>
        </aside>

        {/* ── RIGHT: form or credentials ── */}
        <section className="au-panel">
          {!created ? (
            <form className="au-form" onSubmit={handleSubmit} noValidate>
              <div className="au-field">
                <label htmlFor="au-name">Full name</label>
                <div className={`au-input-wrap ${errors.name ? "has-error" : ""}`}>
                  <User size={15} className="au-input-icon" />
                  <input
                    id="au-name"
                    ref={nameRef}
                    autoFocus
                    autoComplete="off"
                    placeholder="Jane Austen"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "au-name-err" : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="au-name-err" className="au-error">{errors.name}</p>
                )}
              </div>

              <div className="au-field">
                <label htmlFor="au-email">Email address</label>
                <div className={`au-input-wrap ${errors.email ? "has-error" : ""}`}>
                  <Mail size={15} className="au-input-icon" />
                  <input
                    id="au-email"
                    type="email"
                    autoComplete="off"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "au-email-err" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="au-email-err" className="au-error">{errors.email}</p>
                )}
              </div>

              <div className="au-note">
                <KeyRound size={14} />
                A 12-character password is generated automatically.
              </div>

              <button type="submit" className="au-btn-primary" disabled={loading}>
                {loading ? (
                  <Loader2 size={15} className="spin" />
                ) : (
                  <UserPlus size={15} />
                )}
                {loading ? "Creating user…" : "Create user"}
              </button>
            </form>
          ) : (
            <div className="au-result">
              {/* Credentials slip */}
              <div className="au-slip">
                <div className="au-slip-head">
                  <div className="au-slip-avatar">
                    {created.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="au-slip-name">{created.name}</div>
                    <div className="au-slip-status">
                      <span className="au-dot" /> Active account
                    </div>
                  </div>
                </div>

                <div className="au-slip-perf" aria-hidden="true" />

                <div className="au-cred">
                  <div className="au-cred-label">Email</div>
                  <div className="au-cred-row">
                    <span className="au-cred-value">{created.email}</span>
                    <button
                      className={`au-copy ${copiedKey === "email" ? "is-copied" : ""}`}
                      onClick={() => handleCopy("email", created.email, "Email")}
                      aria-label="Copy email"
                    >
                      {copiedKey === "email" ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === "email" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="au-cred">
                  <div className="au-cred-label">Password</div>
                  <div className="au-cred-row">
                    <span className="au-cred-value au-cred-value--pw">
                      {showPassword ? created.password : "•".repeat(created.password.length)}
                    </span>
                    <button
                      className="au-icon-btn"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      className={`au-copy ${copiedKey === "password" ? "is-copied" : ""}`}
                      onClick={() => handleCopy("password", created.password, "Password")}
                      aria-label="Copy password"
                    >
                      {copiedKey === "password" ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === "password" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <button
                  className={`au-copy-all ${copiedKey === "all" ? "is-copied" : ""}`}
                  onClick={() => handleCopy("all", loginMessage, "Login message")}
                >
                  {copiedKey === "all" ? <Check size={15} /> : <Copy size={15} />}
                  {copiedKey === "all" ? "Message copied" : "Copy as message"}
                </button>
              </div>

              <div className="au-warning">
                <ShieldAlert size={15} />
                <span>
                  This password won't be shown again after you leave this page.
                  Copy it before you go.
                </span>
              </div>

              <div className="au-result-actions">
                <button className="au-btn-ghost" onClick={() => navigate("/users")}>
                  <UsersIcon size={15} />
                  Back to users
                </button>
                <button className="au-btn-primary" onClick={handleCreateAnother}>
                  <UserPlus size={15} />
                  Add another user
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AddUser;