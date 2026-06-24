import dotenv from "dotenv"
import { prisma } from "../src/lib/prisma"
import { JwtAuth } from "../src/lib/auth"

async function main() {
    const email = "admin@example.com"
    const password = "123"

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
        console.log("Admin already exist")
        return { success: false, message: "Admin already exist" }
    }
    const passwordHash = await JwtAuth.hashPassword(password) as string
    const admin = await prisma.user.create({
        data: {
            name: "Admin",
            email,
            passwordHash,
            role: "ADMIN"
        }
    })
    console.log("Created Admin", admin.email)
    console.log("Login with", password)
}
main().catch((err) => { console.log(err); process.exit(1) }).finally(() => prisma.$disconnect())