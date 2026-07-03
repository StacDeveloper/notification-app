"use client"

import api from '@/lib/axios'
import { Client } from '@/types/types'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const SendEmailPage = () => {
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState<string>("")
  const [clientId, setClientId] = useState(searchParams.get("clientId"))
  const [form, setForm] = useState<{ subject: string, body: string }>({ subject: "", body: "" })
  const [submit, setSubmit] = useState<boolean>(false)
  const [result, setResult] = useState<{ type: string, message: string } | null>(null)


  const getClients = useCallback(async () => {
    try {
      const { data } = await api.get("/client/getAllClients")
      setClients(data.data)
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to get data"
      console.log(message)
      toast.error(message)
    }

  }, [])

  const filterClients = useMemo(() => {
    if (!search.trim()) return clients
    const query = search.toLowerCase()
    const result = clients.filter((cli) => cli.name.toLowerCase().includes(query) || cli.company.includes(query) || cli.email.includes(query))
    return result

  }, [clients, search])

  const selectedClient = clients.find((cli) => cli.id === clientId)

  async function handleSubmit(e: React.FormEvent) {
    if (form.body.length < 0 || form.subject.length < 0){
      return console.log("Form length is less than 0")
    }
    if (!clientId) {
      setResult({ type: "error", message: "Choose a client before sending." })
    }
    e.preventDefault()
    try {
      await api.post("/email/send-email", { clientId, ...form })
      setForm({ subject: "", body: "" })
    } catch (error: any) {
      const message = error?.response?.data?.message || "failed to send mail"
      toast.error(message)
      console.log(error)
    } finally {
      setSubmit(false)
    }
  }

  useEffect(() => {
    getClients()
  }, [])

  return (
    <div className="max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border p-6 space-y-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {result && (
          <div
            className="rounded-lg px-3 py-2.5 text-sm"
            style={
              result.type === "success"
                ? { background: "var(--success-bg)", color: "var(--success)" }
                : { background: "var(--danger-bg)", color: "var(--danger)" }
            }
            role="status"
          >
            {result.message}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Client</label>
          <input
            type="text"
            placeholder="Search clients by name, company, or email…"
            value={selectedClient ? selectedClient.email : search}
            onChange={(e) => {
              setSearch(e.target.value);
              setClientId("");
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)" }}
          />
          {!selectedClient && search.trim() && (
            <div
              className="rounded-lg border max-h-48 overflow-y-auto divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {filterClients.length === 0 ? (
                <p className="px-3 py-2.5 text-sm" style={{ color: "var(--muted)" }}>
                  No matching clients.
                </p>
              ) : (
                filterClients.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => {
                      setClientId(c.id);
                      setSearch("");
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-black/[0.03]"
                  >
                    <span className="font-medium">{c.name}</span>{" "}
                    <span style={{ color: "var(--muted)" }}>— {c.company} · {c.email}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Subject</label>
          <input
            required
            value={form?.subject}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)" }}
            placeholder="e.g. Missing documents for your application"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Body</label>
          <textarea
            required
            rows={8}
            value={form?.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm resize-y"
            style={{ borderColor: "var(--border)" }}
            placeholder="Write the email body…"
          />
        </div>

        <button
          type="submit"
          disabled={submit}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:cursor-pointer"
          style={{ background: "var(--accent)" }}
        >
          {submit ? "Sending…" : "Send email"}
        </button>
      </form>
    </div>
  );
}

export default SendEmailPage