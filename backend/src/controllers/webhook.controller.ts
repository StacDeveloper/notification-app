import { Request, Response } from "express";
import { Webhook } from "svix"
import { prisma } from "../lib/prisma"
import dotenv from "dotenv"
dotenv.config()

export const handleResendWebHook = async (req: Request, res: Response) => {
    const secret = process.env.RESEND_API_KEY!
    if (!secret) {
        return res.status(400).json({ success: false, message: "No api keys provided" })
    }
    const svixId = req.headers["svid-id"] as string
    const svixTimestamp = req.headers["svix-timestamp"] as string
    const svixSignature = req.headers["svix-signature"] as string

    if (!svixId || !svixTimestamp || !svixSignature) {
        return res.status(400).json({ success: false, message: "Missing webhook signature headers" })
    }
    const webHook = new Webhook(secret)
    let event: any
    try {
        event = webHook.verify(req.body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        })
    } catch (error) {
        return res.status(401).json({ error: "Invalid webhook signature" });
    }
    const resendId: string | undefined = event.data.email_id
    if (!resendId) {
        return res.status(400).json({ error: "No email_id in webhook payload" });
    }
    const log = await prisma.emailLog.findFirst({
        where: { resendId }
    })
    if (!log) {
        return res.status(200).json({ success: false, ignored: true })
    }
    let status: "DELIVERED" | "BOUNCED" | undefined
    if (event.type === "email.delivered") status = "DELIVERED"
    if (event.type === "email.bounced") status = "BOUNCED"
    if (status) {
        await prisma.emailLog.update({
            where: { id: log.id },
            data: {
                status
            }
        })
        if (status === "BOUNCED") {
            await prisma.notification.create({
                data: {
                    type: "EMAIL_BOUNCED",
                    message: `Email "${log.subject}" bounced. `,
                    clientId: log.clientId
                }
            })
        }
    }
    return res.status(200).json({ success: true, received: true })
}