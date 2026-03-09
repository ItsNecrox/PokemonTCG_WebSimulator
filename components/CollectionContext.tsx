'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { PokemonCard, UserCollection } from '@/types/pokemon'
import { getCollection, getCollectionStats, addCardsToCollection } from '@/lib/storage'
import { logInfo, logError } from '@/lib/logger'

export interface CollectionStats {
  totalCards: number
  uniqueCards: number
  setsWithCards: number
  packsOpened: number
  raresByRarity: Record<string, number>
}

interface CollectionContextType {
  collection: UserCollection | null
  stats: CollectionStats
  addCards: (cards: PokemonCard[]) => void
  getUniqueCards: () => PokemonCard[]
  getCardsByRarity: (rarity: string) => PokemonCard[]
  getCardsBySet: (setId: string) => PokemonCard[]
  isCardInCollection: (cardId: string) => boolean
  getDuplicateCount: (cardId: string) => number
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [collection, setCollection] = useState<UserCollection | null>(null)
  const [stats, setStats] = useState<CollectionStats>({
    totalCards: 0,
    uniqueCards: 0,
    setsWithCards: 0,
    packsOpened: 0,
    raresByRarity: {}
  })

  // Cargar colección al montar
  useEffect(() => {
    try {
      const storedCollection = getCollection()
      setCollection(storedCollection)
      
      const newStats = getCollectionStats(storedCollection)
      setStats({
        totalCards: storedCollection.cards.length,
        uniqueCards: newStats.uniqueCards,
        setsWithCards: newStats.setsWithCards,
        packsOpened: newStats.packsOpened,
        raresByRarity: getRaresByRarity(storedCollection.cards)
      })
      
      logInfo(`Colección cargada: ${storedCollection.cards.length} cartas (${newStats.uniqueCards} únicas)`, 'STORAGE')
    } catch (error) {
      logError(`Error al cargar colección: ${error}`, 'STORAGE')
    }
  }, [])

  // Escuchar cambios de colección
  useEffect(() => {
    const handleCollectionUpdate = () => {
      try {
        const updatedCollection = getCollection()
        setCollection(updatedCollection)
        
        const newStats = getCollectionStats(updatedCollection)
        setStats({
          totalCards: updatedCollection.cards.length,
          uniqueCards: newStats.uniqueCards,
          setsWithCards: newStats.setsWithCards,
          packsOpened: newStats.packsOpened,
          raresByRarity: getRaresByRarity(updatedCollection.cards)
        })
      } catch (error) {
        logError(`Error al actualizar colección: ${error}`, 'STORAGE')
      }
    }

    window.addEventListener('collectionUpdated', handleCollectionUpdate)
    window.addEventListener('storage', handleCollectionUpdate)

    return () => {
      window.removeEventListener('collectionUpdated', handleCollectionUpdate)
      window.removeEventListener('storage', handleCollectionUpdate)
    }
  }, [])

  const addCards = (cards: PokemonCard[]) => {
    try {
      addCardsToCollection(cards)
      // Disparar evento para actualizar
      window.dispatchEvent(new Event('collectionUpdated'))
      logInfo(`Añadidas ${cards.length} cartas a la colección`, 'STORAGE')
    } catch (error) {
      logError(`Error al añadir cartas: ${error}`, 'STORAGE')
    }
  }

  const getUniqueCards = () => {
    if (!collection) return []
    const seen = new Set<string>()
    return collection.cards
      .filter(card => {
        if (seen.has(card.cardId)) return false
        seen.add(card.cardId)
        return true
      })
      .map(cc => ({ id: cc.cardId } as PokemonCard))
  }

  const getCardsByRarity = (rarity: string) => {
    if (!collection) return []
    // Este método necesitaría los datos completos de las cartas
    // Por ahora retorna vacío
    return []
  }

  const getCardsBySet = (setId: string) => {
    if (!collection) return []
    return collection.cards
      .filter(card => card.fromSet === setId)
      .map(cc => ({ id: cc.cardId } as PokemonCard))
  }

  const isCardInCollection = (cardId: string) => {
    if (!collection) return false
    return collection.cards.some(card => card.cardId === cardId)
  }

  const getDuplicateCount = (cardId: string) => {
    if (!collection) return 0
    const count = collection.cards.filter(card => card.cardId === cardId).length
    return count > 1 ? count - 1 : 0
  }

  return (
    <CollectionContext.Provider
      value={{
        collection,
        stats,
        addCards,
        getUniqueCards,
        getCardsByRarity,
        getCardsBySet,
        isCardInCollection,
        getDuplicateCount
      }}
    >
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const context = useContext(CollectionContext)
  if (context === undefined) {
    throw new Error('useCollection must be used within CollectionProvider')
  }
  return context
}

// Utilidad para contar cartas por rareza
function getRaresByRarity(cards: any[]): Record<string, number> {
  // Las tarjetas en almacenamiento local no incluyen rarity
  // Este es un placeholder para futuras implementaciones
  return {}
}
