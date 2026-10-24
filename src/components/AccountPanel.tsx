"use client";

import { useState } from "react";

export default function AccountPanel({ next }: { next: string }) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (busy) return;

        setBusy(true);
        setMessage("Signing in…");

        try {
            const res = await fetch(`/api/auth/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Request failed (${res.status})`);
            }

            const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
            const destination = safeNext === "/" && data.role === "ADMIN" ? "/admin" : safeNext;
            window.location.assign(destination);
        } catch (err) {
            setMessage(
                err instanceof Error ? err.message : "Request failed. Please try again."
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="card" style={{ padding: 22, marginTop: 20 }}>
            <div className="row">
                <button
                    type="button"
                    className={`btn ${mode === "login" ? "" : "secondary"}`}
                    onClick={() => {
                        setMode("login");
                        setMessage("");
                    }}
                >
                    Sign in
                </button>

                <button
                    type="button"
                    className={`btn ${mode === "register" ? "" : "secondary"}`}
                    onClick={() => {
                        setMode("register");
                        setMessage("");
                    }}
                >
                    Create account
                </button>
            </div>

            <form onSubmit={submit} style={{ marginTop: 20 }}>
                {mode === "register" && (
                    <label className="field">
                        Full name
                        <input
                            id="account-name"
                            name="name"
                            autoComplete="name"
                            required
                            minLength={2}
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                    </label>
                )}

                <label className="field">
                    Email
                    <input
                        id="account-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </label>

                {mode === "register" && (
                    <label className="field">
                        Phone (optional)
                        <input
                            id="account-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                        />
                    </label>
                )}

                <label className="field">
                    Password
                    <input
                        id="account-password"
                        name="password"
                        type="password"
                        autoComplete={
                            mode === "login" ? "current-password" : "new-password"
                        }
                        required
                        minLength={8}
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />
                </label>

                <button
                    type="submit"
                    className="btn"
                    disabled={busy}
                    style={{ width: "100%" }}
                >
                    {busy
                        ? "Please wait…"
                        : mode === "login"
                            ? "Sign in"
                            : "Create account"}
                </button>

                {message && (
                    <p role="status" aria-live="polite" style={{ color: "#a33" }}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}