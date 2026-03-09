'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { getCollection, getCollectionStats, getSetProgress } from '@/lib/storage'
import { getAllSets, getCardsBySet } from '@/lib/pokemonTcgApi'
import { UserCollection, PokemonCard, CardSet } from '@/types/pokemon'
import Card from '@/components/Card'

type ViewMode = 'grid' | 'sets'
type SortMode = 'recent' | 'name' | 'rarity' | 'set'

export default function CollectionPage() {
    const [collection, setCollection] = useState<UserCollection | null>(null)
    const [cards, setCards] = useState<PokemonCard[]>([])
    const [cardMap, setCardMap] = useState<Map<string, PokemonCard>>(new Map())
    const [sets, setSets] = useState<CardSet[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [sortMode, setSortMode] = useState<SortMode>('recent')
    const [selectedSet, setSelectedSet] = useState<string>('')
    const [selectedRarity, setSelectedRarity] = useState<string>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadCollection()
    }, [])

    const loadCollection = async () => {
        setLoading(true)

        try {
            const userCollection = getCollection()
            setCollection(userCollection)

            if (userCollection.cards.length === 0) {
                setLoading(false)
                return
            }

            // Cargar todos los sets
            const allSets = await getAllSets()
            setSets(allSets)

            // Obtener sets únicos de la colección
            const setsInCollection = [...new Set(userCollection.cards.map(c => c.fromSet))]

            // Cargar cartas de cada set y crear mapa
            const allCards: PokemonCard[] = []
            const newCardMap = new Map<string, PokemonCard>()

            // Procesar cada set de forma independiente para que uno fallido no bloquee todo
            await Promise.all(setsInCollection.map(async (setId) => {
                try {
                    const setCards = await getCardsBySet(setId)
                    setCards.forEach(card => newCardMap.set(card.id, card))

                    // Filtrar solo las cartas que tiene el usuario de este set
                    userCollection.cards
                        .filter(c => c.fromSet === setId)
                        .forEach(collectionCard => {
                            const fullCard = setCards.find(sc => sc.id === collectionCard.cardId)
                            if (fullCard) {
                                allCards.push({
                                    ...fullCard,
                                    id: collectionCard.cardId
                                })
                            }
                        })
                } catch (err) {
                    console.error(`Error loading set ${setId} in collection:`, err)
                }
            }))

            setCardMap(newCardMap)
            setCards(allCards)
        } catch (error) {
            console.error('Error loading collection:', error)
        } finally {
            setLoading(false)
        }
    }

    // Obtener cantidad de una carta
    const getCardQuantity = (cardId: string): number => {
        const card = collection?.cards.find(c => c.cardId === cardId)
        return card?.quantity || 0
    }

    // Filtrar y ordenar cartas
    const filteredCards = useMemo(() => {
        let result = [...cards]

        // Filtrar por búsqueda
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(card =>
                card.name.toLowerCase().includes(query)
            )
        }

        // Filtrar por set
        if (selectedSet) {
            result = result.filter(card => card.set.id === selectedSet)
        }

        // Filtrar por rareza
        if (selectedRarity) {
            result = result.filter(card => card.rarity === selectedRarity)
        }

        // Filtrar por tipo
        if (selectedType) {
            result = result.filter(card => card.types?.includes(selectedType))
        }

        // Ordenar
        switch (sortMode) {
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            case 'rarity':
                const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Rare Secret']
                result.sort((a, b) => {
                    const aIdx = rarityOrder.indexOf(a.rarity || 'Common')
                    const bIdx = rarityOrder.indexOf(b.rarity || 'Common')
                    return bIdx - aIdx // Raras primero
                })
                break
            case 'set':
                result.sort((a, b) => a.set.name.localeCompare(b.set.name))
                break
            // 'recent' mantiene el orden original
        }

        return result
    }, [cards, searchQuery, selectedSet, selectedRarity, sortMode])

    // Calcular progreso por set
    const setsProgress = useMemo(() => {
        if (!collection) return []

        const setsInCollection = [...new Set(collection.cards.map(c => c.fromSet))]

        return setsInCollection.map(setId => {
            const set = sets.find(s => s.id === setId)
            if (!set) return null

            const progress = getSetProgress(collection, setId, set.total)

            return {
                set,
                ...progress
            }
        }).filter(Boolean).sort((a, b) => (b?.percentage || 0) - (a?.percentage || 0))
    }, [collection, sets])

    // Obtener rarezas únicas
    const uniqueRarities = useMemo(() =>
        [...new Set(cards.map(c => c.rarity).filter(Boolean))].sort()
        , [cards])

    const setsInCollection = useMemo(() =>
        [...new Set(cards.map(c => c.set.id))]
        , [cards])

    const stats = collection ? getCollectionStats(collection) : null

    if (loading) {
        return (
            <div className="page">
                <div className="container text-center" style={{ paddingTop: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                    <p>Cargando colección...</p>
                </div>
            </div>
        )
    }

    if (!collection || collection.cards.length === 0) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h2 className="empty-state-title">Tu colección está vacía</h2>
                        <p className="empty-state-text">
                            ¡Abre algunos sobres para empezar a coleccionar cartas!
                        </p>
                        <a href="/packs" className="btn btn-primary">
                            🎴 Abrir Sobres
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="container">
                <h1 className="title-lg text-center mb-2">Mi Colección</h1>
                <p className="text-secondary text-center mb-3">
                    Todas las cartas que has conseguido abriendo sobres
                </p>

                {/* Stats */}
                {stats && (
                    <div className="stats-grid mb-4">
                        <div className="stat-card">
                            <div className="stat-card-value">{stats.packsOpened}</div>
                            <div className="stat-card-label">Sobres Abiertos</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value">{stats.uniqueCards}</div>
                            <div className="stat-card-label">Cartas Únicas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value">{stats.totalCards}</div>
                            <div className="stat-card-label">Total Cartas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value">{stats.setsWithCards}</div>
                            <div className="stat-card-label">Sets</div>
                        </div>
                    </div>
                )}

                {/* View Toggle */}
                <div className="card mb-3">
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button
                            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            🃏 Cartas
                        </button>
                        <button
                            className={`btn ${viewMode === 'sets' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('sets')}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            📊 Progreso por Set
                        </button>
                    </div>

                    {viewMode === 'grid' && (
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Buscar cartas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.9rem',
                                    minWidth: '200px'
                                }}
                            />

                            {/* Set Filter */}
                            <select
                                value={selectedSet}
                                onChange={(e) => setSelectedSet(e.target.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">Todos los sets</option>
                                {setsInCollection.map(setId => {
                                    const set = sets.find(s => s.id === setId)
                                    return (
                                        <option key={setId} value={setId}>
                                            {set?.name || setId}
                                        </option>
                                    )
                                })}
                            </select>

                            {/* Rarity Filter */}
                            <select
                                value={selectedRarity}
                                onChange={(e) => setSelectedRarity(e.target.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.9rem',
                                    flex: '1 1 150px'
                                }}
                            >
                                <option value="">Todas las rarezas</option>
                                {uniqueRarities.map(rarity => (
                                    <option key={rarity} value={rarity}>{rarity}</option>
                                ))}
                            </select>

                            {/* Type Filter */}
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.9rem',
                                    flex: '1 1 150px'
                                }}
                            >
                                <option value="">Todos los tipos</option>
                                {['Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water'].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>

                            {/* Sort */}
                            <select
                                value={sortMode}
                                onChange={(e) => setSortMode(e.target.value as SortMode)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="recent">Más recientes</option>
                                <option value="name">Por nombre</option>
                                <option value="rarity">Por rareza</option>
                                <option value="set">Por set</option>
                            </select>

                            <span className="text-muted" style={{ marginLeft: 'auto' }}>
                                {filteredCards.length} cartas
                            </span>
                        </div>
                    )}
                </div>

                {/* Cards Grid View */}
                {viewMode === 'grid' && (
                    <>
                        <div className="cards-grid">
                            {filteredCards.map((card, index) => (
                                <div key={`${card.id}-${index}`} style={{ position: 'relative' }}>
                                    <Card card={card} />
                                    {getCardQuantity(card.id) > 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: 'var(--gradient-pokemon)',
                                            color: '#000',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            zIndex: 5
                                        }}>
                                            x{getCardQuantity(card.id)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredCards.length === 0 && (
                            <div className="empty-state">
                                <p className="text-muted">No hay cartas con estos filtros</p>
                            </div>
                        )}
                    </>
                )}

                {/* Sets Progress View */}
                {viewMode === 'sets' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {setsProgress.map(progress => progress && (
                            <div key={progress.set.id} className="card" style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <img
                                        src={progress.set.images.logo}
                                        alt={progress.set.name}
                                        style={{ height: '40px', objectFit: 'contain' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = progress.set.images.symbol
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h3 className="title-sm">{progress.set.name}</h3>
                                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                                            {progress.unique} / {progress.set.total} cartas únicas • {progress.total} total
                                        </p>
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        background: progress.percentage === 100 ? 'var(--gradient-gold)' : 'var(--gradient-pokemon)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        {progress.percentage}%
                                    </div>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${progress.percentage}%`,
                                            background: progress.percentage === 100 ? 'var(--gradient-gold)' : 'var(--gradient-pokemon)'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
