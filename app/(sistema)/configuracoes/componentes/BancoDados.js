/* app/(sistema)/configuracoes/componentes/BancoDados.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function BancoDados() {

  const [dadosBanco, setDadosBanco] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [exportando, setExportando] = useState(false)
  const [periodo, setPeriodo] = useState("30")

  const LIMITE_MB = 500

  // =========================
  // 📊 CARREGAR DADOS
  // =========================
  async function carregarDados() {
    setLoading(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc("get_database_stats")

    if (rpcError) {
      console.error("Erro ao buscar dados:", rpcError)
      setError("Não foi possível carregar as estatísticas do banco.")
    } else {
      setDadosBanco(data[0])
    }

    setLoading(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // =========================
  // 📥 EXPORTAR BACKUP
  // =========================
  async function exportarBackup() {
    try {
      setExportando(true)

      const res = await fetch(`/api/exportar-medicoes?periodo=${periodo}`)

      if (!res.ok) {
        alert("Erro ao gerar backup")
        return
      }

      const blob = await res.blob()

      // ⚠️ proteção contra CSV vazio
      if (blob.size === 0) {
        alert("Nenhum dado encontrado para esse período")
        return
      }

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `backup_${periodo}.csv`
      a.click()

    } catch (err) {
      console.error(err)
      alert("Erro ao exportar dados")
    } finally {
      setExportando(false)
    }
  }

  // =========================
  // 📊 CÁLCULOS
  // =========================
  const percentualUso = dadosBanco
    ? ((dadosBanco.total_banco_mb / LIMITE_MB) * 100).toFixed(1)
    : 0

  const corBarra =
    percentualUso > 80
      ? "bg-red-500"
      : percentualUso > 50
      ? "bg-amber-500"
      : "bg-emerald-500"

  const statusTexto =
    percentualUso > 80
      ? "Crítico"
      : percentualUso > 50
      ? "Atenção"
      : "Saudável"

  return (
    <div className="space-y-6">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            💾 Banco de Dados
          </h2>
          <p className="text-slate-500 text-sm">
            Monitoramento e gerenciamento de armazenamento
          </p>
        </div>

        <button
          onClick={carregarDados}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* ========================= */}
      {/* GRID */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ========================= */}
        {/* 📊 USO DO BANCO */}
        {/* ========================= */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">

          <h3 className="text-lg font-bold mb-4">
            📊 Uso de Armazenamento
          </h3>

          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : error ? (
            <p className="text-red-500 font-semibold">{error}</p>
          ) : (
            <div className="space-y-5">

              {/* Barra */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Capacidade (500MB)</span>
                  <span className="font-bold">{percentualUso}%</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full ${corBarra} transition-all duration-700`}
                    style={{ width: `${percentualUso}%` }}
                  />
                </div>

                <p className="text-xs mt-2 text-slate-500">
                  Status: <strong>{statusTexto}</strong>
                </p>
              </div>

              {/* Dados */}
              <div className="grid grid-cols-2 gap-3 text-sm">

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs">Total Banco</p>
                  <p className="font-bold">
                    {dadosBanco.total_banco_mb} MB
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs">Medições</p>
                  <p className="font-bold">
                    {dadosBanco.medicoes_mb} MB
                  </p>
                </div>

                <div className="col-span-2 bg-slate-900 text-white p-3 rounded-lg">
                  <p className="text-xs text-slate-300">
                    Total de Registros
                  </p>
                  <p className="text-lg font-bold">
                    {dadosBanco.total_medicoes.toLocaleString("pt-BR")}
                  </p>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* ========================= */}
        {/* 🛡️ MANUTENÇÃO */}
        {/* ========================= */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between">

          <div>
            <h3 className="text-lg font-bold mb-4">
              🛡️ Manutenção
            </h3>

            {/* SELECT DE PERÍODO */}
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="all">Todo período</option>
            </select>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Exporte os dados antes de realizar qualquer limpeza.
            </p>
          </div>

          <div className="space-y-3">

            {/* EXPORTAR */}
            <button
              onClick={exportarBackup}
              disabled={exportando}
              className={`w-full py-3 rounded-lg font-semibold transition
                ${exportando
                  ? "bg-slate-400 text-white cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
            >
              {exportando ? "⏳ Exportando..." : "📥 Exportar Backup"}
            </button>

            {/* LIMPAR (próximo passo) */}
            <button
              className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-semibold transition"
            >
              🗑️ Limpar Dados Antigos
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}
