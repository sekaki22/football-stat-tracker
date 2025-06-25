import { prisma } from './prisma'

export async function migratePlayerStatsToSeason() {
  console.log('Starting migration of player stats to 24/25 season...')
  
  try {
    // Get all players with their current goals and assists
    const players = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        goals: true,
        assists: true
      }
    })

    console.log(`Found ${players.length} players to migrate`)

    let migratedCount = 0
    let skippedCount = 0

    for (const player of players) {
      // Check if player already has stats for 24/25 season
      const existingStats = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM SeasonStats 
        WHERE playerId = ${player.id} AND season = '24/25'
      ` as any[]

      const hasExistingStats = existingStats[0]?.count > 0

      if (hasExistingStats) {
        console.log(`Skipping ${player.name} - already has 24/25 stats`)
        skippedCount++
        continue
      }

      // Only migrate if player has goals or assists
      if (player.goals > 0 || player.assists > 0) {
        await prisma.$executeRaw`
          INSERT INTO SeasonStats (playerId, season, goals, assists, createdAt, updatedAt)
          VALUES (${player.id}, '24/25', ${player.goals}, ${player.assists}, datetime('now'), datetime('now'))
        `
        
        console.log(`Migrated ${player.name}: ${player.goals} goals, ${player.assists} assists`)
        migratedCount++
      } else {
        console.log(`Skipping ${player.name} - no goals or assists to migrate`)
        skippedCount++
      }
    }

    console.log(`Migration completed!`)
    console.log(`- Migrated: ${migratedCount} players`)
    console.log(`- Skipped: ${skippedCount} players`)
    
    return { migratedCount, skippedCount }
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migratePlayerStatsToSeason()
    .then(() => {
      console.log('Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
} 