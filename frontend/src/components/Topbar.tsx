import { useAuthContext } from '@/context/AuthContext'
import React from 'react'
import NotificationBell from './NotificationBell'

const PAGETitles: Record<string, string> = {
  "/": "Dashboard",
  "/clients": "Clients",
  "/send-emails": "Send Email",
  "/logs": "Email Logs",
  "/users": "User Management",
}


const Topbar = ({ pathname }: { pathname: string }) => {

  const { user, logout } = useAuthContext()

  const title = PAGETitles[pathname] ?? (pathname.startsWith("/clients")) ? "Client Details" : "Notify Admin"


  return (
    <header
      className="flex items-center justify-between h-16 px-4 md:px-6 border-b shrink-0"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <h1 className="text-base font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="h-6 w-px" style={{ background: "var(--border)" }} />
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            {user?.name?.slice(0, 1).toUpperCase() ?? "?"}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {user?.role}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="text-sm font-medium px-3 py-1.5 rounded-lg border hover:bg-black/5 transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          Log out
        </button>
      </div>
    </header>
  )
}

export default Topbar