'use client'

import { PokemonCard } from '@/types/pokemon'
import { isHoloCard, isUltraRare, getRarityColor } from '@/lib/packSimulator'
import { useState, memo } from 'react'

interface CardProps {
    card: PokemonCard
    style?: React.CSSProperties
    onClick?: () => void
    showDetails?: boolean
}

function CardComponent({ card, style, onClick, showDetails = false }: CardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const holo = isHoloCard(card.rarity)
    const ultra = isUltraRare(card.rarity)

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else {
            setIsExpanded(true)
        }
    }

    return (
        <>
            <div
                className={`pokemon-card ${holo ? 'holo' : ''} ${ultra ? 'ultra-rare' : ''}`}
                style={style}
                onClick={handleClick}
            >
                <div className="pokemon-card-inner">
                    <img
                        src={card.images.small}
                        alt={card.name}
                        className="pokemon-card-image"
                        loading="lazy"
                    />
                    <div className="pokemon-card-info">
                        <div className="pokemon-card-name" title={card.name}>
                            {card.name}
                        </div>
                        <div
                            className="pokemon-card-rarity"
                            style={{ color: getRarityColor(card.rarity) }}
                        >
                            {card.rarity || 'Common'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Card Modal */}
            {isExpanded && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '2rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsExpanded(false)}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            maxWidth: '500px',
                            animation: 'fadeIn 0.3s ease-out'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Large Card Image */}
                        <div style={{ position: 'relative' }}>
                            <img
                                src={card.images.large}
                                alt={card.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: holo
                                        ? '0 0 40px rgba(255, 215, 0, 0.4)'
                                        : '0 20px 60px rgba(0, 0, 0, 0.5)'
                                }}
                            />

                            {/* Holo overlay effect */}
                            {holo && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,215,0,0.1) 100%)',
                                    borderRadius: 'var(--radius-lg)',
                                    pointerEvents: 'none',
                                    animation: 'holoShine 3s ease-in-out infinite'
                                }} />
                            )}
                        </div>

                        {/* Card Details */}
                        <div style={{
                            marginTop: '1.5rem',
                            textAlign: 'center',
                            color: 'white'
                        }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                marginBottom: '0.5rem'
                            }}>
                                {card.name}
                            </h2>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                marginBottom: '1rem'
                            }}>
                                <span style={{
                                    padding: '0.375rem 0.75rem',
                                    background: `${getRarityColor(card.rarity)}30`,
                                    border: `1px solid ${getRarityColor(card.rarity)}50`,
                                    borderRadius: 'var(--radius-full)',
                                    color: getRarityColor(card.rarity),
                                    fontSize: '0.85rem'
                                }}>
                                    {card.rarity || 'Common'}
                                </span>

                                {card.hp && (
                                    <span style={{
                                        padding: '0.375rem 0.75rem',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: 'var(--radius-full)',
                                        color: '#ef4444',
                                        fontSize: '0.85rem'
                                    }}>
                                        HP {card.hp}
                                    </span>
                                )}

                                {card.types?.map(type => (
                                    <span
                                        key={type}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {type}
                                    </span>
                                ))}
                            </div>

                            <p style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.9rem'
                            }}>
                                {card.set.name} • #{card.number}
                            </p>

                            {card.artist && (
                                <p style={{
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    fontSize: '0.8rem',
                                    marginTop: '0.5rem'
                                }}>
                                    Ilustrado por {card.artist}
                                </p>
                            )}

                            {/* Attacks */}
                            {card.attacks && card.attacks.length > 0 && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'left'
                                }}>
                                    <h4 style={{
                                        fontSize: '0.9rem',
                                        marginBottom: '0.75rem',
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    }}>
                                        Ataques
                                    </h4>
                                    {card.attacks.slice(0, 2).map((attack, idx) => (
                                        <div key={idx} style={{ marginBottom: '0.5rem' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ fontWeight: '600' }}>{attack.name}</span>
                                                <span style={{ color: '#ef4444', fontWeight: '700' }}>
                                                    {attack.damage || '—'}
                                                </span>
                                            </div>
                                            {attack.text && (
                                                <p style={{
                                                    fontSize: '0.8rem',
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    marginTop: '0.25rem'
                                                }}>
                                                    {attack.text}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Close hint */}
                        <p style={{
                            marginTop: '1.5rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '0.85rem'
                        }}>
                            Clic fuera para cerrar
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}

// Memoizar el componente para evitar re-renders innecesarios
export default memo(CardComponent, (prevProps, nextProps) => {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.style === nextProps.style &&
    prevProps.onClick === nextProps.onClick
  )
})
