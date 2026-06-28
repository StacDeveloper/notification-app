import { useEffect, useRef } from "react";

export async function usePolling(callback: () => void, intervalMs = 4000) {
    const callbackRef = useRef(callback)
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        let cancelled = false
        const tick = async () => {
            if (cancelled || document.hidden) return
            await callbackRef.current()
        }
        tick()
        const id = setInterval(tick, intervalMs)

        return () => {
            cancelled = true
            clearInterval(id)
        }
    }, [intervalMs])
}