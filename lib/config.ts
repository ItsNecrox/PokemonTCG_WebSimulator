/**
 * Configuración centralizada de la aplicación
 */

export const CONFIG = {
  // API
  API: {
    POKEMON_TCG: {
      BASE_URL: 'https://api.pokemontcg.io/v2',
      TIMEOUT_MS: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || '10000'),
      RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
      RATE_LIMIT_PER_MINUTE: 100,
    }
  },

  // CACHE
  CACHE: {
    SETS_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 horas
    CARDS_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 horas
    COLLECTION_KEY: 'pokemon_tcg_collection',
    THEME_KEY: 'pokemon_tcg_theme'
  },

  // PACK SIMULATOR
  PACK: {
    CARDS_PER_PACK: 10,
    RARITY_DISTRIBUTION: {
      'Common': 0.65,
      'Uncommon': 0.2,
      'Rare': 0.08,
      'Holo Rare': 0.04,
      'Ultra Rare': 0.02,
      'Illustration Rare': 0.01
    },
    ANIMATION_DURATION_MS: 2200,
    CARD_REVEAL_DELAY_MS: 200
  },

  // UI
  UI: {
    TOAST_DURATION_MS: 3000,
    ANIMATION_DURATION_MS: 300,
    BREAKPOINTS: {
      mobile: 480,
      tablet: 768,
      desktop: 1024,
      wide: 1280
    },
    COLORS: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }
  },

  // FEATURES
  FEATURES: {
    TRADING_ENABLED: process.env.NEXT_PUBLIC_ENABLE_TRADING === 'true',
    RANKING_ENABLED: process.env.NEXT_PUBLIC_ENABLE_RANKING === 'true',
    MISSIONS_ENABLED: process.env.NEXT_PUBLIC_ENABLE_MISSIONS === 'true'
  },

  // PAGINATION
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    COLLECTION_PAGE_SIZE: 50,
    SETS_PAGE_SIZE: 10
  },

  // STORAGE
  STORAGE: {
    MAX_COLLECTION_SIZE: 10000, // máximo de cartas
    BACKUP_INTERVAL_MS: 5 * 60 * 1000 // cada 5 minutos
  }
}

/**
 * Valida que la configuración sea correcta
 */
export function validateConfig() {
  if (!process.env.NEXT_PUBLIC_POKEMON_API_KEY) {
    console.warn('⚠️ NEXT_PUBLIC_POKEMON_API_KEY no está configurada')
  }

  if (CONFIG.PACK.CARDS_PER_PACK < 1) {
    throw new Error('CARDS_PER_PACK debe ser al menos 1')
  }

  // Validar que las probabilidades de rareza sumen ~1
  const totalProb = Object.values(CONFIG.PACK.RARITY_DISTRIBUTION).reduce((a, b) => a + b, 0)
  if (Math.abs(totalProb - 1) > 0.01) {
    console.warn(`⚠️ Probabilidades de rareza no suman 1: ${totalProb}`)
  }
}

// Validar al importar
if (typeof window !== 'undefined') {
  validateConfig()
}

export default CONFIG
