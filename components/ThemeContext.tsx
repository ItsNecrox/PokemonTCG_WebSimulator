'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { logInfo } from '@/lib/logger'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Cargar tema guardado
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme | null
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      const initialTheme = saved || (prefersDark ? 'dark' : 'light')
      setTheme(initialTheme)
      applyTheme(initialTheme)
      setMounted(true)
      
      logInfo(`Tema cargado: ${initialTheme}`, 'UI')
    } catch (error) {
      setMounted(true)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.style.setProperty('--bg-primary', '#0f0f1e')
      root.style.setProperty('--bg-secondary', '#1a1a2e')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#a0a0a0')
      root.style.setProperty('--border-color', '#333333')
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.style.setProperty('--bg-primary', '#ffffff')
      root.style.setProperty('--bg-secondary', '#f5f5f5')
      root.style.setProperty('--text-primary', '#000000')
      root.style.setProperty('--text-secondary', '#666666')
      root.style.setProperty('--border-color', '#cccccc')
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    logInfo(`Tema cambiado a: ${newTheme}`, 'UI')
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
