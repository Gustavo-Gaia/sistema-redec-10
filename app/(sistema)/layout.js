/* app/(sistema)/layout.js */

"use client"

import Sidebar from "@/components/Sidebar"
import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import "leaflet/dist/leaflet.css"

import { MonitoramentoProvider } from "./monitoramento/MonitoramentoContext"

export default function SistemaLayout({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Primeiro carregamento: mostra o loading na tela
    carregarUsuario(true)

    // 2. Escuta mudanças de auth (foco na aba, refresh de token, etc)
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      // Carregamento silencioso: atualiza os dados sem dar "flash" de loading na tela
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        carregarUsuario(false)
      }
      
      // Se deslogar em outra aba, limpa o estado
      if (event === 'SIGNED_OUT') {
        setUsuario(null)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  async function carregarUsuario(exibirLoadingGlobal = false) {
    if (exibirLoadingGlobal) setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setUsuario(null)
        return
      }

      const { data } = await supabase
        .from("usuarios")
        .select("rg, email, nivel")
        .eq("user_id", user.id)
        .single()

      if (data) setUsuario(data)
    } catch (error) {
      console.error("Erro ao validar sessão:", error)
    } finally {
      // Desliga o loading global (apenas se ele tiver sido ativado no início)
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  function getCorNivel(nivel) {
    if (nivel === "admin") return "bg-purple-100 text-purple-700"
    if (nivel === "operador") return "bg-blue-100 text-blue-700"
    return "bg-slate-100 text-slate-600"
  }

  // O loading global agora só acontece no primeiro acesso
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Acessando REDEC 10 - Norte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex overflow-hidden">
      <MonitoramentoProvider>
        {/* Sidebar fixa */}
        <Sidebar />

        {/* Área principal */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-transparent">

          {/* HEADER - Backdrop blur para efeito moderno */}
          <header className="bg-white/70 backdrop-blur-md m-6 mb-4 p-6 rounded-2xl shadow-sm border border-white/50 flex items-center gap-6">
            <Image
              src="/REDEC_10_NORTE_LOGO.png"
              alt="Logo"
              width={50}
              height={50}
              priority
            />

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tighter">
                Sistema Integrado REDEC 10 - Norte
              </h1>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                Gestão Estratégica em Defesa Civil
              </p>
            </div>

            {/* USUÁRIO */}
            {usuario && (
              <div className="flex items-center gap-3 bg-white border px-3 py-2 rounded-xl shadow-sm">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                  👤
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Acesso</span>
                  <span className="text-sm font-bold text-slate-800">
                    {usuario.rg || usuario.email}
                  </span>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${getCorNivel(usuario?.nivel)}`}>
                  {usuario?.nivel}
                </span>
              </div>
            )}

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition shadow-md hover:shadow-red-200 active:scale-95"
            >
              Sair
            </button>
          </header>

          {/* CONTEÚDO PRINCIPAL - Onde o children é renderizado sem resetar */}
          <main className="flex-1 px-6 pb-10">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="p-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-t border-white/30 bg-white/30 backdrop-blur-sm">
            © 2026 | REDEC 10 - Norte | Defesa Civil Estadual do Rio de Janeiro
          </footer>
        </div>
      </MonitoramentoProvider>
    </div>
  )
}
