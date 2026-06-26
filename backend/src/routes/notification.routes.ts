import express from "express"
import { Notifications } from "../controllers/notification.controller"
import { requireAuth } from "../middlewares/auth.middleware"

const notificationRoutes = express.Router()

const notification = new Notifications

notificationRoutes.get("/get-all-notifications", requireAuth, notification.listNotification)
notificationRoutes.post("/create-notification", requireAuth, notification.createNotification)
notificationRoutes.patch("/:id/read", requireAuth, notification.markNotificationRead)
notificationRoutes.get("/get-updates", requireAuth, notification.getNotificationUpdates)


export default notificationRoutes