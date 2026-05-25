"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      // Use a full-page navigation so the root layout re-renders with the
      // freshly set auth cookie in scope. A client-side router.push() leaves
      // the persistent layout stale until the next refresh, which races with
      // the navigation. window.location is bulletproof for auth transitions.
      window.location.assign("/products");
      return;
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-testid="page-login" className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Log in</h1>
      <form
        onSubmit={handleSubmit}
        data-testid="login-form"
        className="space-y-4 rounded border border-slate-200 bg-white p-6"
      >
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            data-testid="login-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            data-testid="login-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
        {error && (
          <p
            data-testid="error-login"
            className="rounded bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          data-testid="login-submit"
          className="w-full rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? (
            <span data-testid="loading">Signing in...</span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-500">
        Try <code>alice@test.com</code> / <code>password123</code>.
      </p>
    </div>
  );
}
