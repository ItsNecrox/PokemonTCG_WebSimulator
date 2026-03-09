import { authClient, oauthClient, AuthUser, handleOAuthCallback } from './authClient'
import { logger } from './logger'

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

const SESSION_KEY = 'pokemon_tcg_session'
const AUTH_LISTENERS = new Set<(authenticated: boolean, user: AuthUser | null) => void>()

// Exportar directamente los métodos del cliente
export async function signUp(email: string, password: string, displayName?: string) {
  try {
    const user = await authClient.signUp(email, password, displayName)
    notifyAuthChange(true, user)
    return user
  } catch (error) {
    safeLog.error(`Error en signUp: ${error}`, 'AUTH')
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const user = await authClient.signIn(email, password)
    notifyAuthChange(true, user)
    return user
  } catch (error) {
    safeLog.error(`Error en signIn: ${error}`, 'AUTH')
    throw error
  }
}

export async function signOut() {
  try {
    await authClient.signOut()
    notifyAuthChange(false, null)
  } catch (error) {
    safeLog.error(`Error en signOut: ${error}`, 'AUTH')
    throw error
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return authClient.getCurrentUser()
}

// OAuth
export async function signInWithGoogle() {
  return oauthClient.signInWithGoogle()
}

export async function signInWithGitHub() {
  return oauthClient.signInWithGitHub()
}

export async function signInWithDiscord() {
  return oauthClient.signInWithDiscord()
}

// Procesar callbacks OAuth
export async function processOAuthCallback(provider: string, code: string) {
  const user = await handleOAuthCallback(provider, code)
  notifyAuthChange(true, user)
  return user
}

// Listener para cambios de autenticación
export function onAuthStateChange(callback: (isAuthenticated: boolean, user: any) => void) {
  AUTH_LISTENERS.add(callback)

  // Ejecutar inmediatamente con estado actual
  getCurrentUser().then(user => {
    callback(!!user, user)
  })

  // Retornar función para desuscribirse
  return () => {
    AUTH_LISTENERS.delete(callback)
  }
}

// Notificar cambios
function notifyAuthChange(isAuthenticated: boolean, user: AuthUser | null) {
  AUTH_LISTENERS.forEach(listener => {
    listener(isAuthenticated, user)
  })

  // Disparar evento personalizado para sincronizar entre pestañas
  window.dispatchEvent(
    new CustomEvent('authStateChange', {
      detail: { isAuthenticated, user },
    })
  )
}

// Sincronizar entre pestañas
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === SESSION_KEY) {
      getCurrentUser().then(user => {
        notifyAuthChange(!!user, user)
      })
    }
  })
}
