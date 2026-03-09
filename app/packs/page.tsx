'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { getAllSets, getCardsBySet, organizeSetsByGeneration } from '@/lib/pokemonTcgApi'
import { simulatePack, isHoloCard, isUltraRare } from '@/lib/packSimulator'
import { addCardsToCollection } from '@/lib/storage'
import { CardSet, PokemonCard, Generation } from '@/types/pokemon'
import Card from '@/components/Card'

export default function PacksPage() {
    const [generations, setGenerations] = useState<Generation[]>([])
    const [expandedGen, setExpandedGen] = useState<string | null>(null)
    const [selectedSet, setSelectedSet] = useState<CardSet | null>(null)
    const [setCards, setSetCards] = useState<PokemonCard[]>([])
    const [packCards, setPackCards] = useState<PokemonCard[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingSet, setLoadingSet] = useState(false)
    const [opening, setOpening] = useState(false)
    const [isTearing, setIsTearing] = useState(false)
    const [revealedCount, setRevealedCount] = useState(0)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'normal' | 'success' | 'holo'>('normal')

    // Cargar todos los sets al inicio
    useEffect(() => {
        loadSets()
    }, [])

    async function loadSets() {
        setLoading(true)
        setMessage('')
        try {
            const sets = await getAllSets()
            const organized = organizeSetsByGeneration(sets)
            setGenerations(organized)

            // Expandir la primera generación por defecto
            if (organized.length > 0) {
                setExpandedGen(organized[0].name)
            }
        } catch (error) {
            console.error('Error loading sets:', error)
            setMessage('⚠️ No se pudieron cargar los sets. La API está lenta o no responde.')
            setMessageType('normal')
        } finally {
            setLoading(false)
        }
    }

    // Cargar cartas cuando se selecciona un set
    const selectSet = async (set: CardSet) => {
        setSelectedSet(set)
        setLoadingSet(true)
        setPackCards([])
        setMessage(`Cargando ${set.name}...`)
        setMessageType('normal')

        try {
            const cards = await getCardsBySet(set.id)
            setSetCards(cards)
            setMessage(`✅ ${cards.length} cartas cargadas`)
            setMessageType('success')
        } catch (error) {
            console.error('Error loading cards:', error)
            setMessage('Error al cargar las cartas')
            setMessageType('normal')
        } finally {
            setLoadingSet(false)
        }
    }

    // Abrir un sobre
    const openPack = () => {
        if (setCards.length === 0) return

        setOpening(true)
        setIsTearing(false)
        setRevealedCount(0)
        setPackCards([])
        setMessage('Preparando sobre...')
        setMessageType('normal')

        // Iniciar animación de rasgado después de un momento
        setTimeout(() => {
            setIsTearing(true)
            
            // Simular las cartas y mostrarlas boca abajo
            const pack = simulatePack(setCards)
            
            setTimeout(() => {
                setPackCards(pack)
                setOpening(false)
                setIsTearing(false)
                setMessage('Toca las cartas para revelarlas')
            }, 1200) // Duración de la animación de rasgado
        }, 800)
    }

    const handleCardReveal = (card: PokemonCard) => {
        setRevealedCount(prev => {
            const newCount = prev + 1
            if (newCount === packCards.length) {
                // Todas reveladas, añadir a colección
                addCardsToCollection(packCards)
                window.dispatchEvent(new Event('collectionUpdated'))
                
                const ultraRare = packCards.find(c => isUltraRare(c.rarity))
                const holo = packCards.find(c => isHoloCard(c.rarity))

                if (ultraRare) {
                    setMessage(`🌟 ¡INCREÍBLE! Has encontrado: ${ultraRare.name}`)
                    setMessageType('holo')
                } else if (holo) {
                    setMessage(`✨ ¡Holo! - ${holo.name}`)
                    setMessageType('holo')
                } else {
                    setMessage('¡Sobre completado! Cartas añadidas')
                    setMessageType('success')
                }
            }
            return newCount
        })
    }

    if (loading) {
        // ... loading state
    }

    return (
        <div className="page">
            {/* Opening Animation Overlay */}
            {opening && (
                <div className="opening-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div className={`pack-wrapper ${isTearing ? 'is-tearing' : ''}`}>
                        <div 
                            className="pack-half pack-half-left" 
                            style={{ backgroundImage: `url(${selectedSet?.images.logo})`, backgroundColor: '#ff5350' }} 
                        />
                        <div 
                            className="pack-half pack-half-right" 
                            style={{ backgroundImage: `url(${selectedSet?.images.logo})`, backgroundColor: '#3b5ca8' }} 
                        />
                    </div>
                    <div className="opening-text" style={{ marginTop: '2rem' }}>
                        {isTearing ? '¡Abriendo!' : 'Preparando...'}
                    </div>
                </div>
            )}

            <div className="container">
                <h1 className="title-lg text-center mb-2">Abrir Sobres</h1>
                <p className="text-secondary text-center mb-3">
                    Selecciona una expansión y abre sobres para conseguir cartas
                </p>

                {/* Message Toast */}
                {message && (
                    <div className="text-center mb-3">
                        <span className={`toast ${messageType}`}>{message}</span>
                        {generations.length === 0 && !loading && (
                            <div style={{ marginTop: '1rem' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={loadSets}
                                    disabled={loading}
                                >
                                    🔄 Reintentar
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Selected Set Info */}
                {selectedSet && (
                    <div className="card mb-3" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <img
                            src={selectedSet.images.logo}
                            alt={selectedSet.name}
                            style={{ height: '50px', objectFit: 'contain' }}
                        />
                        <div style={{ flex: 1 }}>
                            <h3 className="title-sm">{selectedSet.name}</h3>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                {selectedSet.total} cartas • {selectedSet.releaseDate}
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={openPack}
                            disabled={opening || loadingSet || setCards.length === 0}
                        >
                            🎴 {opening ? 'Abriendo...' : loadingSet ? 'Cargando...' : 'Abrir Sobre'}
                        </button>
                    </div>
                )}

                {/* Pack Results */}
                {packCards.length > 0 && (
                    <section className="section">
                        <h2 className="title-md text-center mb-2">¡Tu Sobre!</h2>
                        <div className="cards-grid">
                            {packCards.map((card, index) => (
                                <Card
                                    key={`${card.id}-${index}`}
                                    card={card}
                                    revealMode={true}
                                    onClick={() => handleCardReveal(card)}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Generation Accordions */}
                <section className="section">
                    <h2 className="title-md mb-2">Expansiones Disponibles</h2>

                    {generations.map(gen => (
                        <div key={gen.name} className="generation-section">
                            <div
                                className="generation-header"
                                onClick={() => setExpandedGen(expandedGen === gen.name ? null : gen.name)}
                            >
                                <span className="generation-title">{gen.name}</span>
                                <div className="generation-meta">
                                    <span>{gen.sets.length} sets</span>
                                    <span>{gen.years}</span>
                                    <span>{expandedGen === gen.name ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {expandedGen === gen.name && (
                                <div className="generation-content">
                                    <div className="sets-grid">
                                        {gen.sets.map(set => (
                                            <div
                                                key={set.id}
                                                className={`set-card ${selectedSet?.id === set.id ? 'selected' : ''}`}
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            </div>
        </div>
    )
}
