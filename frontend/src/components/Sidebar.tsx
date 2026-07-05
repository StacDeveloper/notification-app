import { useAuthContext } from '@/context/AuthContext';
import { useSidebarContext } from '@/context/SidebarContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NavLink = [
  { href: "/", label: "Dashboard", icon: GridIcon },
  { href: "/clients", label: "Clients", icon: UsersIcon },
  { href: "/send-email", label: "Send Email", icon: SendIcon },
  { href: "/logs", label: "Logs", icon: ListIcon },
  { href: "/notifications", label: "Notifications", icon: ListIcon },
]

const Sidebar = () => {
  const pathname = usePathname()
  const { user } = useAuthContext()
  const router = useRouter()
  const { open, close } = useSidebarContext()

  const navContent = (
    <>
      <div className="flex items-center gap-2 px-5 h-16 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-semibold"
          style={{ background: "var(--accent)" }}
        >
          N
        </div>
        <span
          className="font-semibold text-[15px] hover:cursor-pointer"
          onClick={() => { router.push("/"); close(); }}
        >
          Notify Admin
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NavLink.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={
                active
                  ? { background: "var(--accent-soft)", color: "var(--accent)" }
                  : { color: "var(--muted)" }
              }
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}

        {user?.role === "ADMIN" && (
          <Link
            href="/users"
            onClick={close}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={
              pathname === "/users"
                ? { background: "var(--accent-soft)", color: "var(--accent)" }
                : { color: "var(--muted)" }
            }
          >
            <ShieldIcon />
            User Management
          </Link>
        )}
      </nav>

      <div className="px-5 py-4 text-xs" style={{ color: "var(--muted)" }}>
        Internal email notifications
      </div>
    </>
  );

  return (
    <>
      {/* Overlay (mobile only, shown when open) */}
      {open && (
        <div
          onClick={close}
          className="md:hidden fixed inset-0 z-40 transition-opacity"
          style={{ background: "rgba(0,0,0,0.4)" }}
        />
      )}

      {/* Mobile slide-in drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 flex flex-col border-r transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar (unchanged) */}
      <aside
        className="hidden md:flex md:w-60 md:flex-col shrink-0 border-r"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {navContent}
      </aside>
    </>
  );
}

export default Sidebar

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="8" r="2.6" />
      <path d="M21 20c0-2.6-1.6-4.8-3.8-5.6" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
    </svg>
  );
}
