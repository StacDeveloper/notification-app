import { Resend } from "resend"
import dotenv from "dotenv"
dotenv.config()
const resend = new Resend(process.env.RESEND_API_KEY!)

export interface SendEmailParams {
    to: string
    subject: string
    body: string
}
export interface SendEmailResult {
    resendId: string | null
    error: string | null
}

export async function sendEmail({ to, subject, body }: SendEmailParams) {
    try {
        const result = await resend.emails.send({
            from: "mulesoham7@gmail.com",
            to,
            subject,
            html: `<div>${body}</div>`
        })
        if (result.error) {
            return { resendId: null, error: result.error.message || "Failed to deliver the mail" }
        }
        return { resendId: result.data.id || null, error: null }
    } catch (error: any) {
        console.log(error)
        return { resendId: null, error: error.message || "Unknown Send Error" }
    }
}