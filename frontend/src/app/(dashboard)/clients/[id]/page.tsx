"use client"

import { EmailLog } from '@/types/types'
import { useParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import type { Client, EmailStatus } from "../../../../types/types"
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'

interface ClientDetail extends Client {
  emails: EmailLog[]
}

const ClientIdPage = () => {

  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getClientInfo = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/client/getClientById/${id}`)
      setClient(data.data)
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to load client"
      console.log(message)
      toast.error(message)
      setError(message)
    }
    finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    getClientInfo()
  }, [getClientInfo])

  if (loading) {
    return <p className="text-sm" style={{ color: "var(--muted)" }}>Loading client…</p>;
  }

  if (error || !client) {
    return (
      <div className="rounded-xl border p-5 text-sm" style={{ borderColor: "var(--border)", color: "var(--danger)" }}>
        {error ?? "Client not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/clients" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
        ← Back to clients
      </Link>

      <div
        className="rounded-xl border p-5 flex flex-wrap items-center justify-between gap-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div>
          <h2 className="text-lg font-semibold">{client.name}</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {client.email} · {client.company}
          </p>
        </div>
        <Link
          href={`/send-email?clientId=${client.id}`}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          Send email
        </Link>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Email history</h3>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {client.emails.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
              No emails sent to this client yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: "var(--border)" }}>
                  <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>Subject</th>
                  <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
                  <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {client.emails.map((email) => (
                  <tr key={email.id}>
                    <td className="px-5 py-3 font-medium">{email.subject}</td>
                    <td className="px-5 py-3"><StatusBadge status={email.status as EmailStatus} /></td>
                    <td className="px-5 py-3" style={{ color: "var(--muted)" }}>
                      {new Date(email.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientIdPage