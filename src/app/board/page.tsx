'use client'

import { useState } from 'react'

import type { Key } from 'chessground/types'
import ChessBoard from '@/components/ChessBoard'
import { parsePgn, getInitialFen } from '@/lib/chess-pgn'

const TEST_PGN = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2021.03.04"]
[Round "?"]
[White "zaidanferizqo"]
[Black "OhMyLands"]
[Result "0-1"]
[TimeControl "600"]
[WhiteElo "231"]
[BlackElo "465"]
[Termination "OhMyLands won by checkmate"]
[ECO "C20"]
[EndTime "8:54:46 GMT+0000"]
[Link "https://www.chess.com/game/live/8586389713"]
1. a3 e5 2. e4 Nf6 3. Ba6 bxa6 4. Nc3 Bb7 5. Nb5 axb5 6. b4 Nxe4 7. a4 Bxb4 8.
Ba3 Bxd2+ 9. Ke2 Nc3+ 10. Kf1 Nxd1 11. c4 Nxf2 12. Ne2 Nxh1 13. Nd4 Qf6+ 14. Ke2
Qf2+ 15. Kd3 Qxd4+ 16. Kc2 Be4+ 17. Kb3 Qc3+ 18. Ka2 Qxc4+ 19. Kb2 Qc2# 0-1`

const moves = parsePgn(TEST_PGN)

export default function BoardPage() {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const currentMove = currentIndex >= 0 ? moves[currentIndex] : null

  const boardConfig = {
    fen: currentMove?.fen ?? getInitialFen(),
    lastMove: currentMove
      ? [currentMove.from, currentMove.to] as Key[]
      : undefined,
  }

  function goBack() {
    setCurrentIndex(i => Math.max(-1, i - 1))
  }

  function goForward() {
    setCurrentIndex(i => Math.min(moves.length - 1, i + 1))
  }

  function goToMove(index: number) {
    setCurrentIndex(index)
  }

  return (
    <div className="min-h-screen bg-[#F5EFE4] p-6">
      <div className="flex gap-6 items-start">

        {/* Board column */}
        <div className="flex flex-col gap-2">
          <ChessBoard config={boardConfig} />
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={goBack}
              disabled={currentIndex === -1}
              className="px-4 py-1.5 text-sm rounded bg-[#4A3C2E] text-[#F5EFE4] disabled:opacity-30"
            >
              ‹ Back
            </button>
            <button
              onClick={goForward}
              disabled={currentIndex === moves.length - 1}
              className="px-4 py-1.5 text-sm rounded bg-[#4A3C2E] text-[#F5EFE4] disabled:opacity-30"
            >
              Forward ›
            </button>
          </div>
        </div>

        {/* Filmstrip */}
        <div className="flex flex-wrap gap-1.5 max-w-xs mt-1">
          {moves.map((move, i) => (
            <button
              key={i}
              onClick={() => goToMove(i)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                i === currentIndex
                  ? 'bg-[#FBF7F0] border-[#D4C4A0] text-[#3A2E1E]'
                  : 'bg-transparent border-transparent text-[#9A8A78] hover:text-[#4A3C2E]'
              }`}
            >
              {move.color === 'w' ? `${move.moveNumber}.` : ''} {move.san}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}