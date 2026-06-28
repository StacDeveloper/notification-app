import type { Metadata } from "next";
import "../../globals.css"
import { AuthContextProvider } from "../context/AuthContext"
import type { ReactNode } from "react";

export default function RootLayout(
    { children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" className="h-full antialiased">
            <body className="min-h-full flex flex-col">
                <AuthContextProvider>
                    {children}
                </AuthContextProvider>
            </body>
        </html>
    )
}