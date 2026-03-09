'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { processOAuthCallback } from '@/lib/auth'
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

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Procesando...')
  const [error, setError] = useState('')

  useEffect(() => {
    const processCallback = async () => {
      try {
        const provider = searchParams.get('provider')
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          throw new Error(errorDescription || error)
        }

        if (!provider || !code) {
          throw new Error('Parámetros inválidos')
        }

        setStatus(`Iniciando sesión con ${provider}...`)
        logger.logInfo(`OAuth callback: ${provider}`, 'AUTH')

        await processOAuthCallback(provider, code)
        
        setStatus('✓ Redirigiendo...')
        setTimeout(() => router.push('/'), 1500)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        logger.logError(message, 'AUTH')
      }
    }

    processCallback()
  }, [router, searchParams])

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="section">
          {error ? (
            <>
              <h1 className="title-md mb-3">❌ Error en OAuth</h1>
              <p className="text-secondary mb-3">{error}</p>
              <button
                onClick={() => window.location.href = '/auth'}
                className="btn btn-primary"
                style={{ marginRight: '0.5rem' }}
              >
                Volver a intentar
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>
                ⏳
              </div>
              <h1 className="title-md mb-3">Autenticando</h1>
              <p className="text-secondary">{status}</p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div className="section">
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>
              ⏳
            </div>
            <h1 className="title-md mb-3">Cargando...</h1>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}
