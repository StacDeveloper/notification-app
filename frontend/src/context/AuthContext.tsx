"use client"
import { createContext, useContext, useCallback, useState, type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "../types/types"

import axios from "axios"
import toast from "react-hot-toast"

axios.defaults.withCredentials = true

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL! || "http://localhost:3000/api"


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
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()


    const me = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await axios.get(`${API_URL}/auth/findme`,{withCredentials:true})
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
        console.log("req.received")
        try {
            const submit = await axios.post(`${API_URL}/auth/login`, { email, password },{withCredentials:true})
            console.log(submit)
            const after = await me().then(() => toast.success(`Login Success`))
            console.log(after)

        } catch (error: any) {
            console.log(error)
            toast.error(error)
        }

    }, [me])


    const logout = useCallback(async () => {
        await axios.post(`${API_URL}/auth/logout`)
        setUser(null)
        router.push("/login")
    }, [router])

    const register = useCallback(async (name: string, email: string, password: string) => {
        const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password })
        if (data.success) {
            router.push("/dashboard")
        }
        toast.error("Failed to register")
    }, [])

    useEffect(() => {
        me()
    }, [me])


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
