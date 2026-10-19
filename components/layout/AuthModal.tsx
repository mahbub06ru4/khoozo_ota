"use client";

import { Eye, EyeOff, Loader2, Lock, Mail, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppProvider";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AuthModal() {
  const { authOpen, closeAuth, login } = useApp();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && name.trim().length < 2) e.name = "Please enter your full name";
    if (!EMAIL_RE.test(email)) e.email = "Enter a valid email address";
    if (password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    login({ name: mode === "signup" ? name.trim() : email.split("@")[0], email: email.trim().toLowerCase() });
    setSubmitting(false);
    setPassword("");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
  };

  return (
    <Modal open={authOpen} onClose={closeAuth} title={mode === "login" ? "Welcome back" : "Create your account"}>
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn("rounded-lg py-2 transition", mode === m ? "bg-white text-brand-700 shadow-sm" : "text-ink-500")}
          >
            {m === "login" ? "Login" : "Sign up"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {mode === "signup" && (
          <Field label="Full name" error={errors.name} icon={<UserRound className="size-4" />}>
            <input
              className={cn("input pl-10", errors.name && "input-error")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="As on passport"
            />
          </Field>
        )}
        <Field label="Email" error={errors.email} icon={<Mail className="size-4" />}>
          <input
            type="email"
            className={cn("input pl-10", errors.email && "input-error")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" error={errors.password} icon={<Lock className="size-4" />}>
          <input
            type={showPw ? "text" : "password"}
            className={cn("input pl-10 pr-10", errors.password && "input-error")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="Minimum 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-900"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </Field>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "login" ? "Login" : "Create account"}
        </button>
        <p className="text-center text-xs text-ink-500">
          Demo environment — accounts are stored only in this browser. By continuing you agree to our Terms & Privacy Policy.
        </p>
      </form>
    </Modal>
  );
}

function Field({ label, error, icon, children }: { label: string; error?: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">{icon}</span>
        {children}
      </span>
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
