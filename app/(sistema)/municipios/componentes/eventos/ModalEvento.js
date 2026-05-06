/* app/(sistema)/municipios/componentes/eventos/ModalEvento.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Loader2, AlertTriangle, Info } from "lucide-react"

// =============================
// CONSTANTES
// =============================
const atividadesMunicipio = [
  { id: "8730", label: "8730 - Preparação (reuniões, simulados, palestras)" },
  { id: "5518", label: "5518 - Assessoria técnica aos municípios" },
  { id: "7181", label: "7181 - Apoio na resposta a desastres" },
  { id: "APOIO_HUMANITARIO", label: "Apoio Humanitário" },
  { id: "VISITA_TECNICA", label: "Visita Técnica" }
]

const atividadesREDEC = [
  { id: "ANALISE_TECNICA", label: "Análise técnica" },
  { id: "CAPACITACAO", label: "Capacitação externa" },
  { id: "COLABORACAO", label: "Colaboração técnica" },
  { id: "EVENTO", label: "Participação em evento" },
  { id: "REUNIAO_INTERNA", label: "Reunião de Trabalho Interna" }
]

export default function ModalEvento({ evento, municipios, onClose, onSaved }) {

  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState(evento?.tipo_registro || "ROTINA")

  const [form, setForm] = useState({
    titulo: "",
    tipo_registro: "ROTINA",

    categoria: "MUNICIPIO",
    tipo_atividade: "",
    fora_area: false,

    data_inicio: new Date().toISOString().split("T")[0],
    descricao: "",

    // ANORMALIDADE
    intencao_decretar: false,
    status_anormalidade: "SE",
    nivel_desastre: "I",
    protocolo_s2id: "",
    cobrade: ""
  })

  const [municipiosSelecionados, setMunicipiosSelecionados] = useState({})

  // =============================
  // CARREGAR
  // =============================
  useEffect(() => {
    if (evento) {
      setForm(evento)
      setTab(evento.tipo_registro || "ROTINA")
      carregarMunicipiosEvento(evento.id)
    }
  }, [evento])

  async function carregarMunicipiosEvento(eventoId) {
    const { data } = await supabase
      .from("eventos_municipios")
      .select(`*, eventos_dados (*)`)
      .eq("evento_id", eventoId)

    const mapa = {}

    data?.forEach((item) => {
      mapa[item.municipio_id] = {
        dados: item.eventos_dados?.[0] || {
          desalojados: 0,
          desabrigados: 0,
          afetados: 0,
          mortos: 0,
          desaparecidos: 0
        }
      }
    })

    setMunicipiosSelecionados(mapa)
  }

  // =============================
  // MUNICÍPIOS
  // =============================
  function toggleMunicipio(id) {
    setMunicipiosSelecionados((prev) => {
      const novo = { ...prev }

      if (novo[id]) {
        delete novo[id]
      } else {
        novo[id] = {
          dados: {
            desalojados: 0,
            desabrigados: 0,
            afetados: 0,
            mortos: 0,
            desaparecidos: 0
          }
        }
      }

      return novo
    })
  }

  function updateDado(mId, campo, valor) {
    setMunicipiosSelecionados((prev) => ({
      ...prev,
      [mId]: {
        ...prev[mId],
        dados: {
          ...prev[mId].dados,
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
      const payload = {
        ...form,
        tipo_registro: tab
      }

      let eventoId = evento?.id

      if (eventoId) {
        await supabase.from("eventos").update(payload).eq("id", eventoId)
      } else {
        const { data } = await supabase
          .from("eventos")
          .insert([payload])
          .select()
          .single()

        eventoId = data.id
      }

      // limpar vínculos
      await supabase
        .from("eventos_municipios")
        .delete()
        .eq("evento_id", eventoId)

      // recriar (SÓ se for MUNICÍPIO e não fora_area)
      if (form.categoria === "MUNICIPIO" && !form.fora_area) {
        for (const municipioId in municipiosSelecionados) {
          const { data: vinculo } = await supabase
            .from("eventos_municipios")
            .insert({
              evento_id: eventoId,
              municipio_id: municipioId
            })
            .select()
            .single()

          // dados humanos só para ANORMALIDADE
          if (tab === "ANORMALIDADE") {
            await supabase.from("eventos_dados").insert({
              evento_municipio_id: vinculo.id,
              ...municipiosSelecionados[municipioId].dados
            })
          }
        }
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
    <div className="fixed inset-0 z-[70] flex justify-center items-center p-4">

      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* HEADER */}
        <div className="p-6 border-b bg-slate-50">
          <div className="flex justify-between mb-4">
            <h2 className="font-black text-lg">
              {evento ? "Editar Evento" : "Novo Evento"}
            </h2>
            <button onClick={onClose}><X /></button>
          </div>

          {/* TABS */}
          <div className="flex bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setTab("ROTINA")}
              className={`flex-1 p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${
                tab === "ROTINA" ? "bg-white shadow" : "text-slate-500"
              }`}
            >
              <Info size={14} /> ROTINA
            </button>

            <button
              onClick={() => setTab("ANORMALIDADE")}
              className={`flex-1 p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${
                tab === "ANORMALIDADE"
                  ? "bg-red-600 text-white"
                  : "text-slate-500"
              }`}
            >
              <AlertTriangle size={14} /> ANORMALIDADE
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">

          {/* ROTINA */}
          {tab === "ROTINA" && (
            <>
              <input
                placeholder="Título"
                className="input"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />

              <select
                className="input"
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value, tipo_atividade: "" })
                }
              >
                <option value="MUNICIPIO">Município</option>
                <option value="REDEC">REDEC</option>
              </select>

              <select
                className="input"
                value={form.tipo_atividade}
                onChange={(e) =>
                  setForm({ ...form, tipo_atividade: e.target.value })
                }
              >
                <option value="">Selecione</option>
                {(form.categoria === "MUNICIPIO"
                  ? atividadesMunicipio
                  : atividadesREDEC
                ).map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </>
          )}

          {/* ANORMALIDADE */}
          {tab === "ANORMALIDADE" && (
            <div className="bg-red-50 p-4 rounded-xl space-y-3">
              <input
                placeholder="Título do evento"
                className="input"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />

              <select
                className="input"
                value={form.status_anormalidade}
                onChange={(e) =>
                  setForm({ ...form, status_anormalidade: e.target.value })
                }
              >
                <option value="SE">Situação de Emergência</option>
                <option value="ECP">Calamidade Pública</option>
              </select>

              <select
                className="input"
                value={form.nivel_desastre}
                onChange={(e) =>
                  setForm({ ...form, nivel_desastre: e.target.value })
                }
              >
                <option value="I">Nível I</option>
                <option value="II">Nível II</option>
                <option value="III">Nível III</option>
              </select>

              <input
                placeholder="Protocolo S2ID"
                className="input"
                value={form.protocolo_s2id}
                onChange={(e) =>
                  setForm({ ...form, protocolo_s2id: e.target.value })
                }
              />

              <input
                placeholder="COBRADE"
                className="input"
                value={form.cobrade}
                onChange={(e) =>
                  setForm({ ...form, cobrade: e.target.value })
                }
              />
            </div>
          )}

          {/* COMUM */}
          <input
            type="date"
            className="input"
            value={form.data_inicio}
            onChange={(e) =>
              setForm({ ...form, data_inicio: e.target.value })
            }
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.fora_area}
              onChange={(e) =>
                setForm({ ...form, fora_area: e.target.checked })
              }
            />
            Fora da área da REDEC
          </label>

          {/* MUNICÍPIOS */}
          {!form.fora_area && form.categoria === "MUNICIPIO" && (
            <div className="space-y-2">
              {municipios.map((m) => {
                const ativo = municipiosSelecionados[m.id]

                return (
                  <div key={m.id} className="border p-3 rounded-xl">
                    <label className="flex gap-2 font-bold text-sm">
                      <input
                        type="checkbox"
                        checked={!!ativo}
                        onChange={() => toggleMunicipio(m.id)}
                      />
                      {m.nome}
                    </label>

                    {ativo && tab === "ANORMALIDADE" && (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {["desalojados","desabrigados","afetados","mortos","desaparecidos"].map(c => (
                          <input
                            key={c}
                            type="number"
                            placeholder={c}
                            className="input text-xs"
                            value={ativo.dados[c]}
                            onChange={(e) =>
                              updateDado(m.id, c, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <textarea
            placeholder="Descrição"
            className="input"
            value={form.descricao}
            onChange={(e) =>
              setForm({ ...form, descricao: e.target.value })
            }
          />

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <button
            onClick={salvarEvento}
            disabled={loading}
            className="w-full bg-slate-900 text-white p-4 rounded-xl flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            Salvar
          </button>
        </div>

      </div>
    </div>
  )
}
