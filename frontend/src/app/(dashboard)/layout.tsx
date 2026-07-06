"use client"
import DashBoardShell from "@/components/DashboardShell";


export default function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashBoardShell>{children}</DashBoardShell>;
}
