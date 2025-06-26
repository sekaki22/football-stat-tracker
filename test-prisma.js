const { PrismaClient } = require('@prisma/client')

async function testPrisma() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing Prisma connection...')
    
    // Test basic connection
    const playerCount = await prisma.player.count()
    console.log(`Player count: ${playerCount}`)
    
    // Test findMany
    const players = await prisma.player.findMany({
      take: 5,
      orderBy: { goals: 'desc' }
    })
    console.log(`Found ${players.length} players:`, players.map(p => ({ id: p.id, name: p.name, goals: p.goals })))
    
  } catch (error) {
    console.error('Prisma error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPrisma() 