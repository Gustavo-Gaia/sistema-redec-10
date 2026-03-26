/* app/(sistema)/configuracoes/layout.js */

/* app/(sistema)/configuracoes/layout.js */

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { redirect } from "next/navigation"

export default async function ConfiguracoesLayout({ children }) {

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )

  // =========================
  // 🔐 VERIFICA USUÁRIO
  // =========================
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // =========================
  // 🔐 BUSCA NÍVEL
  // =========================
  const { data } = await supabase
    .from("usuarios")
    .select("nivel")
    .eq("user_id", user.id)
    .single()

  // =========================
  // 🚫 BLOQUEIO
  // =========================
  if (!data || data.nivel !== "admin") {
    return redirect("/dashboard") // ou página que quiser
  }

  // =========================
  // ✅ LIBERADO
  // =========================
  return children
}
