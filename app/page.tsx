'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCollection, getCollectionStats } from '@/lib/storage'

export default function HomePage() {
    const [stats, setStats] = useState({
        totalCards: 0,
        uniqueCards: 0,
        setsWithCards: 0,
        packsOpened: 0
    })

    useEffect(() => {
        const collection = getCollection()
        setStats(getCollectionStats(collection))
        
        // Actualizar stats cuando cambia la colección
        const handleUpdate = () => {
            const updatedCollection = getCollection()
            setStats(getCollectionStats(updatedCollection))
        }
        
        window.addEventListener('collectionUpdated', handleUpdate)
        return () => window.removeEventListener('collectionUpdated', handleUpdate)
    }, [])

    return (
        <div className="page">
            <div className="container">
                {/* Hero Section */}
                <section className="text-center mb-4" style={{ paddingTop: '3rem' }}>
                    <h1 className="title-xl mb-2">Pokémon TCG Simulator</h1>
                    <p className="text-secondary" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        Abre sobres virtuales de todas las expansiones, colecciona cartas y conviértete en el mejor entrenador
                    </p>

                    <div className="flex justify-center gap-2" style={{ flexWrap: 'wrap' }}>
                        <Link href="/packs" className="btn btn-primary btn-lg">
                            🎴 Abrir Sobres
                        </Link>
                        <Link href="/collection" className="btn btn-secondary btn-lg">
                            📚 Mi Colección
                        </Link>
                    </div>
                </section>

                {/* Stats */}
                <section className="section">
                    <div className="stats-grid">
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
                            <div className="stat-card-label">Sets Coleccionados</div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="section">
                    <h2 className="title-md text-center mb-3">Características</h2>
                    <div className="stats-grid">
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎴</div>
                            <h3 className="title-sm mb-1">Todas las Expansiones</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Desde Base Set (1999) hasta Scarlet & Violet
                            </p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
                            <h3 className="title-sm mb-1">Efectos Premium</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Animaciones holográficas en cartas raras
                            </p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
                            <h3 className="title-sm mb-1">Probabilidades Reales</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Pull rates como en los sobres reales
                            </p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💾</div>
                            <h3 className="title-sm mb-1">Colección Guardada</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Tu progreso se guarda automáticamente
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
