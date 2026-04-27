/* lib/supabase.js */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,          // 🔥 mantém login no navegador
    /* autoRefreshToken: true,        // 🔥 renova token automaticamente */
    detectSessionInUrl: true       // 🔥 importante para fluxos de auth
  }
})
