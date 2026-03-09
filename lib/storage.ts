// Sistema de almacenamiento local para la colección
// Más adelante se migrará a Supabase cuando añadamos auth

import { CollectionCard, UserCollection, PokemonCard } from '@/types/pokemon'

const STORAGE_KEY = 'pokemon_tcg_collection'

/**
 * Obtiene la colección del usuario desde localStorage
 */
export function getCollection(): UserCollection {
    if (typeof window === 'undefined') {
        return { cards: [], packsOpened: 0, lastUpdated: new Date().toISOString() }
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
        return { cards: [], packsOpened: 0, lastUpdated: new Date().toISOString() }
    }

    try {
        return JSON.parse(stored)
    } catch {
        return { cards: [], packsOpened: 0, lastUpdated: new Date().toISOString() }
    }
}

/**
 * Guarda la colección en localStorage
 */
export function saveCollection(collection: UserCollection): void {
    if (typeof window === 'undefined') return

    collection.lastUpdated = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection))
}

/**
 * Añade cartas a la colección (después de abrir un sobre)
 */
export function addCardsToCollection(cards: PokemonCard[]): UserCollection {
    const collection = getCollection()

    cards.forEach(card => {
        const existing = collection.cards.find(c => c.cardId === card.id)

        if (existing) {
            existing.quantity += 1
        } else {
            // Guardar el set ID asegurándonos de que existe
            const setId = card.set?.id || 'unknown'
            
            collection.cards.push({
                cardId: card.id,
                quantity: 1,
                obtainedAt: new Date().toISOString(),
                fromSet: setId
            })
        }
    })

    collection.packsOpened += 1
    saveCollection(collection)

    return collection
}

/**
 * Obtiene estadísticas de la colección
 */
export function getCollectionStats(collection: UserCollection) {
    const totalCards = collection.cards.reduce((sum, c) => sum + c.quantity, 0)
    const uniqueCards = collection.cards.length
    const setsWithCards = new Set(collection.cards.map(c => c.fromSet)).size

    return {
        totalCards,
        uniqueCards,
        setsWithCards,
        packsOpened: collection.packsOpened
    }
}

/**
 * Obtiene el progreso de un set específico
 */
export function getSetProgress(collection: UserCollection, setId: string, totalInSet: number) {
    const cardsInSet = collection.cards.filter(c => c.fromSet === setId)
    const unique = cardsInSet.length
    const total = cardsInSet.reduce((sum, c) => sum + c.quantity, 0)

    return {
        unique,
        total,
        percentage: totalInSet > 0 ? Math.round((unique / totalInSet) * 100) : 0
    }
}

/**
 * Verifica si el usuario tiene una carta específica
 */
export function hasCard(collection: UserCollection, cardId: string): number {
    const card = collection.cards.find(c => c.cardId === cardId)
    return card?.quantity || 0
}

/**
 * Limpia toda la colección (con confirmación)
 */
export function clearCollection(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}
