import express from "express"
import { Auth } from "../controllers/auth.controller"
import { requireAuth } from "../middlewares/auth.middleware"
import { authLimiter } from "../middlewares/ratelimiter"

const authRoutes = express.Router()

const auth = new Auth()

authRoutes.post("/login", authLimiter, auth.login)
authRoutes.post("/logout", auth.logout)
authRoutes.get("/findMe", requireAuth, auth.findMe)
authRoutes.post("/register", authLimiter, requireAuth, auth.register)

export default authRoutes