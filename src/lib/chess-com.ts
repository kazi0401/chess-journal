export const CHESS_COM_API = 'https://api.chess.com/pub'

// --- Types ---

export interface ChessComGame {
  pgn: string
  end_time: number
  time_control: string
  white: { username: string; result: string }
  black: { username: string; result: string }
}

export interface ParsedGame {
  pgn: string
  opponent: string
  result: 'win' | 'loss' | 'draw'
  time_control: string
  played_at: string | null
}

// --- API helpers ---

export async function fetchGamesForMonth(
  username: string,
  year: number,
  month: string
): Promise<ChessComGame[]> {
  const res = await fetch(
    `${CHESS_COM_API}/player/${username}/games/${year}/${month}`,
    { headers: { 'User-Agent': 'chess-journal-app' } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.games ?? []
}

export async function fetchRecentGames(
  username: string,
  months = 3
): Promise<ChessComGame[]> {
  const periods = getRecentMonths(months)
  const results = await Promise.all(
    periods.map(({ year, month }) => fetchGamesForMonth(username, year, month))
  )
  return results.flat()
}

export async function verifyChessComUsername(username: string): Promise<boolean> {
  const res = await fetch(`${CHESS_COM_API}/player/${username}`, {
    headers: { 'User-Agent': 'chess-journal-app' },
  })
  return res.ok
}

// --- Parsers ---

export function parseGame(game: ChessComGame, username: string): ParsedGame {
  return {
    pgn: game.pgn,
    opponent: getOpponent(game, username),
    result: getResult(game, username),
    time_control: game.time_control,
    played_at: game.end_time
      ? new Date(game.end_time * 1000).toISOString()
      : null,
  }
}

// --- Helpers ---

function getRecentMonths(n: number): { year: number; month: string }[] {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return {
      year: d.getFullYear(),
      month: String(d.getMonth() + 1).padStart(2, '0'),
    }
  })
}

function getOpponent(game: ChessComGame, username: string): string {
  const me = username.toLowerCase()
  return game.white.username.toLowerCase() === me
    ? game.black.username
    : game.white.username
}

function getResult(game: ChessComGame, username: string): 'win' | 'loss' | 'draw' {
  const me = username.toLowerCase()
  const isWhite = game.white.username.toLowerCase() === me
  const myResult = isWhite ? game.white.result : game.black.result
  if (myResult === 'win') return 'win'
  if (['checkmated', 'resigned', 'timeout'].includes(myResult)) return 'loss'
  return 'draw'
}