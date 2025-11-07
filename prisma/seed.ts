import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // สร้าง User ตัวอย่าง
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: 'hashed_password_here', // ใช้ bcrypt hash ในโปรเจกต์จริง
      role: 'ADMIN',
    },
  })

  console.log('Created user:', user)

  // สร้าง Glossary ตัวอย่าง
  const glossary = await prisma.glossary.create({
    data: {
      termTh: 'เครื่องยนต์',
      termEn: 'Engine',
      longTh: 'ส่วนประกอบหลักของรถยนต์',
      longEn: 'Main component of vehicle',
    },
  })

  console.log('Created glossary:', glossary)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
