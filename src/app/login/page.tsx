'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/home')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F5EFE4] flex items-center justify-center">
      <div className="bg-[#FBF7F0] border border-[#DCCFB4] rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-serif text-[#4A3C2E] mb-1">Chess Journal</h1>
        <p className="text-sm text-[#9A8A78] mb-6">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-3 py-2 rounded border border-[#DCCFB4] bg-white text-sm text-[#3A2E1E] outline-none focus:border-[#A08050]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-3 py-2 rounded border border-[#DCCFB4] bg-white text-sm text-[#3A2E1E] outline-none focus:border-[#A08050]"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#4A3C2E] text-[#F5EFE4] text-sm py-2 rounded hover:bg-[#3A2E1E] disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Log in'}
          </button>
        </div>

        <p className="text-xs text-[#9A8A78] mt-4 text-center">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#4A3C2E] cursor-pointer underline"
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  )
}