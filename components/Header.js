/* components/Header.js */

"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Header() {

  const router = useRouter()

  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarUsuario()
  }, [])

  async function carregarUsuario() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("usuarios")
        .select("rg, email, nivel")
        .eq("user_id", user.id)
        .single()

      setUsuario(data)

    } catch (err) {
      console.error("Erro ao carregar usuário", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  function getCorNivel(nivel) {
    if (nivel === "admin") return "bg-purple-100 text-purple-700"
    if (nivel === "operador") return "bg-blue-100 text-blue-700"
    return "bg-slate-100 text-slate-600"
  }

  if (loading) return null

  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-slate-200 z-10">

      {/* LOGO */}
      <div className="flex items-center gap-3">
        <Image
          src="/logotipo_redec_norte.png"
          alt="Logo"
          width={32}
          height={32}
        />

        <span className="font-bold text-slate-800 tracking-tight">
          REDEC 10 NORTE
        </span>
      </div>

      {/* USUÁRIO */}
      <div className="flex items-center gap-4">

        {usuario && (
          <div className="flex items-center gap-3 bg-slate-50 border px-3 py-1.5 rounded-lg">

            {/* ÍCONE */}
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
              👤
            </div>

            {/* INFO */}
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-slate-500">
                Usuário
              </span>

              <span className="text-sm font-bold text-slate-800">
                {usuario.rg || usuario.email}
              </span>
            </div>

            {/* NÍVEL */}
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCorNivel(usuario.nivel)}`}>
              {usuario.nivel}
            </span>

          </div>
        )}

        {/* SAIR */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all"
        >
          Sair
        </button>

      </div>

    </header>
  )
}
