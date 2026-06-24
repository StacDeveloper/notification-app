import express from "express"

import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import clientRoutes from "./routes/client.routes"
dotenv.config()

const app = express()
const port: number = Number(process.env.PORT) || 3000


app.use("/api/auth", authRoutes)
app.use("/api/client", clientRoutes)


app.use("/health", (req, res) => res.json({ success: true, message: "Server is healthly" }))

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})