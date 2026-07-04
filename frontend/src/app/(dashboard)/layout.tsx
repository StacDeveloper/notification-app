"use client"
import DashBoardShell from "@/components/DashboardShell";
import { useSSE } from "@/hooks/useSSE";

export default function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useSSE()
    return <DashBoardShell>{children}</DashBoardShell>;
}
