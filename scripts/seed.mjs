import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const email = "admin@example.com";
const passwordHash = "$2b$12$bgBy05atGPMd9etzf9Kv1OOOQQX9gulDWvv4wIAgIl/BHsi9Er/TS";

try {
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Admin" },
  });
  console.log("Seeded:", user.email);
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
