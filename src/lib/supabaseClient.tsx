import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// ❗️Não devemos rebentar a app se as envs não estiverem configuradas
const SUPABASE_READY = Boolean(supabaseUrl && supabaseAnonKey)

let supabase: SupabaseClient | null = null

if (SUPABASE_READY) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.error('[Auth] Faltam variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — login desativado.')
}

export const supabaseConfigured = SUPABASE_READY
export { supabase }
export default supabase
