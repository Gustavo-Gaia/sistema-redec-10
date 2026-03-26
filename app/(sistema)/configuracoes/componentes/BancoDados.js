/* app/(sistema)/configuracoes/componentes/BancoDados.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function BancoDados() {

  const [dadosBanco, setDadosBanco] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [exportando, setExportando] = useState(false)
  const [limpando, setLimpando] = useState(false)

  const [periodo, setPeriodo] = useState("30")
  const [confirmacao, setConfirmacao] = useState("")
  const [backupRealizado, setBackupRealizado] = useState(false)

  const LIMITE_MB = 500

  // =========================
  // 📊 CARREGAR DADOS
  // =========================
  async function carregarDados() {
    setLoading(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc("get_database_stats")

    if (rpcError) {
      console.error(rpcError)
      setError("Erro ao carregar dados do banco")
    } else {
      setDadosBanco(data[0])
    }

    setLoading(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // =========================
  // 📥 EXPORTAR
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

      if (blob.size === 0) {
        alert("Nenhum dado encontrado")
        return
      }

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `backup_${periodo}.csv`
      a.click()

      setBackupRealizado(true)

    } catch (err) {
      alert("Erro ao exportar")
    } finally {
      setExportando(false)
    }
  }

  // =========================
  // 🗑️ LIMPAR
  // =========================
  async function limparDados() {

    if (!backupRealizado) {
      alert("Faça backup antes")
      return
    }

    if (confirmacao !== "DELETAR") {
      alert('Digite "DELETAR"')
      return
    }

    try {
      setLimpando(true)

      const res = await fetch("/api/limpar-medicoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ periodo })
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result.error)
        return
      }

      alert(`✅ ${result.removidos} removidos`)

      setConfirmacao("")
      setBackupRealizado(false)

      carregarDados()

    } catch {
      alert("Erro ao limpar")
    } finally {
      setLimpando(false)
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

  const status =
    percentualUso > 80
      ? "Crítico"
      : percentualUso > 50
      ? "Atenção"
      : "Saudável"

  const diasRetencao = dadosBanco?.data_mais_antiga
    ? Math.floor(
        (new Date() - new Date(dadosBanco.data_mais_antiga)) /
        (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            💾 Banco de Dados
          </h2>
          <p className="text-slate-500">
            Monitoramento e gerenciamento de armazenamento
          </p>
        </div>

        <button
          onClick={carregarDados}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold transition"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ========================= */}
        {/* 📊 CARD USO PROFISSIONAL */}
        {/* ========================= */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">

          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              {/* TOPO */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500 uppercase font-bold">
                    Uso de armazenamento
                  </p>

                  <p className="text-4xl font-black text-slate-800">
                    {percentualUso}%
                  </p>
                </div>

                <span className={`
                  px-3 py-1 text-xs rounded-full font-bold
                  ${percentualUso > 80 && "bg-red-100 text-red-600"}
                  ${percentualUso > 50 && percentualUso <= 80 && "bg-amber-100 text-amber-600"}
                  ${percentualUso <= 50 && "bg-emerald-100 text-emerald-600"}
                `}>
                  {status}
                </span>
              </div>

              {/* BARRA */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className={`${corBarra} h-3 rounded-full transition-all duration-1000`}
                  style={{ width: `${percentualUso}%` }}
                />
              </div>

              {/* INFO */}
              <div className="grid grid-cols-2 gap-4 text-sm">

                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-400 text-xs">Total Banco</p>
                  <p className="font-bold text-lg">
                    {dadosBanco.total_banco_mb} MB
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-400 text-xs">Medições</p>
                  <p className="font-bold text-lg">
                    {dadosBanco.medicoes_mb} MB
                  </p>
                </div>

                <div className="col-span-2 bg-slate-900 text-white p-4 rounded-xl">
                  <p className="text-xs text-slate-300">
                    Total de registros
                  </p>
                  <p className="text-xl font-bold">
                    {dadosBanco.total_medicoes.toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="col-span-2 bg-blue-50 p-4 rounded-xl">
                  <p className="text-xs text-blue-500">
                    Data mais antiga
                  </p>
                  <p className="font-semibold">
                    {dadosBanco.data_mais_antiga
                      ? new Date(dadosBanco.data_mais_antiga).toLocaleString("pt-BR")
                      : "—"}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Retenção: {diasRetencao} dias
                  </p>
                </div>

              </div>
            </>
          )}
        </div>

        {/* ========================= */}
        {/* 🛡️ MANUTENÇÃO */}
        {/* ========================= */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">

          <h3 className="font-bold text-lg">🛡️ Manutenção</h3>

          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(e.target.value)
              setBackupRealizado(false)
              setConfirmacao("")
            }}
            className="w-full border rounded-xl p-2"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo período</option>
          </select>

          <button
            onClick={exportarBackup}
            disabled={exportando}
            className={`w-full py-3 rounded-xl font-semibold transition
              ${exportando
                ? "bg-slate-400 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
          >
            {exportando ? "Exportando..." : "📥 Exportar Backup"}
          </button>

          <input
            type="text"
            placeholder='Digite "DELETAR"'
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            className="w-full border rounded-xl p-2"
          />

          <button
            onClick={limparDados}
            disabled={limpando || !backupRealizado}
            className={`w-full py-3 rounded-xl font-semibold transition
              ${limpando
                ? "bg-slate-400 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
              }`}
          >
            {limpando ? "Limpando..." : "🗑️ Limpar Dados"}
          </button>

        </div>

      </div>

    </div>
  )
}
