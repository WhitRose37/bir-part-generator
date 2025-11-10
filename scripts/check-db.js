const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking database connection...')
  
  // Count users
  const userCount = await prisma.user.count()
  console.log(`📊 Total users: ${userCount}`)
  
  // List all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    }
  })
  
  console.log('\n👥 Users:')
  users.forEach(u => {
    console.log(`  - ${u.email} (${u.role}) [${u.status}]`)
  })
  
  // Check for admin
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })
  
  if (admin) {
    console.log('\n✅ Admin user exists!')
    console.log('   Email:', admin.email)
    console.log('   Role:', admin.role)
  } else {
    console.log('\n❌ Admin user not found')
  }
}

main()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
