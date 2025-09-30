import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Seed fine information (reference data)
  const fineTypes = [
    {
      fine_type: 'Poepen in de kleedkamer',
      fine_amount: 10,
      fine_description: 'Af te kopen voor heel seizoen kost €50'
    },
    {
      fine_type: 'Roken en/of alcohol drinken op voetbalschoenen en/of Quick clubkleding',
      fine_amount: 2,
      fine_description: 'Als je zowel roken als alcohol drinkt krijg je een boete van €4'
    },
    {
      fine_type: 'Te laat afmelden voor training',
      fine_amount: 5,
      fine_description: 'Te laat afmelden voor training bij BOA'
    },
    {
      fine_type: 'Niet opkomen dagen tijdens een training',
      fine_amount: 10,
      fine_description: 'Niet opkomen dagen tijdens een training'
    },
    {
      fine_type: 'Te laat bij wedstrijd',
      fine_amount: 5,
      fine_description: 'Te laat bij wedstrijd'
    },
    {
      fine_type: 'Te laat bij training',
      fine_amount: 2,
      fine_description: 'Per 15 minuten tellend vanaf 20:00'
    },
    {
      fine_type: 'Niet op komen dagen tijdens een wedstrijd zonder af te melden',
      fine_amount: 20,
      fine_description: ''
    },
    {
      fine_type: 'Domme gele kaart',
      fine_amount: 5,
      fine_description: 'Bijvoorbeeld voor schelden naar scheids of natrappen'
    },
    {
      fine_type: 'Domme rode kaart',
      fine_amount: 10,
      fine_description: 'Bijvoorbeeld voor schelden naar scheids of natrappen'
    }
  ]

  // Create fine types
  for (const fineType of fineTypes) {
    await prisma.fineInformation.upsert({
      where: { fine_type: fineType.fine_type },
      update: {},
      create: fineType
    })
  }

  console.log('✅ Fine types seeded')

  // Seed some example players if none exist
  const playerCount = await prisma.player.count()
  
  if (playerCount === 0) {
    const examplePlayers = [
      { name: 'Jan de Vries', season: '25/26' },
      { name: 'Piet Janssen', season: '25/26' },
      { name: 'Klaas de Wit', season: '25/26' },
      { name: 'Henk van Dam', season: '25/26' },
    ]

    for (const player of examplePlayers) {
      await prisma.player.create({
        data: player
      })
    }

    console.log('✅ Example players seeded')
  } else {
    console.log('ℹ️  Players already exist, skipping player seed')
  }

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
