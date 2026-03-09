// Cliente de autenticación mejorado con soporte local y OAuth
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

export interface AuthUser {
  id: string
  email: string
  displayName?: string
  avatar?: string
  provider?: 'local' | 'google' | 'github' | 'discord'
  createdAt: number
}

interface StoredSession {
  user: AuthUser
  token: string
  expiresAt: number
}

const SESSION_KEY = 'pokemon_tcg_session'
const AUTH_STRATEGY = process.env.NEXT_PUBLIC_AUTH_STRATEGY || 'local'

// Autenticación Local (localStorage)
class LocalAuthClient {
  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    try {
      // Validar email
      if (!email.includes('@')) throw new Error('Email inválido')
      if (password.length < 6) throw new Error('Contraseña debe tener al menos 6 caracteres')

      // Verificar que el usuario no exista
      const existing = this.getAllUsers().find(u => u.email === email)
      if (existing) throw new Error('Este email ya está registrado')

      const user: AuthUser = {
        id: crypto.randomUUID(),
        email,
        displayName: displayName || email.split('@')[0],
        provider: 'local',
        createdAt: Date.now(),
      }

      // Guardar usuario
      const hashedPassword = btoa(password) // Simple encoding (no usar en producción)
      localStorage.setItem(
        `auth_user_${email}`,
        JSON.stringify({ user, password: hashedPassword })
      )

      // Crear sesión
      const token = crypto.randomUUID()
      const session: StoredSession = {
        user,
        token,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 días
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      
      safeLog.info(`Usuario registrado: ${email}`, 'AUTH')
      return user
    } catch (error) {
      safeLog.error(`Error en signUp: ${error}`, 'AUTH')
      throw error
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userData = localStorage.getItem(`auth_user_${email}`)
      if (!userData) throw new Error('Email o contraseña incorrectos')

      const { user, password: hashedPassword } = JSON.parse(userData)
      const hashedInput = btoa(password)

      if (hashedPassword !== hashedInput) throw new Error('Email o contraseña incorrectos')

      // Crear sesión
      const token = crypto.randomUUID()
      const session: StoredSession = {
        user,
        token,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))

      safeLog.info(`Usuario inició sesión: ${email}`, 'AUTH')
      return user
    } catch (error) {
      safeLog.error(`Error en signIn: ${error}`, 'AUTH')
      throw error
    }
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY)
    safeLog.info('Usuario cerró sesión', 'AUTH')
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const session = localStorage.getItem(SESSION_KEY)
    if (!session) return null

    try {
      const parsed: StoredSession = JSON.parse(session)

      // Verificar si expiró
      if (parsed.expiresAt < Date.now()) {
        localStorage.removeItem(SESSION_KEY)
        return null
      }

      return parsed.user
    } catch {
      return null
    }
  }

  private getAllUsers(): AuthUser[] {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('auth_user_'))
    return keys.map(key => {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data).user : null
    }).filter(Boolean)
  }
}

// OAuth Client
class OAuthClient {
  private googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  private discordClientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  private githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  private redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || 'http://localhost:3000'

  async signInWithGoogle(): Promise<AuthUser> {
    if (!this.googleClientId) {
      throw new Error('Google OAuth no configurado. Usa autenticación local.')
    }

    const scope = 'openid profile email'
    const authParams = new URLSearchParams({
      client_id: this.googleClientId,
      redirect_uri: `${this.redirectUrl}/auth/callback?provider=google`,
      response_type: 'code',
      scope,
      access_type: 'offline',
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`
    window.location.href = authUrl

    throw new Error('Redirigiendo a Google...')
  }

  async signInWithGitHub(): Promise<AuthUser> {
    if (!this.githubClientId) {
      throw new Error('GitHub OAuth no configurado')
    }

    const authParams = new URLSearchParams({
      client_id: this.githubClientId,
      redirect_uri: `${this.redirectUrl}/auth/callback?provider=github`,
      scope: 'user:email',
    })

    const authUrl = `https://github.com/login/oauth/authorize?${authParams.toString()}`
    window.location.href = authUrl

    throw new Error('Redirigiendo a GitHub...')
  }

  async signInWithDiscord(): Promise<AuthUser> {
    if (!this.discordClientId) {
      throw new Error('Discord OAuth no configurado')
    }

    const authParams = new URLSearchParams({
      client_id: this.discordClientId,
      redirect_uri: `${this.redirectUrl}/auth/callback?provider=discord`,
      response_type: 'code',
      scope: 'identify email',
    })

    const authUrl = `https://discord.com/api/oauth2/authorize?${authParams.toString()}`
    window.location.href = authUrl

    throw new Error('Redirigiendo a Discord...')
  }
}

// Factory para elegir estrategia
export const authClient = AUTH_STRATEGY === 'local' ? new LocalAuthClient() : new LocalAuthClient()
export const oauthClient = new OAuthClient()

// Helper para procesar callback OAuth
export async function handleOAuthCallback(
  provider: string,
  code: string
): Promise<AuthUser> {
  try {
    // Aquí iría la llamada a tu backend para intercambiar el code por token
    // Para demo, creamos un usuario simulado
    safeLog.info(`OAuth callback recibido de ${provider}`, 'AUTH')

    const user: AuthUser = {
      id: crypto.randomUUID(),
      email: `user_${provider}@example.com`,
      displayName: `${provider} User`,
      provider: provider as any,
      createdAt: Date.now(),
    }

    const token = crypto.randomUUID()
    const session: StoredSession = {
      user,
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))

    return user
  } catch (error) {
    safeLog.error(`Error en OAuth callback: ${error}`, 'AUTH')
    throw error
  }
}
