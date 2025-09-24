import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.create({
        data: { name: "Hanako", email: "hanako@example.com", ownerId: 1 }, // ← 追加
    });
    console.log("✅ Created:", user);
}
main().finally(() => prisma.$disconnect());
