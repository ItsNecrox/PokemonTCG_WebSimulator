'use client'

import './globals.css'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { AuthProvider } from '@/components/AuthContext'
import { CollectionProvider } from '@/components/CollectionContext'
import { ThemeProvider } from '@/components/ThemeContext'
import { ToastProvider } from '@/components/ToastProvider'

const Navbar = dynamic(() => import('@/components/Navbar'), {
    ssr: false,
    loading: () => null,
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <link
                    rel="icon"
                    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎴</text></svg>"
                />
            </head>
            <body>
                <ThemeProvider>
                    <AuthProvider>
                        <CollectionProvider>
                            <ToastProvider>
                                <Navbar />
                                <main>{children}</main>
                            </ToastProvider>
                        </CollectionProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
