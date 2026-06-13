import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { fetchRecentGames, parseGame } from '@/lib/chess-com'

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  )

  const user = await getAuthenticatedUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const username = await getChessComUsername(supabase, user.id)
  if (!username) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const games = await fetchRecentGames(username)
  if (games.length === 0) return NextResponse.json({ synced: 0 })

  const rows = games.map(g => ({ user_id: user.id, ...parseGame(g, username) }))

  const { error } = await supabase
    .from('games')
    .upsert(rows, { onConflict: 'user_id,pgn', ignoreDuplicates: true })

  if (error) {
    console.error('Insert error:', error)
    return NextResponse.json({ error: 'Failed to save games' }, { status: 500 })
  }

  return NextResponse.json({ synced: rows.length })
}

// --- Helpers ---


async function getAuthenticatedUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

async function getChessComUsername(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('chess_com_username')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data.chess_com_username as string
}