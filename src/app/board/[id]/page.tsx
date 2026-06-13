'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ChessBoard from '@/components/ChessBoard'
import { parsePgn, getInitialFen, MoveState } from '@/lib/chess-pgn'
import type { Key } from 'chessground/types'

interface Game {
  pgn: string
  opponent: string
  result: string
  played_at: string
}

export default function BoardPage() {
  const { id } = useParams()
  const [game, setGame] = useState<Game | null>(null)
  const [moves, setMoves] = useState<MoveState[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGame() {
      const { data, error } = await supabase
        .from('games')
        .select('pgn, opponent, result, played_at')
        .eq('id', id)
        .single()

      if (!error && data) {
        setGame(data)
        setMoves(parsePgn(data.pgn))
      }
      setLoading(false)
    }

    loadGame()
  }, [id])

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

  if (loading) return (
    <div className="min-h-screen bg-[#F5EFE4] flex items-center justify-center">
      <p className="text-sm text-[#9A8A78]">Loading game...</p>
    </div>
  )

  if (!game) return (
    <div className="min-h-screen bg-[#F5EFE4] flex items-center justify-center">
      <p className="text-sm text-[#9A8A78]">Game not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5EFE4] p-6">
      <p className="text-xs text-[#9A8A78] mb-4">vs. {game.opponent} · {game.result}</p>
      <div className="flex gap-6 items-start">
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
      </div>
    </div>
  )
}