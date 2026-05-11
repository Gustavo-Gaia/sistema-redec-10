/* app/(sistema)/municipios/componentes/eventos/ModalEvento.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Loader2, AlertTriangle, Info, MapPin, ClipboardText, Users } from "lucide-react"

// =============================
// CONSTANTES DE OPÇÕES
// =============================
const ATIVIDADES_MUNICIPIO = [
  { id: "8730", label: "8730 - Preparação (reuniões, simulados, palestras)" },
  { id: "5518", label: "5518 - Assessoria técnica aos municípios" },
  { id: "7181", label: "7181 - Apoio na resposta a desastres" },
  { id: "APOIO_HUMANITARIO", label: "Apoio Humanitário" },
  { id: "VISITA_TECNICA", label: "Visita Técnica" }
]

const ATIVIDADES_REDEC = [
  { id: "ANALISE_TECNICA", label: "Análise técnica" },
  { id: "CAPACITACAO", label: "Capacitação externa" },
  { id: "COLABORACAO", label: "Colaboração técnica" },
  { id: "EVENTO", label: "Participação em evento" },
  { id: "REUNIAO_INTERNA", label: "Reunião de Trabalho Interna" }
]

export default function ModalEvento({ evento, municipios, onClose, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("ROTINA")
  
  const [form, setForm] = useState({
    titulo: "",
    tipo_registro: "ROTINA",
    categoria: "MUNICIPIO",
    tipo_atividade: "",
    fora_area: false,
    data_inicio: new Date().toISOString().split("T")[0],
    descricao: "",
    status_anormalidade: "SE",
    nivel_desastre: "I",
    protocolo_s2id: "",
    cobrade: ""
  })

  const [municipiosSelecionados, setMunicipiosSelecionados] = useState({})

  // Carregar dados iniciais
  useEffect(() => {
    if (evento) {
      setForm({ ...evento })
      setTab(evento.tipo_registro || "ROTINA")
      carregarVinculos(evento.id)
    }
  }, [evento])

  async function carregarVinculos(eventoId) {
    const { data, error } = await supabase
      .from("eventos_municipios")
      .select(`
        municipio_id,
        eventos_dados (
          desalojados, desabrigados, afetados, mortos, desaparecidos
        )
      `)
      .eq("evento_id", eventoId)

    if (data) {
      const mapa = {}
      data.forEach((item) => {
        mapa[item.municipio_id] = {
          dados: item.eventos_dados?.[0] || {
            desalojados: 0, desabrigados: 0, afetados: 0, mortos: 0, desaparecidos: 0
          }
        }
      })
      setMunicipiosSelecionados(mapa)
    }
  }

  // Handlers de Seleção de Municípios
  function toggleMunicipio(id) {
    setMunicipiosSelecionados((prev) => {
      const novo = { ...prev }
      if (novo[id]) {
        delete novo[id]
      } else {
        novo[id] = {
          dados: { desalojados: 0, desabrigados: 0, afetados: 0, mortos: 0, desaparecidos: 0 }
        }
      }
      return novo
    })
  }

  function updateDadoHumano(mId, campo, valor) {
    setMunicipiosSelecionados((prev) => ({
      ...prev,
      [mId]: {
        ...prev[mId],
        dados: { ...prev[mId].dados, [campo]: Number(valor) }
      }
    }))
  }

  async function salvarEvento() {
    if (!form.titulo) return alert("O título é obrigatório.")
    setLoading(true)

    try {
      const payload = { ...form, tipo_registro: tab }
      let eventoId = evento?.id

      // 1. Salvar ou Atualizar Evento Principal
      if (eventoId) {
        await supabase.from("eventos").update(payload).eq("id", eventoId)
      } else {
        const { data, error } = await supabase.from("eventos").insert([payload]).select().single()
        if (error) throw error
        eventoId = data.id
      }

      // 2. Limpar vínculos antigos (para garantir integridade)
      await supabase.from("eventos_municipios").delete().eq("evento_id", eventoId)

      // 3. Salvar Novos Vínculos e Dados Humanos
      if (form.categoria === "MUNICIPIO" && !form.fora_area) {
        for (const mId of Object.keys(municipiosSelecionados)) {
          const { data: vinculo, error: vError } = await supabase
            .from("eventos_municipios")
            .insert({ evento_id: eventoId, municipio_id: mId })
            .select().single()

          if (!vError && tab === "ANORMALIDADE") {
            await supabase.from("eventos_dados").insert({
              evento_municipio_id: vinculo.id,
              ...municipiosSelecionados[mId].dados
            })
          }
        }
      }

      onSaved()
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-center items-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* HEADER */}
        <div className="p-8 border-b bg-slate-50/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-black text-2xl text-slate-900 tracking-tighter">
                {evento ? "EDITAR REGISTRO" : "NOVO REGISTRO"}
              </h2>
              <p className="text-slate-500 text-sm font-medium">Preencha os dados da atividade ou desastre</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          {/* TABS PROFISSIONAIS */}
          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl">
            <button
              onClick={() => setTab("ROTINA")}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                tab === "ROTINA" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Info size={16} /> ATIVIDADE DE ROTINA
            </button>

            <button
              onClick={() => setTab("ANORMALIDADE")}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                tab === "ANORMALIDADE" ? "bg-red-600 text-white shadow-lg shadow-red-200" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <AlertTriangle size={16} /> ANORMALIDADE / DESASTRE
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto space-y-8 scrollbar-thin">
          
          {/* SEÇÃO 1: DADOS BÁSICOS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <ClipboardText size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Informações Principais</span>
            </div>
            
            <input
              placeholder="Título descritivo do evento..."
              className="w-full bg-slate-100 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Data de Início</label>
                <input
                  type="date"
                  className="w-full bg-slate-100 border-none rounded-2xl p-4 font-bold outline-none"
                  value={form.data_inicio}
                  onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                />
              </div>

              {tab === "ROTINA" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Origem da Atividade</label>
                  <select
                    className="w-full bg-slate-100 border-none rounded-2xl p-4 font-bold outline-none appearance-none"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value, tipo_atividade: "" })}
                  >
                    <option value="MUNICIPIO">Ações em Municípios</option>
                    <option value="REDEC">Ações Internas REDEC</option>
                  </select>
                </div>
              )}
            </div>

            {tab === "ROTINA" && (
              <select
                className="w-full bg-slate-100 border-none rounded-2xl p-4 font-bold outline-none"
                value={form.tipo_atividade}
                onChange={(e) => setForm({ ...form, tipo_atividade: e.target.value })}
              >
                <option value="">Selecione o tipo de atividade...</option>
                {(form.categoria === "MUNICIPIO" ? ATIVIDADES_MUNICIPIO : ATIVIDADES_REDEC).map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            )}
          </section>

          {/* SEÇÃO 2: DETALHES DA ANORMALIDADE */}
          {tab === "ANORMALIDADE" && (
            <section className="bg-red-50 p-6 rounded-[2rem] space-y-4 border border-red-100">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Dados do Desastre (S2ID)</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  className="bg-white border-none rounded-xl p-3 text-sm font-bold outline-none"
                  value={form.status_anormalidade}
                  onChange={(e) => setForm({ ...form, status_anormalidade: e.target.value })}
                >
                  <option value="SE">Situação de Emergência</option>
                  <option value="ECP">Calamidade Pública</option>
                </select>

                <select
                  className="bg-white border-none rounded-xl p-3 text-sm font-bold outline-none"
                  value={form.nivel_desastre}
                  onChange={(e) => setForm({ ...form, nivel_desastre: e.target.value })}
                >
                  <option value="I">Nível I (Pequeno)</option>
                  <option value="II">Nível II (Médio)</option>
                  <option value="III">Nível III (Grande)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Protocolo S2ID"
                  className="bg-white border-none rounded-xl p-3 text-sm font-bold outline-none"
                  value={form.protocolo_s2id}
                  onChange={(e) => setForm({ ...form, protocolo_s2id: e.target.value })}
                />
                <input
                  placeholder="COBRADE"
                  className="bg-white border-none rounded-xl p-3 text-sm font-bold outline-none"
                  value={form.cobrade}
                  onChange={(e) => setForm({ ...form, cobrade: e.target.value })}
                />
              </div>
            </section>
          )}

          {/* SEÇÃO 3: MUNICÍPIOS AFETADOS */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Localização / Abrangência</span>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  checked={form.fora_area}
                  onChange={(e) => setForm({ ...form, fora_area: e.target.checked })}
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Fora da área da REDEC</span>
              </label>
            </div>

            {!form.fora_area && form.categoria === "MUNICIPIO" && (
              <div className="grid gap-3">
                {municipios.map((m) => {
                  const selec = municipiosSelecionados[m.id]
                  return (
                    <div key={m.id} className={`transition-all rounded-2xl border-2 ${selec ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}>
                      <div className="p-4 flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900"
                            checked={!!selec}
                            onChange={() => toggleMunicipio(m.id)}
                          />
                          <span className={`font-black text-sm ${selec ? 'text-slate-900' : 'text-slate-500'}`}>{m.nome}</span>
                        </label>
                        {selec && tab === "ANORMALIDADE" && <Users size={16} className="text-red-500" />}
                      </div>

                      {selec && tab === "ANORMALIDADE" && (
                        <div className="px-4 pb-4 grid grid-cols-5 gap-2">
                          {Object.keys(selec.dados).map((campo) => (
                            <div key={campo} className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase truncate block px-1">{campo}</span>
                              <input
                                type="number"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-red-500 outline-none"
                                value={selec.dados[campo]}
                                onChange={(e) => updateDadoHumano(m.id, campo, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* DESCRIÇÃO FINAL */}
          <section className="space-y-2">
             <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Info size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Relatório / Observações</span>
              </div>
            <textarea
              placeholder="Descreva detalhadamente as ações realizadas ou o cenário encontrado..."
              rows={4}
              className="w-full bg-slate-100 border-none rounded-2xl p-4 font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </section>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t bg-slate-50/80 backdrop-blur-md">
          <button
            onClick={salvarEvento}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black text-sm flex justify-center items-center gap-3 shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} /> 
                CONFIRMAR E SALVAR REGISTRO
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
