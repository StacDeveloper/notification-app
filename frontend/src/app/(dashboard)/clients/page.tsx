"use client"

import AddClientModal from "@/components/AddClientModal"
import api from "@/lib/axios"
import { Client } from "@/types/types"
import Link from "next/link"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const ClientPage = () => {

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [modalopen, setModalOpen] = useState<boolean>(false)


  const getAllClients = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/client/getAllClients")
      console.log(data)
      setClients(data.data)
      console.log(data)
    } catch (error:any) {
      console.log(error)
      setError(error)
      toast.error(error)
    }
    finally {
      setLoading(false)
    }

  }

  useEffect(() => {
    getAllClients()
  }, [])


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          + Add client
        </button>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {error && (
          <div className="px-5 py-3 text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left" style={{ borderColor: "var(--border)" }}>
              <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Name
              </th>
              <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Email
              </th>
              <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Company
              </th>
              <th className="px-5 py-3 font-medium" style={{ color: "var(--muted)" }}>
                Added
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center" style={{ color: "var(--muted)" }}>
                  Loading clients…
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center" style={{ color: "var(--muted)" }}>
                  No clients yet. Add your first client to get started.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-black/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3" style={{ color: "var(--muted)" }}>
                    {client.email}
                  </td>
                  <td className="px-5 py-3">{client.company}</td>
                  <td className="px-5 py-3" style={{ color: "var(--muted)" }}>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalopen && (
        <AddClientModal
          onClose={() => setModalOpen(false)}
          onCreated={(client) => {
            setClients((prev) => [client, ...prev]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default ClientPage