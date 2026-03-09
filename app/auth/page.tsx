'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, signInWithGoogle, signInWithGitHub, signInWithDiscord } from '@/lib/auth'
import { logger } from '@/lib/logger'

// Función segura para logging
const safeLog = {
  info: (msg: string, category = 'AUTH') => {
    try {
      logger?.logInfo?.(msg, category as any)
    } catch (e) {
      console.log(`[${category}] ${msg}`)
    }
  },
  error: (msg: string, category = 'AUTH') => {
    try {
      logger?.logError?.(msg, category as any)
    } catch (e) {
      console.error(`[${category}] ${msg}`)
    }
  },
}

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password, displayName || email.split('@')[0])
      } else {
        await signIn(email, password)
      }
      safeLog.info(`${isSignUp ? 'Registro' : 'Login'} exitoso`, 'AUTH')
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      safeLog.error(message, 'AUTH')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github' | 'discord') => {
    setError('')
    setIsLoading(true)

    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle()
          break
        case 'github':
          await signInWithGitHub()
          break
        case 'discord':
          await signInWithDiscord()
          break
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error'
      // OAuth puede redirigir, esto es esperado
      if (!message.includes('Redirigiendo')) {
        setError(message)
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="section">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="title-md mb-2">🎴 Pokémon TCG Simulator</h1>
            <p className="text-secondary">{isSignUp ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--error)',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                border: '1px solid var(--error)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Nombre de Usuario
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--background-secondary)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  backgroundColor: 'var(--background-secondary)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  backgroundColor: 'var(--background-secondary)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isLoading ? '⏳ Cargando...' : isSignUp ? '✓ Registrarse' : '✓ Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
              opacity: 0.5,
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
            <span className="text-secondary" style={{ fontSize: '0.9rem' }}>O continúa con</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          </div>

          {/* OAuth Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <OAuthButton
              provider="google"
              icon="🔍"
              label="Google"
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
            />
            <OAuthButton
              provider="github"
              icon="🐙"
              label="GitHub"
              onClick={() => handleOAuth('github')}
              disabled={isLoading}
            />
            <OAuthButton
              provider="discord"
              icon="💬"
              label="Discord"
              onClick={() => handleOAuth('discord')}
              disabled={isLoading}
            />
          </div>

          {/* Toggle Sign Up / Sign In */}
          <p className="text-secondary" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: '600',
                fontSize: 'inherit',
              }}
            >
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>

          {/* Demo Info */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0' }}>💡 <strong>Prueba Demo:</strong></p>
            <p style={{ margin: '0 0 0.25rem 0' }}>Email: <code style={{ backgroundColor: 'var(--background)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>demo@test.com</code></p>
            <p style={{ margin: '0' }}>Contraseña: <code style={{ backgroundColor: 'var(--background)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>demo123456</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OAuthButtonProps {
  provider: string
  icon: string
  label: string
  onClick: () => void
  disabled: boolean
}

function OAuthButton({ provider, icon, label, onClick, disabled }: OAuthButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.75rem',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--background-secondary)',
        color: 'var(--text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = 'var(--background)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--background-secondary)')}
    >
      <span>{icon}</span>
      <span style={{ fontSize: '0.85rem' }}>{label}</span>
    </button>
  )
}
