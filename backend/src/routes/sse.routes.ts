import express from "express"
import { requireAuth } from "../middlewares/auth.middleware"
import { sseHandler } from "../controllers/sse.controller"

const sseRoutes = express.Router()

sseRoutes.get("/events", requireAuth, sseHandler)

export default sseRoutes
