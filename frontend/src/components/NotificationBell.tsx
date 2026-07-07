import { useNotificationContext } from '@/context/NotificationContext'
import { useEffect, useRef, useState } from 'react'
import BellIcon from './Bellicon'
import { timeAgo } from "../lib/date"
import Link from 'next/link'

const NotificationBell = () => {

    const { notification, unreadCount, markAsRead } = useNotificationContext()
    const [open, setOpen] = useState<boolean>(false)
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", onClick)
        return () => document.removeEventListener("mousedown", onClick)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
                        style={{ background: "var(--danger)" }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}

                {/* Small red dot */}
                {unreadCount > 0 && (
                    <span
                        className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2"
                        style={{ borderColor: "var(--surface)" }}
                    />
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 mt-2 w-80 rounded-xl border shadow-lg z-50 overflow-hidden"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                    <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: "var(--border)" }}>
                        Notifications
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
                        {notification.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
                                No notifications yet.
                            </div>
                        ) : (
                            notification.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => !n.read && markAsRead(n.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-black/[0.03] transition-colors flex gap-2.5"
                                >
                                    <span
                                        className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                                        style={{ background: n.read ? "transparent" : "var(--accent)" }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                                            {n.message}
                                        </p>
                                        <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                        <div className='px-4 py-3 border-t' style={{ borderColor: "var(--border)" }}>
                            <Link
                                href="/notifications"
                                className='block w-full text-center text-sm font-medium py-2 rounded-lg transition-colors'
                                onClick={() => setOpen(false)}
                            >
                                Create Notificaion
                            </Link>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default NotificationBell