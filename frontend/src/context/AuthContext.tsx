"use client"
import { createContext, useContext, useCallback, useState, type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "../types/types"
import toast from "react-hot-toast"
import api from "@/lib/axios"


export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL! || "http://localhost:4000/api"


interface AuthContextValue {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => void
    logout: () => void
    register: (name: string, email: string, password: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuthContext must be used within AuthContextProvider")
    }
    return context
}

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const router = useRouter()


    const me = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get("/auth/findMe")
            console.log(data)
            if (!data.success) {
                toast.error(data.message)
            }
            setUser(data.success ? data.data : null)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

    }, [])


    const login = useCallback(async (email: string, password: string) => {

        try {
            await api.post("/auth/login", { email, password })
            await me()

        } catch (error: any) {
            console.log(error)
            toast.error(error)
        }

    }, [me])


    const logout = useCallback(async () => {
        await api.post("/auth/logout")
        setUser(null)
        router.push("/login")
    }, [router])

    const register = useCallback(async (name: string, email: string, password: string) => {
        const { data } = await api.post("/auth/register", { name, email, password })
        if (data.success) {
            router.push("/dashboard")
        }
        toast.error("Failed to register")
    }, [])

    useEffect(() => {
        me()
    }, [])


    const value: any = {
        user,
        loading,
        login,
        logout,
        register
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
