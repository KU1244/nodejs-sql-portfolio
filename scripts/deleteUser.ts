import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const deleted = await prisma.user.delete({
        where: { email: "hanako@example.com" },
    });
    console.log("🗑️ Deleted user:", deleted);
}

main().finally(() => prisma.$disconnect());
