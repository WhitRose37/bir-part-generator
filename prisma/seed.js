const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
require('dotenv').config({ path: '.env.production' })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ✅ อ่านจาก environment variables
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
  const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User'

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
  
  console.log('🔐 Creating admin user...')
  console.log('   Email:', ADMIN_EMAIL)
  console.log('   Password:', ADMIN_PASSWORD)

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: hashedPassword,
      name: ADMIN_NAME,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Admin user created/updated:', user.email)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
