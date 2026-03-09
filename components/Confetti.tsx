'use client'

import { useEffect } from 'react'

interface ConfettiProps {
  count?: number
  duration?: number
}

export default function Confetti({ count = 50, duration = 2000 }: ConfettiProps) {
  useEffect(() => {
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.pointerEvents = 'none'
    container.style.zIndex = '9999'
    document.body.appendChild(container)

    const colors = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div')
      const left = Math.random() * 100
      const delay = Math.random() * 0.5
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      confetti.style.position = 'absolute'
      confetti.style.left = `${left}%`
      confetti.style.top = '-10px'
      confetti.style.width = '10px'
      confetti.style.height = '10px'
      confetti.style.background = color
      confetti.style.borderRadius = '50%'
      confetti.style.animation = `confetti ${duration / 1000}s ease-out ${delay}s forwards`
      confetti.style.boxShadow = `0 0 10px ${color}`

      container.appendChild(confetti)
    }

    setTimeout(() => {
      document.body.removeChild(container)
    }, duration + 500)
  }, [count, duration])

  return null
}
