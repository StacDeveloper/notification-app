"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"
import { NotificationProvier } from "@/context/NotificationContext"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"


const DashBoardShell = ({ children }: { children: ReactNode })=> {
    const { user, loading } = useAuthContext()
    const router = useRouter()
    const pathname = usePathname()


    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login")
        }

    }, [loading, user, router])

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ background: "var(--background)" }}>
                <div
                    className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                />
            </div>
        );
    }

    return (
        <NotificationProvier>
            <div className="flex h-screen" style={{ background: "var(--background)" }}>
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Topbar pathname={pathname} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
                </div>
            </div>
        </NotificationProvier>
    )
}

export default DashBoardShell