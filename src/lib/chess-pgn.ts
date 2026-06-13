import { Chess } from 'chess.js'

export interface MoveState {
  fen: string
  san: string
  moveNumber: number
  color: 'w' | 'b'
  from: string
  to: string
}

export function parsePgn(pgn: string): MoveState[] {
  const chess = new Chess()
  chess.loadPgn(pgn)

  const history = chess.history({ verbose: true })
  const moves: MoveState[] = []

  // Replay from the start to capture FEN at each step
  chess.reset()
  for (const move of history) {
    chess.move(move.san)
    moves.push({
      fen: chess.fen(),
      san: move.san,
      moveNumber: Math.ceil((moves.length + 1) / 2),
      color: move.color,
      from: move.from,
      to: move.to,
    })
  }

  return moves
}

export function getInitialFen(): string {
  return new Chess().fen()
}