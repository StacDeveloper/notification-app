import express from "express"

import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import clientRoutes from "./routes/client.routes"
import emailRoutes from "./routes/email.routes"
import notificationRoutes from "./routes/notification.routes"
import webHookRoutes from "./routes/webhook.routes"
import cookieParser from "cookie-parser"
import cors from "cors"
dotenv.config()

const app = express()
const port: number = Number(process.env.PORT) || 3000
app.use(cors({
    origin:process.env.ORIGIN!,
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes)
app.use("/api/client", clientRoutes)
app.use("/api/email", emailRoutes)
app.use("/api/notification", notificationRoutes)
app.use("/api/webhook", webHookRoutes)
app.use("/health", (req, res) => res.json({ success: true, message: "Server is healthly" }))

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})