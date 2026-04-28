/* app/(sistema)/viaturas/page.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Wrench, Car, FileWarning } from "lucide-react"
import ModalViatura from "./componentes/ModalViatura"

export default function ViaturasPage() {
  const [viaturas, setViaturas] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)

  const [aba, setAba] = useState("viaturas")

  const [toast, setToast] = useState(null)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function buscarViaturas() {
    setLoading(true)

    const { data, error } = await supabase
      .from("viaturas")
      .select("*")
      .order("prefixo")

    if (error) {
      console.error("Erro ao buscar viaturas:", error)
      showToast("Erro ao buscar viaturas", "error")
    } else {
      setViaturas(data || [])
    }

    setLoading(false)
  }

  async function salvarViatura(form) {
    try {
      if (editando) {
        const { error } = await supabase
          .from("viaturas")
          .update(form)
          .eq("id", editando.id)

        if (error) throw error
        showToast("Viatura atualizada")
      } else {
        const { error } = await supabase
          .from("viaturas")
          .insert([form])

        if (error) throw error
        showToast("Viatura cadastrada")
      }

      await buscarViaturas()
      setModalOpen(false)
      setEditando(null)

    } catch (err) {
      console.error("Erro ao salvar:", err)
      showToast("Erro ao salvar viatura", "error")
    }
  }

  async function deletarViatura(id) {
    if (!confirm("Deseja excluir esta viatura?")) return

    try {
      const { error } = await supabase
        .from("viaturas")
        .delete()
        .eq("id", id)

      if (error) throw error

      showToast("Viatura excluída")
      await buscarViaturas()

    } catch (err) {
      console.error(err)
      showToast("Erro ao excluir", "error")
    }
  }

  useEffect(() => {
    buscarViaturas()
  }, [])

  return (
    <div className="p-6 space-y-6">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white z-50 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">Gestão de Viaturas</h1>
        <p className="text-sm opacity-80">
          Cadastro, manutenção e controle da frota
        </p>
      </div>

      {/* ABAS */}
      <div className="flex gap-2">

        <button
          onClick={() => setAba("viaturas")}
          className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${
            aba === "viaturas"
              ? "bg-slate-700 text-white"
              : "bg-white border text-slate-600"
          }`}
        >
          <Car size={16} />
          Viaturas
        </button>

        <button
          onClick={() => setAba("manutencoes")}
          className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${
            aba === "manutencoes"
              ? "bg-slate-700 text-white"
              : "bg-white border text-slate-600"
          }`}
        >
          <Wrench size={16} />
          Manutenções
        </button>

        <button
          onClick={() => setAba("multas")}
          className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${
            aba === "multas"
              ? "bg-slate-700 text-white"
              : "bg-white border text-slate-600"
          }`}
        >
          <FileWarning size={16} />
          Multas
        </button>

      </div>

      {/* CONTEÚDO DAS ABAS */}
      {aba === "viaturas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {loading && <p className="text-slate-500">Carregando...</p>}

          {!loading && viaturas.length === 0 && (
            <p className="text-slate-500">Nenhuma viatura cadastrada.</p>
          )}

          {viaturas.map((v) => (
            <div
              key={v.id}
              onClick={() => {
                setEditando(v)
                setModalOpen(true)
              }}
              className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg transition cursor-pointer relative group"
            >

              {/* EXCLUIR */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deletarViatura(v.id)
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-red-500 hover:bg-red-50 p-1 rounded"
              >
                ✕
              </button>

              <h2 className="text-lg font-bold text-slate-800">
                {v.prefixo}
              </h2>

              <p className="text-sm text-slate-500">
                {v.marca} {v.modelo}
              </p>

              <div className="mt-3 text-sm">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  v.situacao === "OPERANTE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {v.situacao}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Placa: {v.placa || "-"}
              </p>

            </div>
          ))}
        </div>
      )}

      {aba === "manutencoes" && (
        <div className="bg-white rounded-2xl p-6 border text-slate-500">
          🚧 Em breve: controle de manutenções
        </div>
      )}

      {aba === "multas" && (
        <div className="bg-white rounded-2xl p-6 border text-slate-500">
          🚧 Em breve: controle de multas
        </div>
      )}

      {/* BOTÃO FLUTUANTE */}
      {aba === "viaturas" && (
        <button
          onClick={() => {
            setEditando(null)
            setModalOpen(true)
          }}
          className="fixed bottom-20 right-6 bg-slate-700 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg transition"
        >
          <Plus />
        </button>
      )}

      {/* MODAL */}
      {modalOpen && (
        <ModalViatura
          onClose={() => {
            setModalOpen(false)
            setEditando(null)
          }}
          onSave={salvarViatura}
          viatura={editando}
        />
      )}

    </div>
  )
}
