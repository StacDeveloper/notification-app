import type { EmailStatus } from '../types/types'

const Styles: Record<string, { bg: string, fg: string, label: string }> = {
    PENDING: {
        bg: "var(--warning-bg)",
        fg: "var(--warning)",
        label: "Pending"
    },
    SENT: {
        bg: "var(--info-bg)",
        fg: "var(--info)",
        label: "Sent"
    },
    DELIVERED: {
        bg: "var(--success-bg)",
        fg: "var(--success)",
        label: "Delivered"
    },
    BOUNCED: {
        bg: "var(--danger-bg)",
        fg: "var(--danger)",
        label: "Bounced"
    },
    FAILED: {
        bg: "var(--danger-bg)",
        fg: "var(--danger)",
        label: "Failed"
    }
}
const StatusBadge = ({ status }: { status: EmailStatus }) => {

    const styles = Styles[status]
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: styles.bg, color: styles.fg }}
        >
            <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: styles.fg }}
                aria-hidden
            />
            {styles.label}
        </span>
    );
}

export default StatusBadge