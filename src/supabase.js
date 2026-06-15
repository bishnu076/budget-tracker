import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
