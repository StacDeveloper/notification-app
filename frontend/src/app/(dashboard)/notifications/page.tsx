"use client"
import { useCallback, useEffect, useState } from "react"
import api from "@/lib/axios"
import toast from "react-hot-toast"
import { timeAgo } from "@/lib/date"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

type NotificationType = "MISSING_DOCUMENTS" | "EMAIL_FAILED" | "EMAIL_BOUNCED" | "GENERAL"

interface Client { id: string; name: string; email: string }

interface Notification {
    id: string
    type: NotificationType
    message: string
    isRead: boolean
    createdAt: string
    scheduledAt?: string
    client?: { name: string; email: string }
    assignedTo?: { name: string }
}

interface FormState {
    type: NotificationType
    message: string
    clientId: string
    assignedToId: string
    scheduledAt: string // datetime-local value
}

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
    { value: "MISSING_DOCUMENTS", label: "Missing Documents" },
    { value: "EMAIL_FAILED", label: "Email Failed" },
    { value: "EMAIL_BOUNCED", label: "Email Bounced" },
    { value: "GENERAL", label: "General" },
]

const NotificationsPage = () => {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<FormState>({
        type: "GENERAL",
        message: "",
        clientId: "",
        assignedToId: "",
        scheduledAt: "",
    })

    const updateField = (field: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.value }))


    const { data: ClientsData } = useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const { data } = await api.get("/clients/getAllClients")
            return data.data as Client[]
        },
        staleTime: 5 * 60 * 1000
    })
    const { data: notificationData, isLoading: loading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const { data } = await api.get("/notification/get-all-notifications")
            return data.data as Notification[]
        },
        staleTime: 5 * 60 * 1000
    })

    const clients = ClientsData ?? []
    const notifications = notificationData ?? []


    const { mutate: createNotification, isPending: submitting } = useMutation({
        mutationFn: async () => {
            const payLoad = {
                type: form.type,
                message: form.message,
                ...(form.clientId && { clientId: form.clientId }),
                ...(form.assignedToId && { assignedToId: form.assignedToId }),
                ...(form.scheduledAt && { scheduledAt: new Date(form.scheduledAt).toISOString() })

            }
            const { data } = await api.post("/notification/create-notification", payLoad)
            return data
        },
        onSuccess: () => {
            toast.success("Notification created successfully")
            setForm({ type: "GENERAL", message: "", clientId: "", assignedToId: "", scheduledAt: "" })
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
        onError: (e: any) => {
            toast.error(e?.resposne?.data?.message || "Failed to create notification")
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.message.trim()) return toast.error("Message is required")
        createNotification()
    }



    const typeColors: Record<NotificationType, string> = {
        MISSING_DOCUMENTS: "var(--warning)",
        EMAIL_FAILED: "var(--danger)",
        EMAIL_BOUNCED: "var(--danger)",
        GENERAL: "var(--accent)",
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-lg font-semibold">Notifications</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                    Create and manage staff notifications. Set a scheduled time to receive an email reminder.
                </p>
            </div>

            {/* Create form */}
            <form
                onSubmit={handleSubmit}
                className="rounded-xl border p-5 space-y-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
                <h2 className="text-sm font-semibold">Create notification</h2>

                {/* Type */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Type</label>
                    <select
                        value={form.type}
                        onChange={updateField("type")}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                    >
                        {TYPE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                        value={form.message}
                        onChange={updateField("message")}
                        rows={3}
                        required
                        placeholder="e.g. Please send missing documents by Friday"
                        className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
                        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                    />
                </div>

                {/* Client (optional) */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                        Client <span style={{ color: "var(--muted)" }}>(optional)</span>
                    </label>
                    <select
                        value={form.clientId}
                        onChange={updateField("clientId")}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                    >
                        <option value="">— No client —</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} · {c.email}</option>
                        ))}
                    </select>
                </div>

                {/* Scheduled time */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                        Remind me at <span style={{ color: "var(--muted)" }}>(optional — sends you an email at this time)</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={updateField("scheduledAt")}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: "var(--accent)" }}
                >
                    {submitting ? "Creating…" : "Create notification"}
                </button>
            </form>

            {/* Notification list */}
            <div
                className="rounded-xl border overflow-hidden"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
                <div className="px-5 py-4 border-b text-sm font-semibold" style={{ borderColor: "var(--border)" }}>
                    All notifications
                </div>
                {loading ? (
                    <p className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
                ) : notifications.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>No notifications yet.</p>
                ) : (
                    <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                        {notifications.map(n => (
                            <div key={n.id} className="px-5 py-4 flex gap-3">
                                <span
                                    className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                                    style={{ background: n.isRead ? "transparent" : typeColors[n.type] }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: `${typeColors[n.type]}20`, color: typeColors[n.type] }}
                                        >
                                            {n.type.replace(/_/g, " ")}
                                        </span>
                                        {n.client && (
                                            <span className="text-xs" style={{ color: "var(--muted)" }}>
                                                · {n.client.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm mt-1">{n.message}</p>
                                    {n.scheduledAt && (
                                        <p className="text-xs mt-0.5" style={{ color: "var(--warning)" }}>
                                            ⏰ Reminder at {new Date(n.scheduledAt).toLocaleString()}
                                        </p>
                                    )}
                                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                                        {timeAgo(n.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scheduler note */}
        </div>
    )
}

export default NotificationsPage