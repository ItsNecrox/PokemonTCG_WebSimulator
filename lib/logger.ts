// Sistema de logging centralizado
// Tipos de log: INFO, WARN, ERROR
// Categorías: API, AUTH, STORAGE, UI, PACK

type LogLevel = 'INFO' | 'WARN' | 'ERROR'
type LogCategory = 'API' | 'AUTH' | 'STORAGE' | 'UI' | 'PACK' | 'GENERAL'

interface LogEntry {
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
}

// En producción, guardar en base de datos
const isDevelopment = process.env.NODE_ENV === 'development'
const logHistory: LogEntry[] = []
const MAX_LOG_HISTORY = 100

function formatTimestamp(): string {
  return new Date().toISOString().split('T')[1].split('.')[0]
}

function log(level: LogLevel, message: string, category: LogCategory = 'GENERAL') {
  const entry: LogEntry = {
    timestamp: formatTimestamp(),
    level,
    category,
    message
  }

  logHistory.push(entry)
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift()
  }

  const prefix = `[${entry.timestamp}] [${category}]`
  const color = level === 'ERROR' ? 'color:red' : level === 'WARN' ? 'color:orange' : 'color:blue'

  if (isDevelopment) {
    console.log(`%c${prefix}`, color, message)
  }

  // En producción, enviar a servicio de logging
  if (!isDevelopment && level === 'ERROR') {
    // TODO: Enviar a Sentry o similar
    console.error(`${prefix}`, message)
  }
}

export function logInfo(message: string, category: LogCategory = 'GENERAL') {
  log('INFO', message, category)
}

export function logWarn(message: string, category: LogCategory = 'GENERAL') {
  log('WARN', message, category)
}

export function logError(message: string, category: LogCategory = 'GENERAL') {
  log('ERROR', message, category)
}

export function getLogHistory(): LogEntry[] {
  return [...logHistory]
}

export function clearLogHistory() {
  logHistory.length = 0
}

export function exportLogs(): string {
  return logHistory
    .map(entry => `${entry.timestamp} [${entry.level}] [${entry.category}] ${entry.message}`)
    .join('\n')
}

// Exportar como objeto para compatibilidad
export const logger = {
  logInfo,
  logWarn,
  logError,
  getLogHistory,
  clearLogHistory,
  exportLogs,
}
