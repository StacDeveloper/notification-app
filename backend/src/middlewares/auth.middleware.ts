import { Request, Response, NextFunction } from "express"
import { JwtAuth } from "../lib/auth"

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.cookies
    if (!token) {
        return res.status(400).json({ success: false, message: "Not authenticated" })
    }
    try {
        req.user = await JwtAuth.verifyToken(token)
        next()
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired session" });
    }

}

