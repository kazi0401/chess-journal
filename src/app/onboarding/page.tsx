'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    // Verify the username exists on Chess.com
    const res = await fetch(`https://api.chess.com/pub/player/${username}`)
    if (!res.ok) {
      setError("Couldn't find that Chess.com username. Double check it?")
      setLoading(false)
      return
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Something went wrong. Please log in again.')
      setLoading(false)
      return
    }

    // Store the username in their profile
    const { error: dbError } = await supabase
      .from('profiles')
      .insert({ id: user.id, chess_com_username: username })

    if (dbError) {
      console.log('DB Error:', dbError)
      setError('Failed to save username. Try again.')
    } else {
      router.push('/home')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F5EFE4] flex items-center justify-center">
      <div className="bg-[#FBF7F0] border border-[#DCCFB4] rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-serif text-[#4A3C2E] mb-1">One last thing</h1>
        <p className="text-sm text-[#9A8A78] mb-6">
          Enter your Chess.com username to import your games.
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Chess.com username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-3 py-2 rounded border border-[#DCCFB4] bg-white text-sm text-[#3A2E1E] outline-none focus:border-[#A08050]"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#4A3C2E] text-[#F5EFE4] text-sm py-2 rounded hover:bg-[#3A2E1E] disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}