const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 12)
  
  console.log('🔐 Creating admin user with password:', password)

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created/Updated admin user:', user)

  // สร้างหรืออัพเดท Glossary ตัวอย่าง
  const glossary = await prisma.glossary.upsert({
    where: { partNumber: 'ENG001' },
    update: {
      termTh: 'เครื่องยนต์',
      termEn: 'Engine',
      longTh: 'ส่วนประกอบหลักของรถยนต์',
      longEn: 'Main component of vehicle',
    },
    create: {
      termTh: 'เครื่องยนต์',
      termEn: 'Engine',
      longTh: 'ส่วนประกอบหลักของรถยนต์',
      longEn: 'Main component of vehicle',
      partNumber: 'ENG001',
    },
  })

  console.log('Created/Updated glossary:', glossary)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
