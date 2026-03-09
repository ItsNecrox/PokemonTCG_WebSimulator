// Simulador de apertura de sobres
// Replica las probabilidades reales de los sobres de Pokémon TCG

import { PokemonCard, RARITY_TIERS } from '@/types/pokemon'
import CONFIG from './config'

const CARDS_PER_PACK = CONFIG.PACK.CARDS_PER_PACK

interface PackConfig {
    commons: number      // 6 comunes
    uncommons: number    // 3 poco comunes
    rareSlot: number     // 1 rara o mejor (garantizada)
}

const DEFAULT_PACK: PackConfig = {
    commons: 6,
    uncommons: 3,
    rareSlot: 1
}

// Probabilidades para el slot de rara
const RARE_SLOT_ODDS = {
    rare: 0.65,           // 65% - Rara normal
    rareHolo: 0.25,       // 25% - Rara holográfica
    ultraRare: 0.08,      // 8% - Ultra rara
    secretRare: 0.02      // 2% - Secreta
}

/**
 * Simula la apertura de un sobre
 */
export function simulatePack(allCards: PokemonCard[]): PokemonCard[] {
    const pack: PokemonCard[] = []
    const usedIds = new Set<string>()

    // Agrupar cartas por rareza
    const cardsByRarity = groupCardsByRarity(allCards)

    // Función para obtener carta aleatoria sin duplicados
    const getRandomCard = (pool: PokemonCard[]): PokemonCard | null => {
        const available = pool.filter(c => !usedIds.has(c.id))
        if (available.length === 0) return null

        const card = available[Math.floor(Math.random() * available.length)]
        usedIds.add(card.id)
        return card
    }

    // 1. Slot de rara garantizada
    const rareCard = getRareSlotCard(cardsByRarity, getRandomCard)
    if (rareCard) pack.push(rareCard)

    // 2. Poco comunes
    for (let i = 0; i < DEFAULT_PACK.uncommons; i++) {
        const card = getRandomCard(cardsByRarity.uncommon)
        if (card) pack.push(card)
    }

    // 3. Comunes (rellenar hasta 10)
    while (pack.length < CARDS_PER_PACK) {
        const card = getRandomCard(cardsByRarity.common)
        if (card) {
            pack.push(card)
        } else {
            // Si no hay más comunes, usar cualquier carta
            const anyCard = getRandomCard(allCards)
            if (anyCard) pack.push(anyCard)
            else break
        }
    }

    // Ordenar: comunes primero, raras al final (como en los sobres reales)
    return sortPackCards(pack)
}

function groupCardsByRarity(cards: PokemonCard[]) {
    return {
        common: cards.filter(c => RARITY_TIERS.common.includes((c.rarity || '') as any)),
        uncommon: cards.filter(c => RARITY_TIERS.uncommon.includes((c.rarity || '') as any)),
        rare: cards.filter(c => RARITY_TIERS.rare.includes((c.rarity || '') as any)),
        ultraRare: cards.filter(c => RARITY_TIERS.ultraRare.includes((c.rarity || '') as any)),
        secretRare: cards.filter(c => RARITY_TIERS.secretRare.includes((c.rarity || '') as any))
    }
}

function getRareSlotCard(
    cardsByRarity: ReturnType<typeof groupCardsByRarity>,
    getRandomCard: (pool: PokemonCard[]) => PokemonCard | null
): PokemonCard | null {
    const roll = Math.random()

    if (roll < RARE_SLOT_ODDS.secretRare && cardsByRarity.secretRare.length > 0) {
        return getRandomCard(cardsByRarity.secretRare)
    }

    if (roll < RARE_SLOT_ODDS.secretRare + RARE_SLOT_ODDS.ultraRare && cardsByRarity.ultraRare.length > 0) {
        return getRandomCard(cardsByRarity.ultraRare)
    }

    if (roll < RARE_SLOT_ODDS.secretRare + RARE_SLOT_ODDS.ultraRare + RARE_SLOT_ODDS.rareHolo) {
        const holoRares = cardsByRarity.rare.filter(c => c.rarity?.includes('Holo'))
        if (holoRares.length > 0) {
            return getRandomCard(holoRares)
        }
    }

    // Rara normal (fallback)
    return getRandomCard(cardsByRarity.rare) || getRandomCard(cardsByRarity.uncommon)
}

function sortPackCards(cards: PokemonCard[]): PokemonCard[] {
    const rarityOrder = [
        ...RARITY_TIERS.common,
        ...RARITY_TIERS.uncommon,
        ...RARITY_TIERS.rare,
        ...RARITY_TIERS.ultraRare,
        ...RARITY_TIERS.secretRare
    ]

    return cards.sort((a, b) => {
        const aIndex = rarityOrder.indexOf((a.rarity || 'Common') as any)
        const bIndex = rarityOrder.indexOf((b.rarity || 'Common') as any)
        return aIndex - bIndex
    })
}

/**
 * Determina si una carta es holográfica/especial
 */
export function isHoloCard(rarity: string | undefined): boolean {
    if (!rarity) return false
    const holoRarities = [
        ...RARITY_TIERS.rare.filter(r => r.includes('Holo')),
        ...RARITY_TIERS.ultraRare,
        ...RARITY_TIERS.secretRare
    ]
    return holoRarities.includes(rarity as any)
}

/**
 * Determina si es una carta ultra rara o mejor
 */
export function isUltraRare(rarity: string | undefined): boolean {
    if (!rarity) return false
    return [...RARITY_TIERS.ultraRare, ...RARITY_TIERS.secretRare].includes(rarity as any)
}

/**
 * Obtiene el color del borde según la rareza
 */
export function getRarityColor(rarity: string | undefined): string {
    if (!rarity) return '#888'

    if (RARITY_TIERS.secretRare.includes(rarity as any)) return '#ffd700' // Oro
    if (RARITY_TIERS.ultraRare.includes(rarity as any)) return '#ff6b6b' // Rojo
    if (RARITY_TIERS.rare.includes(rarity as any)) return '#4dabf7' // Azul
    if (RARITY_TIERS.uncommon.includes(rarity as any)) return '#69db7c' // Verde
    return '#adb5bd' // Gris para común
}
