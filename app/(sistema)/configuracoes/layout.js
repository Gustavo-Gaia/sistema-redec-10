/* app/(sistema)/configuracoes/layout.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ConfiguracoesLayout({ children }) {

  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verificar() {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("usuarios")
        .select("nivel")
        .eq("user_id", user.id)
        .single()

      if (!data || data.nivel !== "admin") {
        router.push("/dashboard")
        return
      }

      setLoading(false)
    }

    verificar()
  }, [])

  if (loading) {
    return <p className="p-6">Verificando acesso...</p>
  }

  return children
}
