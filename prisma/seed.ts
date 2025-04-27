import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const players = [
  {
    name: 'Messi',
    goals: 0,
    assists: 0,
    memes: [
      'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
      'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
    ],
  },
  {
    name: 'Ronaldo',
    goals: 0,
    assists: 0,
    memes: [
      'https://media.giphy.com/media/3o7TKRG9lHxX6XxX2M/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
    ],
  },
  {
    name: 'Neymar',
    goals: 0,
    assists: 0,
    memes: [
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
      'https://media.giphy.com/media/3o7TKUM3IgJBX2as9O/giphy.gif',
    ],
  },
]

async function main() {
  // Clear existing data
  await prisma.meme.deleteMany()
  await prisma.player.deleteMany()

  // Create players with their memes
  for (const playerData of players) {
    const { memes, ...player } = playerData
    const createdPlayer = await prisma.player.create({
      data: {
        ...player,
        memes: {
          create: memes.map(url => ({ url })),
        },
      },
    })
    console.log(`Created player: ${createdPlayer.name}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 