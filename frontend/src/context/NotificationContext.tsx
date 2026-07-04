"use client"
import type { Notification } from "../types/types"
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react"
import { useAuthContext } from "./AuthContext"
import toast from "react-hot-toast"
import api from "@/lib/axios"

interface NotificationUpdateResponse {
    notification: Notification[]
    serverTime: string
}

interface NotificationContextValue {
    notification: Notification[]
    unreadCount: number
    markAsRead: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)


export const useNotificationContext = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error("Failed to setup Notification context")
    }
    return context
}

export const NotificationProvier = ({ children }: { children: ReactNode }) => {

    const { user } = useAuthContext()
    const [notification, setNotification] = useState<Notification[]>([])
    const sinceRef = useRef<string>(new Date().toISOString())
    const loadedRef = useRef<boolean>(false)

    const getNotification = async () => {
        try {
            const data = await api.get("/notification/get-all-notifications")
            if (!data.data.success) return toast.error(data.data.message)
            setNotification(data.data.data)
        } catch (error: any) {
            console.error(error)
            toast.error(error)
        }
    }

    useEffect(() => {
        if (!user) {
            setNotification([])
            loadedRef.current = false
            return
        }
        if (loadedRef.current) return
        loadedRef.current = true
        getNotification()
    }, [user])



    const markAsRead = useCallback(async (id: string) => {
        setNotification((prev) => prev.map((not) => not.id === id ? { ...not, read: false } : not))
        try {
            await api.get(`notification/${id}/read`)
        } catch (error: any) {
            console.log(error || "Failed to post read data")
            toast.error(error)
        }
    }, [])

    const unreadCount = notification.filter((not) => not.read === false)

    const value: any = {
        notification,
        unreadCount,
        markAsRead

    }
    return <NotificationContext.Provider value={value}>
        {children}
    </NotificationContext.Provider>
}