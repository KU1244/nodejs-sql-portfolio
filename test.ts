import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    await prisma.user.deleteMany();
    const newUser = await prisma.user.create({
        data: { name: "Taro", email: "taro@example.com", ownerId: 1 }, // ← 追加
    });
    console.log("✅ User recreated:", newUser);

    const allUsers = await prisma.user.findMany();
    console.log("📋 All users:", allUsers);
}
main().finally(() => prisma.$disconnect());
