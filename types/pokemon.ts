// Tipos para la API de Pokémon TCG

export interface PokemonCard {
    id: string
    name: string
    supertype: string // Pokémon, Trainer, Energy
    subtypes?: string[]
    hp?: string
    types?: string[] // Fire, Water, etc.
    evolvesFrom?: string
    evolvesTo?: string[]
    rules?: string[]
    attacks?: Attack[]
    weaknesses?: TypeValue[]
    resistances?: TypeValue[]
    retreatCost?: string[]
    convertedRetreatCost?: number
    set: CardSet
    number: string
    artist?: string
    rarity?: string
    flavorText?: string
    nationalPokedexNumbers?: number[]
    legalities?: Legalities
    images: CardImages
    tcgplayer?: TCGPlayer
}

export interface Attack {
    name: string
    cost: string[]
    convertedEnergyCost: number
    damage: string
    text?: string
}

export interface TypeValue {
    type: string
    value: string
}

export interface CardSet {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    legalities?: Legalities
    ptcgoCode?: string
    releaseDate: string
    updatedAt: string
    images: SetImages
}

export interface Legalities {
    unlimited?: string
    standard?: string
    expanded?: string
}

export interface CardImages {
    small: string
    large: string
}

export interface SetImages {
    symbol: string
    logo: string
}

export interface TCGPlayer {
    url: string
    updatedAt: string
    prices?: {
        normal?: Price
        holofoil?: Price
        reverseHolofoil?: Price
        '1stEditionHolofoil'?: Price
    }
}

export interface Price {
    low?: number
    mid?: number
    high?: number
    directLow?: number
    market?: number
}

// Tipos para la colección del usuario
export interface CollectionCard {
    cardId: string
    quantity: number
    obtainedAt: string
    fromSet: string
}

export interface UserCollection {
    cards: CollectionCard[]
    packsOpened: number
    lastUpdated: string
}

// Tipos para los sets organizados por generación
export interface Generation {
    name: string
    years: string
    sets: CardSet[]
}

// Tipos para la simulación de sobres
export interface PackResult {
    cards: PokemonCard[]
    setId: string
    openedAt: string
}

// Raridades en orden de probabilidad
export const RARITY_TIERS = {
    common: ['Common'],
    uncommon: ['Uncommon'],
    rare: ['Rare', 'Rare Holo'],
    ultraRare: ['Rare Holo EX', 'Rare Holo GX', 'Rare Holo V', 'Rare Holo VMAX', 'Rare BREAK', 'Rare Prime', 'Rare Prism Star', 'Rare ACE', 'Rare Shiny', 'Amazing Rare'],
    secretRare: ['Rare Ultra', 'Rare Rainbow', 'Rare Secret', 'Illustration Rare', 'Special Illustration Rare', 'Hyper Rare', 'Trainer Gallery Rare Holo', 'LEGEND', 'Radiant Rare']
} as const

export type RarityTier = keyof typeof RARITY_TIERS
