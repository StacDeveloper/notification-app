import express from "express"
import { Auth } from "../controllers/auth.controller"

const authRoutes = express.Router()

const auth = new Auth()

authRoutes.post("/login", auth.login)
authRoutes.post("/logout", auth.logout)
authRoutes.get("/findMe", auth.findMe)


export default authRoutes