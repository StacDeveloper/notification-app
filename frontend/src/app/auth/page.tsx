"use client"

import { useAuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Mode = "login" | "register"
type Status = "idle" | "submitting" | "error"

type LoginForm = { email: string; password: string }
type RegisterForm = { name: string; email: string; password: string }

const AuthPage = () => {
  const { login, register } = useAuthContext()
  const router = useRouter()

  const [mode, setMode] = useState<Mode>("login")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState<RegisterForm>({ name: "", email: "", password: "" })

  const updateLogin = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLoginForm((prev) => ({ ...prev, [field]: e.target.value }))

  const updateRegister = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setRegisterForm((prev) => ({ ...prev, [field]: e.target.value }))

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus("submitting")
    try {
      if (mode === "login") {
        await login(loginForm.email, loginForm.password)
      } else {
        await register(registerForm.name, registerForm.email, registerForm.password)
      }
      router.push("/")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : `${mode === "login" ? "Login" : "Registration"} failed`)
      return
    }
    setStatus("idle")
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
            {mode === "login" ? "Sign in to manage client email notifications" : "Create a new staff account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border p-6 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {error && (
            <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }} role="alert">
              {error}
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                id="name" type="text" required autoComplete="name"
                value={registerForm.name} onChange={updateRegister("name")}
                className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email" type="email" required autoComplete="email"
              value={mode === "login" ? loginForm.email : registerForm.email}
              onChange={mode === "login" ? updateLogin("email") : updateRegister("email")}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              {mode === "login" && (
                <a href="/forgot-password" className="text-xs hover:underline" style={{ color: "var(--accent)" }}>
                  Forgot password?
                </a>
              )}
            </div>
            <input
              id="password" type="password" required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={mode === "login" ? loginForm.password : registerForm.password}
              onChange={mode === "login" ? updateLogin("password") : updateRegister("password")}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={status === "submitting"}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {status === "submitting" ? (mode === "login" ? "Signing in…" : "Creating account…") : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
            {mode === "login" ? "Need to add a staff member?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default AuthPage