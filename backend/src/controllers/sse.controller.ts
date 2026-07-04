import { Request, Response } from "express"
import { sseManager } from "../lib/sse"

export async function sseHandler(req: Request, res: Response) {
    const userId = req.user!.userId
    if (!userId) {
        return res.status(404).json({ success: false, message: "User not found" })
    }
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Controle", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("X-Accel-Buffering", "no")
    res.flushHeaders()

    res.write(`event: ping\ndata: ${JSON.stringify({ connected: true })}\n\n`)

    sseManager.addClient(userId, res)


    req.on("close", () => {
        sseManager.removeClient(userId)
    })

}