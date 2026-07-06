import express from "express"
import { serve } from "inngest/express"
import { inngest, sendReminderEmail } from "../lib/inngest"

const inngestRoutes = express.Router()

inngestRoutes.get("/notification", serve({ client: inngest, functions: [sendReminderEmail] }))


export default inngestRoutes