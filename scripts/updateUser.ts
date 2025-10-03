import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const updated = await prisma.user.update({
        where: { email: "hanako@example.com" },
        data: { name: "Hanako Yamada" },
    });
    console.log("✏️ Updated user:", updated);
}

main().finally(() => prisma.$disconnect());
