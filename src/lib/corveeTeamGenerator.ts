const TEAM_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const

export type CorveeTeamPlayerIds = Record<string, number[]>

export function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function assignPlayersToCorveeTeamsRandomly(
  playerIds: number[]
): CorveeTeamPlayerIds {
  const teams: CorveeTeamPlayerIds = { A: [], B: [], C: [], D: [], E: [] }
  const shuffled = shuffleArray(playerIds)

  shuffled.forEach((playerId, index) => {
    const letter = TEAM_LETTERS[index % TEAM_LETTERS.length]
    teams[letter].push(playerId)
  })

  return teams
}
