import { Request, Response } from "express"
import { z } from "zod"
import { prisma } from "../../src/lib/prisma"
import { sendEmail } from "../lib/resend"

const sendEmailSchema = z.object({
    clientId: z.string().min(1),
    subject: z.string().min(1),
    body: z.string().min(1)
})

export class Email {
    async sendClientEmail(req: Request, res: Response) {
        const parsed = sendEmailSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: parsed.error.flatten() })
        }
        const { clientId, subject, body } = parsed.data
        const client = await prisma.client.findUnique({
            where: { id: clientId }
        })
        if (!client) {
            return res.status(400).json({ success: false, message: "Client not found" })
        }
        const log = await prisma.emailLog.create({
            data: {
                clientId,
                sentById: req.user!.userId,
                subject,
                body,
                status: "PENDING"
            }
        })
        const result = await sendEmail({ to: client.email, subject, body })
        const updated = await prisma.emailLog.update({
            where: { id: log.id },
            data: result.error ? { status: "FAILED", errorMessage: result.error } : { status: "SENT", resendId: result.resendId }
        })
        if (result.error) {
            await prisma.notification.create({
                data: {
                    type: "EMAIL_FAILED",
                    message: `Failed to send "${subject}" to ${client.name}: ${result.error}`,
                    clientId,
                    assignedToId: req.user!.userId
                }
            })
        }
        return res.status(200).json({ success: true, message: updated })
    }

    async listEmailLogs(req: Request, res: Response) {
        const logs = await prisma.emailLog.findMany({
            orderBy: { createdAt: "desc" },
            include: { client: true, sentBy: { select: { id: true, name: true } } }
        })
        return res.status(200).json({ success: true, data: logs })
    }

    async getEmailLogUpdates(req: Request, res: Response) {
        const since = req.query.since ? new Date(String(req.query.since)) : new Date(0)

        const logs = await prisma.emailLog.findMany({
            where: { updatedAt: { gt: since } },
            orderBy: { createdAt: "desc" },
            include: { client: true }
        })
        return res.status(200).json({ success: true, data: logs, serverTime: new Date().toDateString() })
    }
}