import { Inngest } from "inngest"
import { Resend } from "resend"
import { prisma } from "./prisma"
import dotenv from "dotenv"
dotenv.config()

export const inngest = new Inngest({ id: "notification-app" })

const resend = new Resend(process.env.RESEND_API_KEY! as string)

export const sendReminderEmail = inngest.createFunction(
    { id: "send-reminder-email" },
    { event: "notification/reminder" },
    async ({ event }) => {
        const { notificationId } = event.data
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
            include: { assignedTo: true, client: true }
        })
        if (!notification || notification.reminderSent) return
        if (!notification.assignedTo?.email) return
        const result = await resend.emails.send({
            from: "Your App <onboarding@resend.dev>",
            to: "mulesoham7@gmail.com",
            subject: `Reminder: ${notification.type.replace(/_/g, " ")}`,
            html: `<div style="font-family:sans-serif;max-width:500px">
                    <h2>Notification Reminder</h2>
                    <p>${notification.message}</p>
                    ${notification.client
                    ? `<p>Client: <strong>${notification.client.name}</strong> · ${notification.client.email}</p>`
                    : ""}
                </div>`
        })
        console.log(result)
        await prisma.notification.update({
            where: { id: notificationId },
            data: { reminderSent: true }
        })
    }
)