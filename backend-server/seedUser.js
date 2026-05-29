import prisma from './src/lib/prisma.js';

async function main() {
    const user = await prisma.user.upsert({
        where: { email: "test@gmail.com" },
        update: {},
        create: {
            user_id: "test-user-1",
            email: "test@gmail.com",
            full_name: "Test User"
        }
    });

    console.log("User ready:", user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());