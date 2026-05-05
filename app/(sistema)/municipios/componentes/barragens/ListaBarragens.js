/* app/(sistema)/municipios/componentes/barragens/ListaBarragens.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash2 } from "lucide-react"
import ModalBarragem from "./ModalBarragem"

export default function ListaBarragens({ municipioId }) {

  const [barragens, setBarragens] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [barragemSelecionada, setBarragemSelecionada] = useState(null)

  async function carregar() {
    setLoading(true)

    const { data } = await supabase
      .from("barragens")
      .select("*")
      .eq("municipio_id", municipioId)
      .order("nome")

    setBarragens(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (municipioId) carregar()
  }, [municipioId])

  function novo() {
    setBarragemSelecionada(null)
    setModalOpen(true)
  }

  function editar(b) {
    setBarragemSelecionada(b)
    setModalOpen(true)
  }

  async function excluir(b) {
    if (!confirm("Excluir barragem?")) return

    await supabase.from("barragens").delete().eq("id", b.id)
    carregar()
  }

  return (
    <div className="space-y-4">

      <div className="flex justify-end">
        <button
          onClick={novo}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg flex gap-2 text-xs font-bold"
        >
          <Plus size={14} />
          Nova Barragem
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 text-center">Carregando...</p>
      ) : barragens.length === 0 ? (
        <p className="text-xs text-slate-400 text-center">
          Nenhuma barragem cadastrada
        </p>
      ) : (
        barragens.map(b => (
          <div
            key={b.id}
            className="border rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between">
              <div onClick={() => editar(b)} className="cursor-pointer">
                <h3 className="font-bold text-xs uppercase">
                  {b.nome}
                </h3>

                <p className="text-[10px] text-slate-500">
                  SNISB: {b.codigo_snisb || "-"}
                </p>

                <p className="text-[10px] text-slate-500">
                  {b.uso_principal}
                </p>
              </div>

              <button onClick={() => excluir(b)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}

      {modalOpen && (
        <ModalBarragem
          barragem={barragemSelecionada}
          municipioId={municipioId}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            carregar()
            setModalOpen(false)
          }}
        />
      )}

    </div>
  )
}
