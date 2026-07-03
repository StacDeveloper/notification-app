import express from "express"
import { requireAuth } from "../middlewares/auth.middleware"
import { Email } from "../controllers/email.controller"

const emailRoutes = express.Router()

const email = new Email()

emailRoutes.post("/send-email", requireAuth, email.sendClientEmail)
emailRoutes.get("/list-all-emails", requireAuth, email.listEmailLogs)
emailRoutes.get("/logs/updates", requireAuth, email.getEmailLogUpdates)

export default emailRoutes