import { Response } from "express"

interface SSEclient {
    userId: string
    res: Response
}

class SSEManager {
    private clients: SSEclient[] = []

    addClient(userId: string, res: Response) {
        this.clients.push({ userId, res })
    }
    removeClient(userId: string) {
        this.clients.filter((user) => user.userId !== userId)
    }
    sendToUser(userId: string, event: string, data: unknown) {
        const client = this.clients.find((cli) => cli.userId === userId)
        if (client) {
            client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        }
        return { success: false, message: `Client not found for ${userId}` }
    }

    broadCastToUser(event: string, data: unknown) {
        this.clients.forEach((cli) => cli.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
    }
}

export const sseManager = new SSEManager()

