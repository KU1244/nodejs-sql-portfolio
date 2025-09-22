import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log("📋 All users:", users);
}

main().finally(() => prisma.$disconnect());
