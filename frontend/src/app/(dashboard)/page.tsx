"use client"
import { useEffect, useState, useCallback } from "react"
import { timeAgo } from "../../lib/date"
import type { EmailStatus } from "../../types/types"
import toast from "react-hot-toast"
import api from "@/lib/axios"
import StatusBadge from "@/components/StatusBadge"

interface EmailLog {
  id: string
  subject: string
  body: string
  status: EmailStatus
  createdAt: string
  client: { id: string; name: string; email: string; company: string }
  sentBy: { id: string; name: string }
  errorMessage: string | null
}

interface Summary {
  sentToday: number
  pending: number
  failed: number
}

const PAGE_SIZE = 10
const PREVIEW_LENGTH = 80

const Cards: { key: keyof Summary; label: string; color: string; bg: string }[] = [
  { key: "sentToday", label: "Emails sent today", color: "var(--accent)", bg: "var(--accent-soft)" },
  { key: "pending", label: "Pending", color: "var(--warning)", bg: "var(--warning-bg)" },
  { key: "failed", label: "Failed", color: "var(--danger)", bg: "var(--danger-bg)" },
]

const DashboardPage = () => {
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [skip, setSkip] = useState(0)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadEmails = useCallback(async (skipVal = 0, append = false) => {
    skipVal === 0 ? setLoading(true) : setLoadingMore(true)
    try {
      const { data } = await api.get(`/email/list-all-emails?take=${PAGE_SIZE}&skip=${skipVal}`)
      if (data.success) setEmails((prev) => append ? [...prev, ...data.data] : data.data)
      setTotal(data.total)
      setSkip(skipVal)
      console.log(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEmails(0)
  }, [loadEmails])

  const hasMore = skip + PAGE_SIZE < total

  // derive summary from data — no extra API call needed
  const today = new Date().toDateString()
  const summary: Summary = {
    sentToday: emails.filter(e => new Date(e.createdAt).toDateString() === today).length,
    pending: emails.filter(e => e.status === "PENDING").length,
    failed: emails.filter(e => e.status === "FAILED" || e.status === "BOUNCED").length,
  }

  const visible = emails.slice(0, visibleCount)

  const toggle = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id))

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Cards.map(card => (
          <div
            key={card.key}
            className="rounded-xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                {card.label}
              </p>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: card.color }} />
            </div>
            <p className="text-3xl font-semibold mt-3">
              {loading ? "—" : summary[card.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Email list */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-semibold">Recent emails</h2>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {emails.length} total
          </span>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--muted)" }}>
            Loading…
          </p>
        ) : emails.length === 0 ? (
          <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--muted)" }}>
            No emails sent yet.
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {visible.map(email => {
              const isOpen = expandedId === email.id
              const preview = email.body.length > PREVIEW_LENGTH
                ? email.body.slice(0, PREVIEW_LENGTH) + "..."
                : email.body

              return (
                <div key={email.id}>
                  {/* collapsed row */}
                  <button
                    onClick={() => toggle(email.id)}
                    className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-black/[0.02] transition-colors"
                  >
                    {/* left: subject + preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">{email.subject}</span>
                        <StatusBadge status={email.status as EmailStatus} />
                      </div>
                      <p className="text-sm mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                        {preview}
                      </p>
                    </div>

                    {/* right: time + chevron */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {timeAgo(email.createdAt)}
                      </span>
                      <svg
                        className="transition-transform duration-200"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                      >
                        <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>

                  {/* expanded detail */}
                  {isOpen && (
                    <div
                      className="px-5 pb-5 pt-1 border-t text-sm space-y-3"
                      style={{ borderColor: "var(--border)", background: "var(--background)" }}
                    >
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>To</p>
                          <p>{email.client.name} · {email.client.email}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>Sent by</p>
                          <p>{email.sentBy.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>Subject</p>
                          <p>{email.subject}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>Status</p>
                          <StatusBadge status={email.status as EmailStatus} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Message</p>
                        <p className="leading-relaxed whitespace-pre-wrap">{email.body}</p>
                      </div>
                      {email.errorMessage && (
                        <div
                          className="rounded-lg px-3 py-2 text-xs"
                          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
                        >
                          Error: {email.errorMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* load more */}
        {hasMore && (
          <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="w-full text-sm font-medium py-2 rounded-lg border transition-colors hover:bg-black/[0.03]"
              style={{ borderColor: "var(--border)", color: "var(--accent)" }}
            >
              {loadingMore ? "Loading…" : `Load more (${total - skip - PAGE_SIZE} remaining)`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage