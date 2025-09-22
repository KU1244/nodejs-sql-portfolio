import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // 既存ユーザー全部削除
    await prisma.user.deleteMany();

    // 新しいユーザーを追加
    const newUser = await prisma.user.create({
        data: { name: "Taro", email: "taro@example.com" },
    });
    console.log("✅ User recreated:", newUser);

    const allUsers = await prisma.user.findMany();
    console.log("📋 All users:", allUsers);
}

main().finally(() => prisma.$disconnect());
