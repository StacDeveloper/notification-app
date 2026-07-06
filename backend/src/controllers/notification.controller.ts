import type { Request, Response } from "express"
import { z } from "zod"
import { prisma } from "../lib/prisma"

import { inngest } from "../lib/inngest"

const createNotificationSchema = z.object({
    type: z.enum(["MISSING_DOCUMENTS", "EMAIL_FAILED", "EMAIL_BOUNCED", "GENERAL"]),
    message: z.string().min(1),
    clientId: z.string().optional(),
    assignedToId: z.string().optional(),
    scheduledAt: z.date()
})

export class Notifications {
    async createNotification(req: Request, res: Response) {
        const parsed = createNotificationSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: parsed.error.flatten() || "Invalid Data" })
        }
        const data = parsed.data as any
        const notification = await prisma.notification.create({ data: data })
        await inngest.send({
            name: "notification/reminder",
            data: { notificationId: notification.id },
            ts: new Date(parsed.data.scheduledAt).getTime()
        })
        return res.status(200).json({ success: true, data: notification })
    }

    async listNotification(req: Request, res: Response) {
        const notification = await prisma.notification.findMany({
            where: { OR: [{ assignedToId: req.user!.userId }, { assignedToId: null }] },
            orderBy: { createdAt: "desc" },
            include: { client: true },
            take: 100
        })
        return res.status(200).json({ success: true, data: notification })
    }

    async markNotificationRead(req: Request, res: Response) {
        const id = req.params.id as string
        const notification = await prisma.notification.update({
            where: { id: id },
            data: { isRead: true }
        })
        return res.status(200).json({ success: true, data: notification })
    }
    async getNotificationUpdates(req: Request, res: Response) {
        const since = req.query.since ? new Date(String(req.query.since)) : new Date(0)

        const notification = await prisma.notification.findMany({
            where: {
                createdAt: { gt: since },
                OR: [{ assignedToId: req.user!.userId }, { assignedToId: null }],
            },
            orderBy: { createdAt: "asc" },
            include: { client: true }
        })
        return res.status(200).json({ success: true, data: notification })
    }

}