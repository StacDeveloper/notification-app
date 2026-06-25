import express from "express"
import { requireAuth } from "../middlewares/auth.middleware"
import { Client } from "../controllers/client.controller"

const clientRoutes = express.Router()
const client = new Client

clientRoutes.get("/getAllClients", requireAuth, client.listClients)
clientRoutes.post("/create-client", requireAuth, client.createClient)
clientRoutes.get("/client/:id", requireAuth, client.getParticularClient)



export default clientRoutes