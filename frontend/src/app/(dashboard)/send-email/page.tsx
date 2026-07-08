"use client"

import api from '@/lib/axios'
import { Client } from '@/types/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const EMAIL_TEMPLATES = {
  general: {
    subject: "General Update",
    body: `Dear Client,

I hope you are doing well.

We wanted to provide you with an update regarding your application. If you have any questions or require any assistance, please don't hesitate to contact us.

Kind regards,
Your Team`
  },
  missingDocuments: {
    subject: "Missing Documents Required",
    body: `Dear Client,

We are currently reviewing your application and noticed that some required documents are still missing.

Please send the outstanding documents at your earliest convenience so we can continue processing your application without delay.

If you have any questions regarding the required documents, please let us know.

Kind regards,
Your Team`
  },
  emailFailed: {
    subject: "Unable to Deliver Previous Email",
    body: `Dear Client,

We recently attempted to contact you, but it appears our previous email could not be delivered successfully.

Please reply to this email or contact us to confirm your correct email address so we can resend the information.

Kind regards,
Your Team`
  },
  emailBounced: {
    subject: "Email Address Requires Verification",
    body: `Dear Client,

Our recent email to your registered email address was returned as undeliverable.

Please confirm your current email address so we can continue communicating important updates regarding your application.

Thank you for your cooperation.

Kind regards,
Your Team`
  }
} as const

const SendEmailPage = () => {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState<string>("")
  const [clientId, setClientId] = useState(searchParams.get("clientId"))
  const [form, setForm] = useState<{ subject: string, body: string }>({ subject: "", body: "" })
  const [submit, setSubmit] = useState<boolean>(false)
  const [result, setResult] = useState<{ type: string, message: string } | null>(null)
  const [template, setTemplate] = useState<keyof typeof EMAIL_TEMPLATES>("general")


  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as keyof typeof EMAIL_TEMPLATES | any
    setTemplate(value)
    if (value === "custom") {
      setForm({
        subject: "",
        body: ""
      })
      return
    }
    const selected = EMAIL_TEMPLATES[value as keyof typeof EMAIL_TEMPLATES]
    setForm({
      subject: selected.subject,
      body: selected.body
    })
  }

  const { data: clientData, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await api.get("/clients/getAllClients")
      return data.data as Client[]
    },
    staleTime: 5 * 60 * 1000
  })

  const clients = clientData ?? []
  const filterClients = useMemo(() => {
    if (!search.trim()) return clients
    const query = search.toLowerCase()
    const result = clients.filter((cli) => cli.name.toLowerCase().includes(query) || cli.company.includes(query) || cli.email.includes(query))
    return result

  }, [clients, search])

  const selectedClient = clients.find((cli) => cli.id === clientId)


  const { mutate: sendEmail, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/email/send-email", { clientId, ...form })
      return data
    },
    onSuccess: () => {
      toast.success("Email Sent successfully")
      setForm({ subject: "", body: "" })
      queryClient.invalidateQueries({ queryKey: ["emailLogs"] })
    },
    onError: (error: any) => {
      const message = error?.response?.data.message || "Failed to send email"
      toast.error(message)
    }
  })

  async function handleSubmit(e: React.FormEvent) {
    if (form.body.length < 0 || form.subject.length < 0) {
      return console.log("Form length is less than 0")
    }
    if (!clientId) {
      setResult({ type: "error", message: "Choose a client before sending." })
    }
    e.preventDefault()
    sendEmail()
  }

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
          <label className="text-sm font-medium">Email Type</label>

          <select
            value={template}
            onChange={handleTemplateChange}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <option value="general">General</option>
            <option value="missingDocuments">Missing Documents</option>
            <option value="emailFailed">Email Failed</option>
            <option value="emailBounced">Email Bounced</option>
            <option value="custom">Create Your Own</option>
          </select>
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