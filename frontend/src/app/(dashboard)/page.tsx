"use client"
import { useEffect, useState } from "react"
import { timeAgo } from "../../lib/date"
import type { DashboardSummary } from "../../types/types"
import { useNotificationContext } from "@/context/NotificationContext"
import axios from "axios"
import { API_URL } from "@/context/AuthContext"
import toast from "react-hot-toast"
import { usePolling } from "@/hooks/polling"
import api from "@/lib/axios"

const Cards: { key: keyof DashboardSummary, label: string, color: string, bg: string }[] = [
    { key: "sentToday", label: "Emails sent today", color: "var(--accent)", bg: "var(--accent-soft)" },
    { key: "pending", label: "Pending", color: "var(--warning)", bg: "var(--warning-bg)" },
    { key: "failed", label: "Failed", color: "var(--danger)", bg: "var(--danger-bg)" },
]

const DashboardPage = () => {

    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const { notification, markAsRead } = useNotificationContext()

    const loadSummary = async () => {
        setLoading(true)
        try {
            const { data } = await api.get("/email/list-all-emails")
            if (data.success) {
                setSummary(data.data)
            }
        } catch (error: any) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSummary()
    }, [])

    usePolling(loadSummary, 4000)

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Cards.map((card) => (
                    <div
                        key={card.key}
                        className="rounded-xl border p-5"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                                {card.label}
                            </p>
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: card.color }}
                                aria-hidden
                            />
                        </div>
                        <p className="text-3xl font-semibold mt-3">
                            {loading ? "—" : summary?.[card.key] ?? 0}
                        </p>
                    </div>
                ))}
            </div>

            <div
                className="rounded-xl border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
                <div
                    className="px-5 py-4 border-b flex items-center justify-between"
                    style={{ borderColor: "var(--border)" }}
                >
                    <h2 className="text-sm font-semibold">Live notifications</h2>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Updates every 4s
                    </span>
                </div>

                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {notification.length === 0 ? (
                        <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--muted)" }}>
                            Nothing yet — new activity will show up here automatically.
                        </p>
                    ) : (
                        notification.slice(0, 8).map((n) => (
                            <button
                                key={n.id}
                                onClick={() => !n.read && markAsRead(n.id)}
                                className="w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-black/[0.02] transition-colors"
                            >
                                <span
                                    className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                                    style={{ background: n.read ? "transparent" : "var(--accent)" }}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                                    <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                                        {n.message}
                                    </p>
                                </div>
                                <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>
                                    {timeAgo(n.createdAt)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage