import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set")
}

export interface JwtPayload {
    userId: string
    role: "ADMIN" | "STAFF"
}

export class JwtAuth {
    static async hashPassword(plain: string): Promise<String> {
        return bcrypt.hash(plain, 10)
    }
    static async verifyPassword(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash)
    }
    static async signToken(payload: JwtPayload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
    }
    static async verifyToken(token: string): Promise<JwtPayload> {
        return jwt.verify(token, JWT_SECRET) as JwtPayload
    }
}