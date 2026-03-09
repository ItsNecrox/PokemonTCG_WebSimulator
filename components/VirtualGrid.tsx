'use client'

import { useMemo } from 'react'

interface VirtualGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemWidth: number
  itemHeight: number
  containerHeight: number
  gap?: number
}

/**
 * Componente de grid virtual simplificado para renderizar listas
 * Nota: Para implementar true virtual scrolling, usar react-window-v2 o similar
 */
export function VirtualGrid<T>({
  items,
  renderItem,
  itemWidth,
  itemHeight,
  containerHeight,
  gap = 16
}: VirtualGridProps<T>) {
  const { columns } = useMemo(() => {
    const cols = Math.max(1, Math.floor(containerHeight / (itemWidth + gap)))
    return { columns: cols }
  }, [containerHeight, itemWidth, gap])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${itemWidth}px, 1fr))`,
        gap: `${gap}px`,
        maxHeight: containerHeight,
        overflowY: 'auto'
      }}
    >
      {items.map((item, index) => (
        <div key={index} style={{ width: itemWidth, height: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}

export default VirtualGrid
