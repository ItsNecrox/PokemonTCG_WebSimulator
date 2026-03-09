import { supabase } from './supabase'
import { PokemonCard } from '@/types/pokemon'

export interface CollectionCard {
  id: string
  user_id: string
  card_id: string
  quantity: number
  card_data: PokemonCard
}

export async function addCardToCollection(userId: string, card: PokemonCard, quantity: number = 1) {
  const { data, error } = await supabase
    .from('user_collections')
    .upsert({
      user_id: userId,
      card_id: card.id,
      card_data: card,
      quantity
    }, {
      onConflict: 'user_id,card_id'
    })
    .select()

  if (error) throw new Error(error.message)
  return data
}

export async function getCollection(userId: string) {
  const { data, error } = await supabase
    .from('user_collections')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data as CollectionCard[]
}

export async function updateCardQuantity(userId: string, cardId: string, quantity: number) {
  if (quantity <= 0) {
    return deleteCardFromCollection(userId, cardId)
  }

  const { data, error } = await supabase
    .from('user_collections')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .select()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteCardFromCollection(userId: string, cardId: string) {
  const { error } = await supabase
    .from('user_collections')
    .delete()
    .eq('user_id', userId)
    .eq('card_id', cardId)

  if (error) throw new Error(error.message)
}

export async function getCollectionStats(userId: string) {
  const collection = await getCollection(userId)
  const stats = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!stats.data) {
    return {
      totalCards: 0,
      uniqueCards: 0,
      setsWithCards: 0,
      packsOpened: 0
    }
  }

  return {
    totalCards: stats.data.total_cards,
    uniqueCards: stats.data.unique_cards,
    setsWithCards: stats.data.sets_collected,
    packsOpened: stats.data.packs_opened
  }
}

export async function updateUserStats(userId: string, stats: Partial<{
  packs_opened: number
  total_cards: number
  unique_cards: number
  sets_collected: number
}>) {
  const { data, error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      ...stats,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()

  if (error) throw new Error(error.message)
  return data
}
