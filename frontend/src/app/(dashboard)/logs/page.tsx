"use client"

import api from '@/lib/axios'
import { Client, EmailLog, EmailStatus } from '@/types/types'
import toast from 'react-hot-toast'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { usePolling } from '@/hooks/polling'
import StatusBadge from '@/components/StatusBadge'


interface Log extends EmailLog{
  client:Client
}


const STATUS_FILTERS: ("ALL" | EmailStatus)[] = ["ALL", 'BOUNCED', 'DELIVERED', 'FAILED', 'PENDING', 'SENT']

const logsPage = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | EmailStatus>("ALL")
  const sinceRef = useRef<string>(new Date().toISOString())

  const getEmailLogs = useCallback(async () => {
    try {
      const data = await api.get("/email/logs/updates")
      setLogs(data.data.data)
      sinceRef.current = data.data.data.serverTime
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to get logs"
      console.log(error)
      toast.error(message)
    }
    finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getEmailLogs()
  }, [])


  const filteredLogs = filter === "ALL" ? logs : logs.filter((log) => log.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
            style={
              filter === status
                ? { background: "var(--accent)", color: "white", borderColor: "var(--accent)" }
                : { borderColor: "var(--border)", color: "var(--muted)" }
            }
          >
            {status}
          </button>
        ))}
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left" style={{ borderColor: "var(--border)" }}>
              <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>Client</th>
              <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>Subject</th>
              <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
              <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center" style={{ color: "var(--muted)" }}>
                  Loading logs…
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center" style={{ color: "var(--muted)" }}>
                  No emails match this filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/[0.02]">
                  <td className="px-5 py-3 font-medium">{log.client.name}</td>
                  <td className="px-5 py-3" style={{ color: "var(--muted)" }}>{log.subject}</td>
                  <td className="px-5 py-3"><StatusBadge status={log.status as EmailStatus} /></td>
                  <td className="px-5 py-3" style={{ color: "var(--muted)" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default logsPage