// Cliente para la API de Pokémon TCG
// Documentación: https://pokemontcg.io/

import { PokemonCard, CardSet, Generation } from '@/types/pokemon'
import { logError, logInfo } from './logger'

const API_BASE = 'https://api.pokemontcg.io/v2'
const API_KEY = process.env.NEXT_PUBLIC_POKEMON_API_KEY || ''
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || '10000')
const MAX_RETRIES = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3')

if (!API_KEY) {
    console.warn('⚠️ NEXT_PUBLIC_POKEMON_API_KEY no está configurada en .env.local')
}

const headers = {
    'X-Api-Key': API_KEY,
}

// Cache para evitar llamadas repetidas
const setsCache: CardSet[] = []
const cardsCache: Map<string, { data: PokemonCard[], timestamp: number }> = new Map()
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 horas en ms

// Rate limiting
let requestCount = 0
let resetTime = Date.now()
const MAX_REQUESTS_PER_MINUTE = 100

/**
 * Implementa retry logic con backoff exponencial
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    attempt = 1
): Promise<Response> {
    try {
        // Rate limiting
        if (Date.now() - resetTime > 60000) {
            requestCount = 0
            resetTime = Date.now()
        }

        if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
            const waitTime = resetTime + 60000 - Date.now()
            logError(`Rate limit exceeded. Waiting ${waitTime}ms`, 'API')
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }

        requestCount++

        // Timeout con AbortController
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: { ...options.headers, ...headers }
        })

        clearTimeout(timeoutId)

        // Reintentar si es error 5xx o timeout
        if (!response.ok && (response.status >= 500 || response.status === 408)) {
            if (attempt < MAX_RETRIES) {
                const backoffMs = Math.pow(2, attempt) * 1000 // Backoff exponencial
                logInfo(`Reintentando en ${backoffMs}ms (intento ${attempt}/${MAX_RETRIES})`, 'API')
                await new Promise(resolve => setTimeout(resolve, backoffMs))
                return fetchWithRetry(url, options, attempt + 1)
            }
        }

        return response
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            logError(`Timeout (${API_TIMEOUT}ms) en ${url}`, 'API')
            if (attempt < MAX_RETRIES) {
                const backoffMs = Math.pow(2, attempt) * 1000
                await new Promise(resolve => setTimeout(resolve, backoffMs))
                return fetchWithRetry(url, options, attempt + 1)
            }
        }
        throw error
    }
}

/**
 * Obtiene todos los sets desde el archivo estático
 */
export async function getAllSets(): Promise<CardSet[]> {
    if (setsCache.length > 0) {
        logInfo(`Usando cache de sets (${setsCache.length} sets)`, 'API')
        return setsCache
    }

    try {
        logInfo('Cargando sets desde archivo estático...', 'API')
        
        // Leer desde archivo estático en public/data/sets.json
        const response = await fetch('/data/sets.json')
        
        if (!response.ok) {
            throw new Error(`Error cargando sets estáticos: ${response.status}`)
        }

        const data = await response.json()
        const sets = data.data || []
        
        // Limpiar cache antes de llenar para evitar duplicados
        setsCache.length = 0
        setsCache.push(...sets)
        logInfo(`✅ Cargados ${setsCache.length} sets desde archivo estático`, 'API')
        return setsCache
    } catch (error) {
        logError(`Error al cargar sets estáticos: ${error}`, 'API')
        throw new Error('No se pudieron cargar los sets.')
    }
}

export async function getCardsBySet(setId: string): Promise<PokemonCard[]> {
    const cached = cardsCache.get(setId)
    
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        logInfo(`Usando cache de ${cached.data.length} cartas para set ${setId}`, 'API')
        return cached.data
    }

    try {
        // Intentar cargar desde archivo estático primero
        logInfo(`Intentando cargar cartas de ${setId} desde archivo estático...`, 'API')
        const staticResponse = await fetch(`/data/cards/${setId}.json`)
        
        if (staticResponse.ok) {
            const data = await staticResponse.json()
            const rawCards = data.data || []
            const setData = data.set || null

            // Inyectar información del set si no existe en la carta
            const cards = rawCards.map((card: any) => ({
                ...card,
                set: card.set || setData
            }))
            
            cardsCache.set(setId, { data: cards, timestamp: Date.now() })
            logInfo(`✅ Cargadas ${cards.length} cartas para ${setId} desde archivo estático`, 'API')
            return cards
        }
        
        // Si no hay archivo estático, intentar API (con timeout)
        logInfo(`Archivo estático no encontrado, intentando API para ${setId}...`, 'API')
        const response = await fetchWithRetry(
            `${API_BASE}/cards?q=set.id:${setId}&pageSize=250`
        )

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const cards = data.data || []
        
        cardsCache.set(setId, { data: cards, timestamp: Date.now() })
        logInfo(`Cargadas ${cards.length} cartas para set ${setId}`, 'API')
        return cards
    } catch (error) {
        logError(`Error al obtener cartas del set ${setId}: ${error}`, 'API')
        // Retornar cache viejo si existe
        if (cached) {
            logInfo(`Usando cache expirado de ${cached.data.length} cartas para ${setId}`, 'API')
            return cached.data
        }
        throw new Error(`No se pudieron cargar las cartas del set. Intenta más tarde.`)
    }
}

/**
 * Busca cartas por nombre
 */
export async function searchCards(query: string): Promise<PokemonCard[]> {
    try {
        logInfo(`Buscando cartas: "${query}"`, 'API')
        const response = await fetchWithRetry(
            `${API_BASE}/cards?q=name:"${query}*"&pageSize=50`
        )
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const results = data.data || []
        logInfo(`Encontradas ${results.length} cartas para "${query}"`, 'API')
        return results
    } catch (error) {
        logError(`Error al buscar cartas "${query}": ${error}`, 'API')
        return []
    }
}

/**
 * Organiza los sets por generación/serie
 */
export function organizeSetsByGeneration(sets: CardSet[]): Generation[] {
    const seriesMap = new Map<string, CardSet[]>()

    sets.forEach(set => {
        const series = set.series || 'Other'
        if (!seriesMap.has(series)) {
            seriesMap.set(series, [])
        }
        seriesMap.get(series)!.push(set)
    })

    // Ordenar cada serie por fecha
    const generations: Generation[] = []

    // Orden preferido de series
    const seriesOrder = [
        'Scarlet & Violet',
        'Sword & Shield',
        'Sun & Moon',
        'XY',
        'Black & White',
        'HeartGold & SoulSilver',
        'Platinum',
        'Diamond & Pearl',
        'EX',
        'e-Card',
        'Neo',
        'Gym',
        'Base',
        'Other'
    ]

    seriesOrder.forEach(seriesName => {
        if (seriesMap.has(seriesName)) {
            const setsInSeries = seriesMap.get(seriesName)!
            setsInSeries.sort((a, b) =>
                new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
            )

            const years = getYearsRange(setsInSeries)
            generations.push({
                name: seriesName,
                years,
                sets: setsInSeries
            })
        }
    })

    // Añadir series no listadas
    seriesMap.forEach((sets, seriesName) => {
        if (!seriesOrder.includes(seriesName)) {
            const years = getYearsRange(sets)
            generations.push({
                name: seriesName,
                years,
                sets: sets.sort((a, b) =>
                    new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
                )
            })
        }
    })

    return generations
}

function getYearsRange(sets: CardSet[]): string {
    if (sets.length === 0) return ''

    const years = sets
        .map(s => new Date(s.releaseDate).getFullYear())
        .filter(y => !isNaN(y))

    if (years.length === 0) return ''

    const min = Math.min(...years)
    const max = Math.max(...years)

    return min === max ? `${min}` : `${min} - ${max}`
}

/**
 * Obtiene un set por su ID
 */
export async function getSetById(setId: string): Promise<CardSet | null> {
    const sets = await getAllSets()
    return sets.find(s => s.id === setId) || null
}
