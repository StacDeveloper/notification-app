import { prisma } from "./prisma"
import cron from "node-cron"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY! as string)

export function startSchedular() {
    cron.schedule("*****", async () => {
        try {
            const due = await prisma.notification.findMany({
                where: {
                    scheduledAt: { lt: new Date() },
                },
                include: {
                    assignedTo: true,
                    client: true
                }
            })
            if (due.length === 0) return
            for (const notification of due) {
                if (!notification.assignedTo?.email) continue
                await resend.emails.send({
                    from: "Your App <onboarding@resend.dev>",
                    to: notification.assignedTo.email,
                    subject: `Reminder: ${notification.type.replace(/_/g, " ")}`,
                    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto">
                            <h2 style="font-size:18px">Notification Reminder</h2>
                            <p style="color:#555">${notification.message}</p>
                            ${notification.client ? `<p style="color:#555">Client: <strong>${notification.client.name}</strong> · ${notification.client.email}</p>` : ""}
                            <p style="font-size:12px;color:#999">This is an automated reminder from Notify Admin.</p>
                        </div>`
                })
                await prisma.notification.update({
                    where: { id: notification.id },
                    data: { reminderSent: true }
                })
                console.log(`Reminder sent for notification ${notification.id} to ${notification.assignedTo.email}`)
            }
        } catch (error) {
            console.error("Scheduler error:", error)
        }
    })
    console.log("Scheduler started")
}