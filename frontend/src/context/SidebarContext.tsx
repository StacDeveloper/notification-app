"use client"
import { createContext, ReactNode, useContext, useState } from "react";

interface SidebarProps {
    open: boolean
    toggle: () => void
    close: () => void
}
const SidebarContext = createContext<SidebarProps | null>(null);


export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(prev => !prev);
    const close = () => setOpen(false);

    const value: any = {
        open, toggle, close
    }

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebarContext = () => {
    const context = useContext(SidebarContext)
    if (!context) throw new Error("Sidebar Context not created")
    return context
}