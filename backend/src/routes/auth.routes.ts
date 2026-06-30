import express from "express"
import { Auth } from "../controllers/auth.controller"
import { requireAuth } from "../middlewares/auth.middleware"

const authRoutes = express.Router()

const auth = new Auth()

authRoutes.post("/login", auth.login)
authRoutes.post("/logout", auth.logout)
authRoutes.get("/findMe", requireAuth, auth.findMe)
authRoutes.post("/register", requireAuth, auth.register)

export default authRoutes