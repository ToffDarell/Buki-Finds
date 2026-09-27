'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { nextPath, rememberNext } from '@/lib/afterLogin'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push(nextPath())
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else if (data.session) router.push(nextPath())
      else setMessage('Check your email to confirm your account, then log in.')
    }

    setSubmitting(false)
  }

  async function handleGoogleLogin() {
    setError('')
    setMessage('')
    setGoogleLoading(true)
    rememberNext()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleFacebookLogin() {
    setError('')
    setMessage('')
    setFacebookLoading(true)
    rememberNext()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      setFacebookLoading(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-surface px-4 py-8 sm:py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
        {/* Card Header with Centered 1.png Logo */}
        <div className="bg-white p-6 pb-2 text-center sm:p-8 sm:pb-3">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <Image
              src="/1.png"
              alt="BUKI"
              width={140}
              height={140}
              priority
              className="h-28 w-28 object-contain sm:h-32 sm:w-32 transition-transform hover:scale-105"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Student marketplace across Bukidnon campuses
          </p>

          {/* Segmented Switcher (Log in / Sign up) */}
          <div className="mt-5 grid grid-cols-2 rounded-xl border border-line bg-surface p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
                setMessage('')
              }}
              className={`rounded-lg py-2 text-xs font-bold transition-all sm:text-sm ${
                mode === 'login' ? 'bg-primary text-white shadow-xs' : 'text-muted hover:text-ink'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError('')
                setMessage('')
              }}
              className={`rounded-lg py-2 text-xs font-bold transition-all sm:text-sm ${
                mode === 'signup' ? 'bg-primary text-white shadow-xs' : 'text-muted hover:text-ink'
              }`}
            >
              Sign up
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink sm:text-sm">
              Email Address
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="student@school.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink transition-all placeholder:text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink sm:text-sm">
              Password
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink transition-all placeholder:text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 sm:text-sm">
                {error}
              </p>
            )}

            {message && (
              <p role="status" className="rounded-xl border border-primary/20 bg-primary-soft p-3 text-xs font-medium text-primary sm:text-sm">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-xs transition-all hover:bg-primary-hover hover:shadow-md disabled:opacity-60"
            >
              {submitting ? 'Please wait…' : mode === 'login' ? 'Log in to BUKI' : 'Create Student Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            Or continue with
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-ink shadow-xs transition-colors hover:border-muted/60 hover:bg-surface disabled:opacity-60"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={facebookLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white py-2.5 text-sm font-semibold text-ink shadow-xs transition-colors hover:border-muted/60 hover:bg-surface disabled:opacity-60"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
              </svg>
              {facebookLoading ? 'Redirecting to Facebook...' : 'Continue with Facebook'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted sm:text-sm">
            {mode === 'login' ? "Don't have an account yet? " : 'Already registered? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
                setMessage('')
              }}
              className="font-bold text-primary hover:underline"
            >
              {mode === 'login' ? 'Sign up here' : 'Log in here'}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
