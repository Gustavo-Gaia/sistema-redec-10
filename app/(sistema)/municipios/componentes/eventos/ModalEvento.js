/* app/(sistema)/municipios/componentes/eventos/ModalEvento.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Loader2 } from "lucide-react"

export default function ModalEvento({
  evento,
  municipios,
  onClose,
  onSaved
}) {

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    titulo: "",
    tipo: "",
    cobrade: "",
    data_inicio: "",
    data_fim: "",
    decreto_numero: "",
    decreto_tipo: "",
    decreto_validade: "",
    descricao: ""
  })

  const [municipiosSelecionados, setMunicipiosSelecionados] = useState({})

  // =============================
  // CARREGAR EVENTO
  // =============================
  useEffect(() => {
    if (evento) {
      setForm(evento)
      carregarMunicipiosEvento(evento.id)
    }
  }, [evento])

  async function carregarMunicipiosEvento(eventoId) {
    const { data } = await supabase
      .from("eventos_municipios")
      .select(`
        *,
        eventos_dados (*)
      `)
      .eq("evento_id", eventoId)

    const mapa = {}

    data?.forEach((item) => {
      mapa[item.municipio_id] = {
        vinculoId: item.id,
        dados: item.eventos_dados?.[0] || {
          desalojados: 0,
          desabrigados: 0,
          afetados: 0,
          mortos: 0,
          abrigos_ativos: 0
        }
      }
    })

    setMunicipiosSelecionados(mapa)
  }

  // =============================
  // TOGGLE MUNICÍPIO
  // =============================
  function toggleMunicipio(id) {
    setMunicipiosSelecionados((prev) => {
      if (prev[id]) {
        const novo = { ...prev }
        delete novo[id]
        return novo
      }

      return {
        ...prev,
        [id]: {
          dados: {
            desalojados: 0,
            desabrigados: 0,
            afetados: 0,
            mortos: 0,
            abrigos_ativos: 0
          }
        }
      }
    })
  }

  function updateDado(municipioId, campo, valor) {
    setMunicipiosSelecionados((prev) => ({
      ...prev,
      [municipioId]: {
        ...prev[municipioId],
        dados: {
          ...prev[municipioId].dados,
          [campo]: Number(valor)
        }
      }
    }))
  }

  // =============================
  // SALVAR
  // =============================
  async function salvarEvento() {
    setLoading(true)

    try {
      // 1. salvar evento
      let eventoId = evento?.id

      if (eventoId) {
        await supabase.from("eventos").update(form).eq("id", eventoId)
      } else {
        const { data } = await supabase
          .from("eventos")
          .insert([form])
          .select()
          .single()

        eventoId = data.id
      }

      // 2. limpar vínculos antigos
      await supabase
        .from("eventos_municipios")
        .delete()
        .eq("evento_id", eventoId)

      // 3. recriar tudo
      for (const municipioId in municipiosSelecionados) {
        const { data: vinculo } = await supabase
          .from("eventos_municipios")
          .insert({
            evento_id: eventoId,
            municipio_id: municipioId
          })
          .select()
          .single()

        const dados = municipiosSelecionados[municipioId].dados

        await supabase
          .from("eventos_dados")
          .insert({
            evento_municipio_id: vinculo.id,
            ...dados
          })
      }

      onSaved()

    } catch (err) {
      alert("Erro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="fixed inset-0 z-[70] flex justify-center items-center">

      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">

        <div className="flex justify-between mb-4">
          <h2 className="font-black text-lg">
            {evento ? "Editar Evento" : "Novo Evento"}
          </h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* DADOS */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <input
            placeholder="Título"
            className="p-3 bg-slate-100 rounded-xl col-span-2"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />

          <input
            placeholder="Tipo (SE / ECP)"
            className="p-3 bg-slate-100 rounded-xl"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          />

          <input
            placeholder="COBRADE"
            className="p-3 bg-slate-100 rounded-xl"
            value={form.cobrade}
            onChange={(e) => setForm({ ...form, cobrade: e.target.value })}
          />

          <input
            type="date"
            className="p-3 bg-slate-100 rounded-xl"
            value={form.data_inicio || ""}
            onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
          />

          <input
            type="date"
            className="p-3 bg-slate-100 rounded-xl"
            value={form.data_fim || ""}
            onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
          />

        </div>

        {/* MUNICÍPIOS */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm">Municípios</h3>

          {municipios.map((m) => {
            const ativo = municipiosSelecionados[m.id]

            return (
              <div key={m.id} className="border rounded-xl p-4">

                <label className="flex items-center gap-2 font-bold text-sm">
                  <input
                    type="checkbox"
                    checked={!!ativo}
                    onChange={() => toggleMunicipio(m.id)}
                  />
                  {m.nome}
                </label>

                {ativo && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {["desalojados","desabrigados","afetados","mortos","abrigos_ativos"].map((campo) => (
                      <input
                        key={campo}
                        type="number"
                        placeholder={campo}
                        className="p-2 bg-slate-100 rounded-lg text-xs"
                        value={ativo.dados[campo]}
                        onChange={(e) =>
                          updateDado(m.id, campo, e.target.value)
                        }
                      />
                    ))}
                  </div>
                )}

              </div>
            )
          })}
        </div>

        {/* FOOTER */}
        <button
          onClick={salvarEvento}
          disabled={loading}
          className="mt-6 w-full bg-slate-900 text-white p-4 rounded-xl flex justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Salvar Evento
        </button>

      </div>
    </div>
  )
}
