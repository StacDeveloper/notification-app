export function timeAgo(iso: string) {
    const diffms = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diffms / 6000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}