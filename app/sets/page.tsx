'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { getAllSets, getCardsBySet, organizeSetsByGeneration } from '@/lib/pokemonTcgApi'
import { getCollection, getSetProgress } from '@/lib/storage'
import { CardSet, Generation, UserCollection } from '@/types/pokemon'
import Card from '@/components/Card'

export default function SetsPage() {
    const [generations, setGenerations] = useState<Generation[]>([])
    const [collection, setCollection] = useState<UserCollection | null>(null)
    const [selectedSet, setSelectedSet] = useState<CardSet | null>(null)
    const [setCards, setSetCards] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingCards, setLoadingCards] = useState(false)
    const [showOwned, setShowOwned] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [sets, userCollection] = await Promise.all([
                getAllSets(),
                Promise.resolve(getCollection())
            ])

            setCollection(userCollection)
            setGenerations(organizeSetsByGeneration(sets))
        } catch (error) {
            console.error('Error loading sets:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectSet = async (set: CardSet) => {
        setSelectedSet(set)
        setLoadingCards(true)
        setSetCards([])

        try {
            const cards = await getCardsBySet(set.id)

            // Añadir información de si el usuario tiene la carta
            const cardsWithOwnership = cards.map(card => ({
                ...card,
                owned: collection?.cards.some(c => c.cardId === card.id) || false,
                quantity: collection?.cards.find(c => c.cardId === card.id)?.quantity || 0
            }))

            setSetCards(cardsWithOwnership)
        } catch (error) {
            console.error('Error loading set cards:', error)
        } finally {
            setLoadingCards(false)
        }
    }

    const getProgress = (setId: string, total: number) => {
        if (!collection) return { percentage: 0, unique: 0 }
        return getSetProgress(collection, setId, total)
    }

    const filteredCards = showOwned
        ? setCards.filter(c => c.owned)
        : setCards

    if (loading) {
        return (
            <div className="page">
                <div className="container text-center" style={{ paddingTop: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗂️</div>
                    <p>Cargando sets...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="container">
                <h1 className="title-lg text-center mb-2">Pokédex de Sets</h1>
                <p className="text-secondary text-center mb-4">
                    Explora todas las expansiones de Pokémon TCG
                </p>

                {/* Selected Set View */}
                {selectedSet && (
                    <div className="card mb-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedSet(null)}
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                ← Volver
                            </button>
                            <img
                                src={selectedSet.images.logo}
                                alt={selectedSet.name}
                                style={{ height: '50px', objectFit: 'contain' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h3 className="title-sm">{selectedSet.name}</h3>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    {selectedSet.total} cartas • {selectedSet.releaseDate} • {selectedSet.series}
                                </p>
                            </div>

                            {/* Progress */}
                            {collection && collection.cards.length > 0 && (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        background: 'var(--gradient-pokemon)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        {getProgress(selectedSet.id, selectedSet.total).percentage}%
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        {getProgress(selectedSet.id, selectedSet.total).unique} / {selectedSet.total}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="progress-bar" style={{ marginBottom: '1rem' }}>
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${getProgress(selectedSet.id, selectedSet.total).percentage}%` }}
                            />
                        </div>

                        {/* Filter toggle */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button
                                className={`btn ${!showOwned ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setShowOwned(false)}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                                Todas ({setCards.length})
                            </button>
                            <button
                                className={`btn ${showOwned ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setShowOwned(true)}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                                Mis cartas ({setCards.filter(c => c.owned).length})
                            </button>
                        </div>

                        {/* Cards grid */}
                        {loadingCards ? (
                            <div className="text-center" style={{ padding: '2rem' }}>
                                <p>Cargando cartas...</p>
                            </div>
                        ) : (
                            <div className="cards-grid">
                                {filteredCards.map(card => (
                                    <div key={card.id} style={{ position: 'relative' }}>
                                        <div style={{
                                            opacity: card.owned ? 1 : 0.4,
                                            filter: card.owned ? 'none' : 'grayscale(0.5)'
                                        }}>
                                            <Card card={card} />
                                        </div>

                                        {/* Ownership badge */}
                                        {card.owned && card.quantity > 0 && (
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
                                                x{card.quantity}
                                            </div>
                                        )}

                                        {/* Not owned badge */}
                                        {!card.owned && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                background: 'rgba(0, 0, 0, 0.7)',
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                zIndex: 5
                                            }}>
                                                ❓
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sets List */}
                {!selectedSet && (
                    <>
                        {generations.map(gen => (
                            <div key={gen.name} className="section">
                                <div className="section-header">
                                    <h2 className="title-md">{gen.name}</h2>
                                    <span className="text-muted">
                                        {gen.sets.length} sets • {gen.years}
                                    </span>
                                </div>

                                <div className="sets-grid">
                                    {gen.sets.map(set => {
                                        const progress = getProgress(set.id, set.total)

                                        return (
                                            <div
                                                key={set.id}
                                                className="set-card"
                                                onClick={() => selectSet(set)}
                                            >
                                                <img
                                                    src={set.images.logo}
                                                    alt={set.name}
                                                    className="set-logo"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = set.images.symbol
                                                    }}
                                                />
                                                <div className="set-name">{set.name}</div>
                                                <div className="set-count">{set.total} cartas</div>

                                                {/* Mini progress bar */}
                                                {progress.unique > 0 && (
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <div className="progress-bar" style={{ height: '4px' }}>
                                                            <div
                                                                className="progress-bar-fill"
                                                                style={{ width: `${progress.percentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="text-muted" style={{
                                                            fontSize: '0.7rem',
                                                            marginTop: '0.25rem'
                                                        }}>
                                                            {progress.unique}/{set.total}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}
