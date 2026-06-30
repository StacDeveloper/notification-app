import type { Request, Response } from "express"
import { email, z } from "zod"
import { prisma } from "../../src/lib/prisma"
import { JwtAuth } from "../../src/lib/auth"
import dotenv from "dotenv"

dotenv.config()

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
})

const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "STAFF"]).optional().default("STAFF")
})



export class Auth {
    async login(req: Request, res: Response) {
        const parsed = loginSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Invalid email or password format" })
        }
        const { email, password } = parsed.data
        console.log(email, password)
        const user = await prisma.user.findUnique({ where: { email } })
        console.log(user)
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" })
        }
        const valid = await JwtAuth.verifyPassword(password, user.passwordHash)
        if (!valid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }
        const token = await JwtAuth.signToken({ userId: user.id, role: user.role })
        console.log(token)
         res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({success:true, message:"Login Successful"})

    }
    async logout(req: Request, res: Response) {
        res.clearCookie("token")
        return res.status(200).json({ success: true })
    }

    async findMe(req: Request, res: Response) {
        console.log("req.received")
        const id = req.user?.userId
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: { id: true, name: true, email: true, role: true }
        })

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        return res.status(200).json({ success: true, data: user })
    }

    async register(req: Request, res: Response) {
        const parsed = registerSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: parsed.error.flatten() })
        }
        const { name, email, password, role } = parsed.data

        const existing = await prisma.user.findUnique({
            where: { email }
        })
        if (existing) {
            return res.status(400).json({ success: false, message: "Email Id already exist, please use login" })
        }
        const passwordHash = await JwtAuth.hashPassword(password) as string
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role
            }
        })
        return res.status(201).json({ success: true, data: user, message:"New user created" })
    }
}