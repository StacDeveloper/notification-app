import express from "express"
import { requireAuth } from "../middlewares/auth.middleware"
import { Email } from "../controllers/email.controller"
import { emailLimiter } from "../middlewares/ratelimiter"

const emailRoutes = express.Router()

const email = new Email()

emailRoutes.post("/send-email", emailLimiter, requireAuth, email.sendClientEmail)
emailRoutes.get("/list-all-emails", requireAuth, email.listEmailLogs)
emailRoutes.get("/logs/updates", requireAuth, email.getEmailLogUpdates)

export default emailRoutes