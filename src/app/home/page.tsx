'use client'

import { useState } from 'react'

import { parsePgn } from '@/lib/chess-pgn'
import ChessBoard from '@/components/ChessBoard'

export default function HomePage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const pgn = `[Event "Live Chess"]
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
    [Link "https://www.chess.com/game/live/8586389713?username=ohmylands&move=0"]

    1. a3 e5 2. e4 Nf6 3. Ba6 bxa6 4. Nc3 Bb7 5. Nb5 axb5 6. b4 Nxe4 7. a4 Bxb4 8.
    Ba3 Bxd2+ 9. Ke2 Nc3+ 10. Kf1 Nxd1 11. c4 Nxf2 12. Ne2 Nxh1 13. Nd4 Qf6+ 14. Ke2
    Qf2+ 15. Kd3 Qxd4+ 16. Kc2 Be4+ 17. Kb3 Qc3+ 18. Ka2 Qxc4+ 19. Kb2 Qc2# 0-1
  `

  const moves = parsePgn(pgn)
  const lastMove = moves[moves.length - 1]

  async function handleSync() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/sync-games', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setStatus(`Error: ${data.error}`)
      } else {
        setStatus(`Synced ${data.synced} games`)
      }
    } catch {
      setStatus('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE4] flex flex-col items-center justify-center gap-4">
      <button
        onClick={handleSync}
        disabled={loading}
        className="text-sm px-4 py-2 rounded bg-[#4A3C2E] text-[#F5EFE4] disabled:opacity-50"
      >
        {loading ? 'Syncing...' : 'Sync games'}
      </button>
      {status && <p className="text-sm text-[#9A8A78]">{status}</p>}
    </div>
  )
}