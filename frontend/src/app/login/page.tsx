"use client"

import { useAuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

type FormState = { email: string; password: string }
type Status = "idle" | "submitting" | "error"

const LoginPage = () => {
  const { login } = useAuthContext()
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ email: "", password: "" })
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus("submitting")
    try {
      const submit = await login(form.email, form.password)
      console.log("submit resposne" + submit)
      router.push("/")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Login failed")
      return
    } finally {
      setStatus("idle")
    }

  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-semibold text-lg mb-3" style={{ background: "var(--accent)" }}>
            N
          </div>
          <h1 className="text-lg font-semibold">Notify Admin</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Sign in to manage client email notifications
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border p-6 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {error && (
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }} role="alert">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email" type="email" required autoComplete="email"
              value={form.email} onChange={updateField("email")}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password" type="password" required autoComplete="current-password"
              value={form.password} onChange={updateField("password")}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={status === "submitting"}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {status === "submitting" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage