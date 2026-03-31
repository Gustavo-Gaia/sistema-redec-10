/* app/(sistema)/layout.js */

"use client"

import Sidebar from "@/components/Sidebar"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import "leaflet/dist/leaflet.css"

import { MonitoramentoProvider } from "./monitoramento/MonitoramentoContext"

export default function SistemaLayout({ children }) {
  const router = useRouter()

  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    carregarUsuario()
  }, [])

  async function carregarUsuario() {
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

  return (
    <div className="h-full flex overflow-hidden">

      <MonitoramentoProvider>

        {/* Sidebar */}
        <Sidebar />

        {/* Área principal */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-transparent">

          {/* HEADER */}
          <header className="bg-white/70 backdrop-blur-md m-6 mb-4 p-6 rounded-2xl shadow-sm border border-white/50 flex items-center gap-6">

            <Image
              src="/REDEC_10_NORTE_LOGO.png"
              alt="Logo"
              width={50}
              height={50}
              priority
            />

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                Sistema Integrado REDEC 10 - Norte
              </h1>

              <p className="text-slate-700 font-medium">
                Gestão Estratégica em Defesa Civil
              </p>
            </div>

            {/* 🔥 USUÁRIO */}
            {usuario && (
              <div className="flex items-center gap-3 bg-white border px-3 py-2 rounded-xl shadow-sm">

                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  👤
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-slate-500">
                    Usuário
                  </span>

                  <span className="text-sm font-bold text-slate-800">
                    {usuario.rg || usuario.email}
                  </span>
                </div>

                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCorNivel(usuario.nivel)}`}>
                  {usuario.nivel}
                </span>

              </div>
            )}

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition shadow-md"
            >
              Sair
            </button>

          </header>

          {/* CONTEÚDO */}
          <main className="flex-1 px-6 pb-10">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="p-6 text-center text-slate-600 text-sm border-t border-white/30 bg-white/50 backdrop-blur-sm">
            © 2026 | REDEC 10 - Norte | Defesa Civil Estadual
          </footer>

        </div>
      </MonitoramentoProvider>
    </div>
  )
}
