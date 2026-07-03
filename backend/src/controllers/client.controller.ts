import { Request, Response } from "express"
import { success, z } from "zod"
import { prisma } from "../lib/prisma"

const clientSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    company: z.string().optional()
})

export class Client {
    async listClients(req: Request, res: Response) {
        try {
            const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } })
            return res.status(200).json({ success: true, data: clients })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ success: false, message: error.message })
        }

    }

    async createClient(req: Request, res: Response) {
        const parsed = clientSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.flatten() })
        }
        try {
            const client = await prisma.client.create({
                data: parsed.data
            })
            return res.status(200).json({ success: true, data: client })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ success: false, message: error.message })
        }

    }

    async getParticularClient(req: Request, res: Response) {
        console.log("req.received")
        const { id } = req.params as { id: string }
        if (!id) {
            return res.status(404).json({ success: false, message: "Id not received" })
        }
        try {
            const partiCularclient = await prisma.client.findUnique({
                where: { id },
                include: { emailLogs: { orderBy: { createdAt: "desc" } } }
            })
            if (!partiCularclient) {
                return res.status(400).json({ success: false, message: `Client not found for ${id}` })
            }
            return res.status(200).json({ success: true, data: partiCularclient })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ success: false, message: error.message })
        }

    }
}