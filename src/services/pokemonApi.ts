// DEPRECADO - Este archivo está siendo reemplazado por ../../lib/pokemonTcgApi.ts
// Por compatibilidad, reexportamos desde la nueva ubicación

export { 
  getAllSets, 
  getCardsBySet, 
  searchCards, 
  organizeSetsByGeneration, 
  getSetById 
} from '../../lib/pokemonTcgApi'

export type { PokemonCard } from '../../types/pokemon'

// Funciones de simulación de pack
export { simulatePack, isHoloCard, isUltraRare } from '../../lib/packSimulator'

