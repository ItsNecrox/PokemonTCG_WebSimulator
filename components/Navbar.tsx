'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeContext'
import { useCollection } from './CollectionContext'
import { getCollection, getCollectionStats } from '@/lib/storage'

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const { stats } = useCollection()

    const handleLogout = async () => {
        await logout()
        router.push('/auth')
    }

    if (pathname === '/auth') return null

    const navItems = [
        { href: '/', label: 'Inicio', icon: '🏠' },
        { href: '/packs', label: 'Sobres', icon: '🎴' },
        { href: '/collection', label: 'Colección', icon: '📚' },
        { href: '/sets', label: 'Sets', icon: '🗂️' },
    ]

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link href="/" className="navbar-logo">
                    Pokémon TCG
                </Link>

                <ul className="navbar-nav">
                    {navItems.map(item => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="navbar-stats">
                    <div className="stat-badge">
                        <span>🎴</span>
                        <span className="stat-badge-value">{stats.uniqueCards}</span>
                        <span className="text-muted">cartas</span>
                    </div>
                    <div className="stat-badge">
                        <span>📦</span>
                        <span className="stat-badge-value">{stats.packsOpened}</span>
                        <span className="text-muted">sobres</span>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="btn btn-icon"
                        title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
                        style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '1.2rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {user && (
                        <>
                            <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                                {user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                                Cerrar sesión
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
