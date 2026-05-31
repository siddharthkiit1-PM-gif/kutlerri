"use client";
/**
 * Email + password sign-in / sign-up. Single form, toggleable flow.
 * Hands off to Convex Auth's Password provider.
 */
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", { email, password, flow });
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        flow === "signUp"
          ? "Couldn't create that account. Try a different email or a stronger password."
          : "Couldn't sign in. Check your email and password.",
      );
      console.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-canvas">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-violet-600">
            Kutlerri
          </p>
          <h1 className="mt-2 text-[26px] leading-[30px] font-semibold tracking-tight text-ink-900">
            {flow === "signIn" ? "Welcome back" : "Get your overnight team"}
          </h1>
          <p className="mt-2 text-[13px] text-ink-400">
            {flow === "signIn"
              ? "Sign in to see what your agents shipped overnight."
              : "Spin up your own catering agent in 30 seconds."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-[14px] text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="you@restaurant.com"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-ink-400">
              Password
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={flow === "signIn" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-[14px] text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="8+ characters"
            />
          </label>

          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-2.5 text-[14px] font-semibold tracking-tight transition-colors"
          >
            {submitting
              ? flow === "signIn"
                ? "Signing in…"
                : "Creating account…"
              : flow === "signIn"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-[12.5px] text-ink-400">
          {flow === "signIn" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setFlow(flow === "signIn" ? "signUp" : "signIn");
            }}
            className="text-violet-600 hover:text-violet-700 font-semibold"
          >
            {flow === "signIn" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
