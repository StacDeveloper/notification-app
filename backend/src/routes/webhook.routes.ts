import express from "express"
import { handleResendWebHook } from "../controllers/webhook.controller"

const webHookRoutes = express.Router()

webHookRoutes.post("/resend", handleResendWebHook)

export default webHookRoutes