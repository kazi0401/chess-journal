'use client'

import { supabase } from '@/lib/supabase'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'


interface Game {
  id: string
  opponent: string
  result: 'win' | 'loss' | 'draw'
  time_control: string
  played_at: string
}

export default function HomePage() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadGames() {
      setLoading(true)
      const { data, error } = await supabase
        .from('games')
        .select('id, opponent, result, time_control, played_at')
        .order('played_at', { ascending: false })
        .limit(20)

      if (!error && data) setGames(data)
      setLoading(false)
    }

    loadGames()
  }, [])
  
  async function fetchGames() {
    setLoading(true)
    const { data, error } = await supabase
    .from('games')
    .select('id, opponent, result, time_control, played_at')
    .order('played_at', { ascending: false })
    
    if (!error && data) setGames(data)
      setLoading(false)
  }


  async function handleSync() {
    setSyncing(true)
    setSyncStatus(null)
    try {
      const res = await fetch('/api/sync-games', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSyncStatus(`Error: ${data.error}`)
      } else {
        setSyncStatus(`Synced ${data.synced} games`)
        await fetchGames()
      }
    } catch {
      setSyncStatus('Something went wrong')
    } finally {
      setSyncing(false)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  function resultLabel(result: Game['result']) {
    if (result === 'win') return { label: 'Win', classes: 'bg-[#DFF0E8] text-[#2A6448] border-[#8ACAAA]' }
    if (result === 'loss') return { label: 'Loss', classes: 'bg-[#FAE8E7] text-[#8B2A20] border-[#E8A098]' }
    return { label: 'Draw', classes: 'bg-[#EEE8DC] text-[#7A5C3A] border-[#D4C4A0]' }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE4]">
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-serif text-[#4A3C2E]">Chess Journal</h1>
        <div className="flex items-center gap-3">
          {syncStatus && <span className="text-xs text-[#9A8A78]">{syncStatus}</span>}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-xs px-3 py-1.5 rounded bg-[#4A3C2E] text-[#F5EFE4] disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync games'}
          </button>
        </div>
      </div>
    </div>

      {loading ? (
        <p className="text-sm text-[#9A8A78]">Loading games...</p>
      ) : games.length === 0 ? (
        <p className="text-sm text-[#9A8A78]">No games yet — hit sync to import your games.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {games.map(game => {
            const { label, classes } = resultLabel(game.result)
            return (
              <div
                key={game.id}
                onClick={() => router.push(`/board/${game.id}`)}
                className="bg-[#FBF7F0] border border-[#DCCFB4] rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#F5EFE4] transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-[#3A2E1E]">vs. {game.opponent}</span>
                  <span className="text-xs text-[#9A8A78]">{formatDate(game.played_at)} · {game.time_control}s</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${classes}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}