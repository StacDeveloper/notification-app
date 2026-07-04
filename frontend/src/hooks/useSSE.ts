"use client"
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const SSE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!.replace("/api", "") + "/api/sse/events"

export function useSSE() {
    const queryClient = useQueryClient()

    useEffect(() => {
        const es = new EventSource(SSE_URL, { withCredentials: true })
        es.addEventListener("email:update", () => {
            // queryClient.invalidateQueries({ queryKey: ["emailLogs"] })
            const loadSummary = async () => {
                try {
                    const { data } = await api.get("/email/list-all-emails")
                    console.log(data)
                } catch (error: any) {
                    console.log(error)

                }
            }
            loadSummary().then(() => console.log(`SSE works fine!`)).catch((err) => console.log(err))

        })
        es.addEventListener("notification:new", () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        })
        es.addEventListener("ping", () => {
            console.log("SSE connected")
        })
        return () => {
            es.close()
        }
    }, [queryClient])
}