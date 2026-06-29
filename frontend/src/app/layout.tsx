import type { Metadata } from "next";
import "../app/globals.css"
import { AuthContextProvider } from "../context/AuthContext"
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Notify-Admin",
    description: "Internal email notification system admin dashboard"
}

export default function RootLayout({ children }: { children: Readonly<ReactNode> }) {
    return (
        <html lang="en" className="h-full antialiased">
            <body className="min-h-full flex flex-col">
                <AuthContextProvider>{children}</AuthContextProvider>
            </body>
        </html>
    )
}