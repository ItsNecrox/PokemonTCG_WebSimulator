'use client'

import { PokemonCard } from '@/types/pokemon'
import { useState, useMemo } from 'react'

interface CollectionFiltersProps {
  cards: PokemonCard[]
  onFilterChange: (filtered: PokemonCard[]) => void
}

export default function CollectionFilters({ cards, onFilterChange }: CollectionFiltersProps) {
  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState<string>('')
  const [setFilter, setSetFilter] = useState<string>('')

  // Extraer rarities y sets únicos
  const rarities = useMemo(() => {
    const unique = new Set(cards.map(c => c.rarity).filter(Boolean))
    return Array.from(unique).sort()
  }, [cards])

  const sets = useMemo(() => {
    const unique = new Set(cards.map(c => c.set?.name).filter(Boolean))
    return Array.from(unique).sort()
  }, [cards])

  // Aplicar filtros
  useMemo(() => {
    let filtered = cards

    // Búsqueda por nombre (fuzzy search)
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchLower) ||
        card.set?.name.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por rareza
    if (rarityFilter) {
      filtered = filtered.filter(card => card.rarity === rarityFilter)
    }

    // Filtro por set
    if (setFilter) {
      filtered = filtered.filter(card => card.set?.name === setFilter)
    }

    onFilterChange(filtered)
  }, [search, rarityFilter, setFilter, cards, onFilterChange])

  const handleClear = () => {
    setSearch('')
    setRarityFilter('')
    setSetFilter('')
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>🔍 Filtros</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {/* Búsqueda */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Búsqueda
          </label>
          <input
            type="text"
            placeholder="Nombre de carta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.375rem',
              color: 'white',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Filtro por Rareza */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Rareza
          </label>
          <select
            value={rarityFilter}
            onChange={e => setRarityFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.375rem',
              color: 'white',
              fontSize: '0.9rem'
            }}
          >
            <option value="">Todas las rarezas</option>
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>{rarity}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Set */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Set
          </label>
          <select
            value={setFilter}
            onChange={e => setSetFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.375rem',
              color: 'white',
              fontSize: '0.9rem'
            }}
          >
            <option value="">Todos los sets</option>
            {sets.map(set => (
              <option key={set} value={set}>{set}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón Limpiar */}
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={handleClear}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
        >
          ✕ Limpiar Filtros
        </button>
      </div>

      {/* Contador de resultados */}
      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
        Mostrando {cards.length} de {cards.length} cartas
      </div>
    </div>
  )
}
