import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Workstation = {
  id: string
  user_id: string
  title: string | null
  created_at: string
  elo_rating: number
  total_votes: number
  is_active: boolean
}

export type Photo = {
  id: string
  workstation_id: string
  storage_path: string
  display_order: number
  created_at: string
}

export type Vote = {
  id: string
  voter_id: string
  winner_id: string
  loser_id: string
  created_at: string
}