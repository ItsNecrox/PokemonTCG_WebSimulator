// Utilidades de búsqueda y filtrado

/**
 * Búsqueda fuzzy - permite errores de tipeo
 * Ejemplo: "pikachu" coincide con "Pikachu", "pikaccu", "Pika"
 */
export function fuzzySearch(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()

  let qIdx = 0

  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (q[qIdx] === t[i]) {
      qIdx++
    }
  }

  return qIdx === q.length
}

/**
 * Calcula la similitud entre dos strings (0-1)
 */
export function levenshteinSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase()
  const s2 = b.toLowerCase()

  if (s1 === s2) return 1

  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1
  if (shorter.length === 0) return 0

  const editDistance = getEditDistance(shorter, longer)
  return (longer.length - editDistance) / longer.length
}

function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }

  return costs[s2.length]
}

/**
 * Agrupa array de items por un atributo
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string | number, T[]> {
  return arr.reduce((result, item) => {
    const group = String(item[key])
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {} as Record<string | number, T[]>)
}

/**
 * Cuenta las ocurrencias de cada valor
 */
export function countOccurrences<T>(arr: T[]): Record<string, number> {
  return arr.reduce((result, item) => {
    const key = String(item)
    result[key] = (result[key] || 0) + 1
    return result
  }, {} as Record<string, number>)
}

/**
 * Calcula estadísticas de un array de números
 */
export function calculateStats(numbers: number[]) {
  if (numbers.length === 0) {
    return { mean: 0, median: 0, mode: 0, min: 0, max: 0, std: 0 }
  }

  const sorted = [...numbers].sort((a, b) => a - b)
  const sum = sorted.reduce((a, b) => a + b, 0)
  const mean = sum / sorted.length

  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]

  const counts = countOccurrences(numbers)
  const mode = Math.max(...Object.values(counts).map(Number))

  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
  const std = Math.sqrt(squaredDiffs.reduce((a, b) => a + b) / numbers.length)

  return {
    mean: Math.round(mean * 100) / 100,
    median,
    mode,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    std: Math.round(std * 100) / 100
  }
}

/**
 * Paginación helper
 */
export function paginate<T>(arr: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: arr.slice(start, end),
    total: arr.length,
    pages: Math.ceil(arr.length / pageSize),
    currentPage: page
  }
}

/**
 * Deduplicar array
 */
export function deduplicate<T>(arr: T[], key?: (item: T) => any): T[] {
  if (!key) return Array.from(new Set(arr))
  
  const seen = new Set()
  return arr.filter(item => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
