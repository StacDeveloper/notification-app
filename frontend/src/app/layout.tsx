"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../app/globals.css"
import { AuthContextProvider } from "../context/AuthContext"
import { ReactNode, useState } from "react";




export default function RootLayout({ children }: { children: Readonly<ReactNode> }) {

    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                retry: 1
            }
        }
    }))
    return (
        <html lang="en" className="h-full antialiased">
            <body className="min-h-full flex flex-col">
                <QueryClientProvider client={queryClient}>
                    <AuthContextProvider>
                        {children}
                    </AuthContextProvider>
                </QueryClientProvider>
            </body>
        </html>
    )
}