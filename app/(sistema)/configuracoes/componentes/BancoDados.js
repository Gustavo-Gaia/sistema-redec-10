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

      if (blob.size === 0) {
        alert("Nenhum dado encontrado para esse período")
        return
      }

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `backup_${periodo}.csv`
      a.click()

      // ✅ Marca que backup foi feito
      setBackupRealizado(true)

    } catch (err) {
      alert("Erro ao exportar dados")
    } finally {
      setExportando(false)
    }
  }

  // =========================
  // 🗑️ LIMPAR DADOS
  // =========================
  async function limparDados() {

    if (!backupRealizado) {
      alert("⚠️ Faça o backup antes de limpar os dados.")
      return
    }

    if (confirmacao !== "DELETAR") {
      alert("Digite DELETAR para confirmar.")
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
        alert(result.error || "Erro ao limpar dados")
        return
      }

      alert(`✅ ${result.deletados} registros removidos com sucesso`)

      // reset
      setConfirmacao("")
      setBackupRealizado(false)

      carregarDados()

    } catch (err) {
      alert("Erro ao limpar dados")
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

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            💾 Banco de Dados
          </h2>
          <p className="text-slate-500 text-sm">
            Gerenciamento de armazenamento
          </p>
        </div>

        <button
          onClick={carregarDados}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
        >
          🔄 Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ========================= */}
        {/* USO */}
        {/* ========================= */}
        <div className="bg-white p-6 rounded-2xl border">

          <h3 className="font-bold mb-4">📊 Uso</h3>

          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <div className="mb-3 flex justify-between text-sm">
                <span>Capacidade</span>
                <span>{percentualUso}%</span>
              </div>

              <div className="w-full bg-slate-200 h-4 rounded-full">
                <div
                  className={`${corBarra} h-4 rounded-full`}
                  style={{ width: `${percentualUso}%` }}
                />
              </div>

              <div className="mt-4 text-sm space-y-2">
                <p>Total: {dadosBanco.total_banco_mb} MB</p>
                <p>Medições: {dadosBanco.medicoes_mb} MB</p>
                <p>
                  Registros:{" "}
                  {dadosBanco.total_medicoes.toLocaleString("pt-BR")}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ========================= */}
        {/* MANUTENÇÃO */}
        {/* ========================= */}
        <div className="bg-white p-6 rounded-2xl border space-y-4">

          <h3 className="font-bold">🛡️ Manutenção</h3>

          {/* PERÍODO */}
          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(e.target.value)
              setBackupRealizado(false)
            }}
            className="w-full border rounded-lg p-2"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo período</option>
          </select>

          {/* EXPORTAR */}
          <button
            onClick={exportarBackup}
            disabled={exportando}
            className={`w-full py-3 rounded-lg font-semibold
              ${exportando
                ? "bg-slate-400 text-white"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
          >
            {exportando ? "Exportando..." : "📥 Exportar Backup"}
          </button>

          {/* CONFIRMAÇÃO */}
          <input
            type="text"
            placeholder='Digite "DELETAR" para confirmar'
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            className="w-full border rounded-lg p-2"
          />

          {/* LIMPAR */}
          <button
            onClick={limparDados}
            disabled={limpando}
            className={`w-full py-3 rounded-lg font-semibold
              ${limpando
                ? "bg-slate-400 text-white"
                : "bg-red-600 text-white hover:bg-red-700"
              }`}
          >
            {limpando ? "Limpando..." : "🗑️ Limpar Dados"}
          </button>

        </div>

      </div>

    </div>
  )
}
