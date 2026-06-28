"use client"

import { Notification } from "@/types/types"
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react"
import { API_URL, useAuthContext } from "./AuthContext"
import axios from "axios"
import toast from "react-hot-toast"
import { usePolling } from "@/hooks/polling"

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
    if (!context) return "Notification Context Not Found"
    return context
}

export const NotificationProvier = ({ children }: { children: ReactNode }) => {

    const { user } = useAuthContext()
    const [notification, setNotification] = useState<Notification[]>([])
    const sinceRef = useRef<string>(new Date().toISOString())
    const loadedRef = useRef<boolean>(false)

    const getNotification = async () => {
        try {
            const data = await axios.get(`${API_URL}/notification`)
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

    usePolling(async () => {
        if (!user) return
        try {
            const { data } = await axios.get(`${API_URL}/notification/get-all-notifications/get-all-notifications`)
            sinceRef.current = data.serverTime
            if (data.data.length > 0) {
                setNotification((prev) => {
                    const exitingIds = new Set(prev.map(n => n.id))
                    const fresh = data.notification.filter((n: any) => n.id !== exitingIds)
                    return [...fresh, ...prev]
                })
            }
        } catch (error: any) {
            console.log(error)
            toast.error(error)
        }
    })

    const markAsRead = useCallback(async (id: string) => {
        setNotification((prev) => prev.map((not) => not.id === id ? { ...not, read: false } : not))
        try {
            await axios.post(`${API_URL}/notifications/${id}/read`)
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