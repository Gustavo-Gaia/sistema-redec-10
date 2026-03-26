/* app/(sistema)/configuracoes/page.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Configuracoes() {
  const [dadosBanco, setDadosBanco] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Limite gratuito do Supabase é 500MB
  const LIMITE_MB = 500 

  async function carregarDados() {
    setLoading(true)
    setError(null)
    
    // Chamada para a função RPC que criamos no SQL Editor
    const { data, error: rpcError } = await supabase.rpc("get_database_stats")

    if (rpcError) {
      console.error("Erro ao buscar dados:", rpcError)
      setError("Não foi possível carregar as estatísticas do banco.")
    } else {
      // O rpc retorna um array, pegamos a primeira posição
      setDadosBanco(data[0])
    }
    setLoading(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // Cálculo da porcentagem de uso
  const percentualUso = dadosBanco ? ((dadosBanco.total_banco_mb / LIMITE_MB) * 100).toFixed(1) : 0
  
  // Cor da barra baseada no uso
  const corBarra = percentualUso > 80 ? "bg-red-500" : percentualUso > 50 ? "bg-amber-500" : "bg-emerald-500"

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
            ⚙️ Configurações do Sistema
          </h1>
          <p className="text-slate-500 font-medium">Gerenciamento de armazenamento e manutenção de dados</p>
        </div>
        <button 
          onClick={carregarDados}
          className="p-2 hover:bg-slate-100 rounded-full transition-all"
          title="Atualizar dados"
        >
          🔄
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* === CARD 1: SAÚDE DO BANCO === */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-2xl">📊</div>
            <h2 className="text-xl font-bold text-slate-800">Uso de Armazenamento</h2>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-8 bg-slate-100 rounded-full w-full"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 font-bold">{error}</p>
          ) : (
            <div className="space-y-6">
              {/* Barra de Progresso */}
              <div>
                <div className="flex justify-between mb-2 items-end">
                  <span className="text-sm font-black text-slate-500 uppercase">Capacidade (500MB)</span>
                  <span className={`text-lg font-black ${percentualUso > 80 ? 'text-red-600' : 'text-slate-800'}`}>
                    {percentualUso}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-1000 ${corBarra}`} 
                    style={{ width: `${percentualUso}%` }}
                  ></div>
                </div>
              </div>

              {/* Detalhes Técnicos */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] uppercase font-black text-slate-400">Total Banco</p>
                  <p className="text-lg font-bold text-slate-700">{dadosBanco.total_banco_mb} MB</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] uppercase font-black text-slate-400">Só Medições</p>
                  <p className="text-lg font-bold text-slate-700">{dadosBanco.medicoes_mb} MB</p>
                </div>
                <div className="col-span-2 p-3 bg-slate-900 rounded-2xl">
                  <p className="text-[10px] uppercase font-black text-slate-300">Total de Linhas no Banco</p>
                  <p className="text-xl font-black text-white">{dadosBanco.total_medicoes.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === CARD 2: ZONA DE MANUTENÇÃO (BACKUP E LIMPEZA) === */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50 rounded-2xl text-2xl">🛡️</div>
              <h2 className="text-xl font-bold text-slate-800">Manutenção</h2>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Para manter o sistema rápido e dentro do limite gratuito, 
              é recomendável exportar e limpar dados com mais de <strong>90 dias</strong>.
            </p>
          </div>

          <div className="space-y-3">
            {/* Botão de Exportar - Próximo passo */}
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 uppercase text-sm">
              📥 Exportar Backup (Excel)
            </button>
            
            {/* Botão de Limpeza - Próximo passo */}
            <button className="w-full bg-white hover:bg-red-50 text-red-600 border-2 border-red-100 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase text-sm">
              🗑️ Limpar Dados Antigos
            </button>
          </div>
        </div>

      </div>

      <footer className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest pt-10">
        Sistema de Monitoramento Redec 10 - Gerenciador de Armazenamento v1.0
      </footer>
    </div>
  )
}
