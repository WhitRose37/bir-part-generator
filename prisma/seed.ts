import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ✅ Hash password properly
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // ✅ Create admin user with correct schema
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created admin user:', user)

  // ✅ Create sample glossary entry
  const glossary = await prisma.glossary.upsert({
    where: { partNumber: 'SAMPLE-001' },
    update: {},
    create: {
      termTh: 'เครื่องยนต์',
      termEn: 'Engine',
      longTh: 'ส่วนประกอบหลักของรถยนต์',
      longEn: 'Main component of vehicle',
      partNumber: 'SAMPLE-001',
      commonNameEn: 'Engine',
      commonNameTh: 'เครื่องยนต์',
    },
  })

  console.log('✅ Created sample glossary:', glossary)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
