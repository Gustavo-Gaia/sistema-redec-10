/* app/(sistema)/municipios/componentes/eventos/ModalEvento.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Loader2, AlertTriangle, Info, MapPin } from "lucide-react"

// Alteração 1: Apenas as 3 atividades essenciais para a Rotina
const ATIVIDADES_ROTINA = [
  { id: "8730", label: "8730 - Preparação (reuniões, simulados, palestras)" },
  { id: "5518", label: "5518 - Assessoria técnica aos municípios" },
  { id: "7181", label: "7181 - Apoio na resposta a desastres" }
]

export default function ModalEvento({ evento, municipios = [], onClose, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("ROTINA")
  
  const [form, setForm] = useState({
    titulo: "",
    tipo_registro: "ROTINA",
    categoria: "MUNICIPIO", // Ajustado para garantir compatibilidade e evitar NOT NULL
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

  useEffect(() => {
    if (evento) {
      setForm({
        id: evento.id,
        titulo: evento.titulo || "",
        tipo_registro: evento.tipo_registro || "ROTINA",
        categoria: evento.categoria || "MUNICIPIO", // Mantém o histórico ou assume o padrão seguro
        tipo_atividade: evento.tipo_atividade || "",
        fora_area: evento.fora_area || false,
        data_inicio: evento.data_inicio || new Date().toISOString().split("T")[0],
        descricao: evento.descricao || "",
        status_anormalidade: evento.status_anormalidade || "SE",
        nivel_desastre: evento.nivel_desastre || "I",
        protocolo_s2id: evento.protocolo_s2id || "",
        cobrade: evento.cobrade || ""
      })
      setTab(evento.tipo_registro || "ROTINA")
      carregarVinculos(evento.id)
    }
  }, [evento])

  async function carregarVinculos(eventoId) {
    const { data } = await supabase
      .from("eventos_municipios")
      .select(`municipio_id, eventos_dados (*)`)
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

  function toggleMunicipio(id) {
    setMunicipiosSelecionados((prev) => {
      const novo = { ...prev }
      if (novo[id]) { delete novo[id] } 
      else {
        novo[id] = { dados: { desalojados: 0, desabrigados: 0, afetados: 0, mortos: 0, desaparecidos: 0 } }
      }
      return novo
    })
  }

  function updateDadoHumano(mId, campo, valor) {
    setMunicipiosSelecionados(prev => ({
      ...prev,
      [mId]: { ...prev[mId], dados: { ...prev[mId].dados, [campo]: Number(valor) } }
    }))
  }

  async function salvarEvento() {
    if (!form.titulo) return alert("Defina um título para o evento.")
    if (tab === "ROTINA" && !form.tipo_atividade) return alert("Selecione a atividade de rotina.")
    setLoading(true)
    
    try {
      const payload = {
        titulo: form.titulo.toUpperCase(),
        tipo_registro: tab,
        categoria: "MUNICIPIO", // Sempre "MUNICIPIO", blindando o banco contra erros de restrição        
        tipo_atividade: tab === "ROTINA" ? form.tipo_atividade : null,
        fora_area: form.fora_area,
        data_inicio: form.data_inicio,
        descricao: form.descricao?.toUpperCase(),
        status_anormalidade: tab === "ANORMALIDADE" ? form.status_anormalidade : null,
        nivel_desastre: tab === "ANORMALIDADE" ? form.nivel_desastre : null,
        protocolo_s2id: tab === "ANORMALIDADE" ? form.protocolo_s2id : null,
        cobrade: tab === "ANORMALIDADE" ? form.cobrade : null,
      }
  
      let eventoId = form.id
  
      if (eventoId) {
        const { error: upError } = await supabase
          .from("eventos")
          .update(payload)
          .eq("id", eventoId)
        if (upError) throw upError
      } else {
        const { data, error: insError } = await supabase
          .from("eventos")
          .insert([payload])
          .select()
          .single()
        if (insError) throw insError
        eventoId = data.id
      }
  
      // Sincronização de Vínculos
      await supabase.from("eventos_municipios").delete().eq("evento_id", eventoId)

      if (!form.fora_area) {
        const idsMunicipios = Object.keys(municipiosSelecionados);
      
        if (idsMunicipios.length > 0) {
          const listaVinculos = idsMunicipios.map(mId => ({
            evento_id: eventoId,
            municipio_id: mId
          }));
      
          const { data: vinculosCriados, error: vError } = await supabase
            .from("eventos_municipios")
            .insert(listaVinculos)
            .select();
      
          if (vError) throw vError;
      
          // Mantém o comportamento original e intocado para os Danos Humanos se for Anormalidade
          if (tab === "ANORMALIDADE" && vinculosCriados) {
            const listaDados = vinculosCriados.map(v => ({
              evento_municipio_id: v.id,
              ...municipiosSelecionados[v.municipio_id].dados
            }));
      
            if (listaDados.length > 0) {
              await supabase.from("eventos_dados").insert(listaDados);
            }
          }
        }
      }
      
      onSaved()
    } catch (err) {
      console.error("Erro completo:", err)
      alert("Erro ao salvar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-white animate-in zoom-in-95">
        
        {/* HEADER */}
        <div className="p-8 border-b bg-slate-50/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-black text-2xl text-slate-900 tracking-tighter uppercase">
                {evento ? "Editar Registro" : "Novo Registro"}
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">REDEC 10 - Norte Fluminense</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl">
            <button
              onClick={() => setTab("ROTINA")}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                tab === "ROTINA" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Info size={16} /> ROTINA
            </button>
            <button
              onClick={() => setTab("ANORMALIDADE")}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                tab === "ANORMALIDADE" ? "bg-red-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <AlertTriangle size={16} /> ANORMALIDADE
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto space-y-6 scrollbar-hide">
          
          <section className="space-y-4">
            <input
              placeholder="TÍTULO DO EVENTO"
              className="w-full bg-slate-100 border-none rounded-2xl p-5 font-black text-slate-800 focus:ring-2 ring-slate-900 outline-none transition-all uppercase"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />

            {/* Alteração 4: Remove o grid e a Origem do Registro, mantendo apenas a data centralizada */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Data de Início</label>
              <input
                type="date"
                className="w-full bg-slate-100 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-slate-900"
                value={form.data_inicio}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              />
            </div>

            {/* Alteração 5: Renderiza as opções simplificadas de atividade apenas na aba ROTINA */}
            {tab === "ROTINA" && (
              <select
                className="w-full bg-slate-100 border-none rounded-2xl p-4 font-bold outline-none animate-in fade-in focus:ring-2 ring-slate-900"
                value={form.tipo_atividade}
                onChange={(e) => setForm({ ...form, tipo_atividade: e.target.value })}
              >
                <option value="">Selecione a atividade...</option>
                {ATIVIDADES_ROTINA.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            )}
          </section>

          {/* ANORMALIDADE: Mantido 100% Intocado e Original */}
          {tab === "ANORMALIDADE" && (
            <section className="bg-red-50 p-6 rounded-[2rem] space-y-4 border border-red-100 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle size={18} />
                <span className="text-xs font-black uppercase tracking-widest text-red-700">Status S2ID</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="bg-white border-none rounded-xl p-4 text-sm font-bold outline-none"
                  value={form.status_anormalidade}
                  onChange={(e) => setForm({ ...form, status_anormalidade: e.target.value })}
                >
                  <option value="SE">Situação de Emergência</option>
                  <option value="ECP">Calamidade Pública</option>
                </select>
                <select
                  className="bg-white border-none rounded-xl p-4 text-sm font-bold outline-none"
                  value={form.nivel_desastre}
                  onChange={(e) => setForm({ ...form, nivel_desastre: e.target.value })}
                >
                  <option value="I">Nível I</option>
                  <option value="II">Nível II</option>
                  <option value="III">Nível III</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Protocolo S2ID"
                  className="bg-white border-none rounded-xl p-4 text-sm font-bold outline-none"
                  value={form.protocolo_s2id}
                  onChange={(e) => setForm({ ...form, protocolo_s2id: e.target.value })}
                />
                <input
                  placeholder="COBRADE"
                  className="bg-white border-none rounded-xl p-4 text-sm font-bold outline-none uppercase"
                  value={form.cobrade}
                  onChange={(e) => setForm({ ...form, cobrade: e.target.value.toUpperCase() })}
                />
              </div>
            </section>
          )}

          {/* LISTA DE LOCALIDADES: Vincula municípios e exibe os danos se for anormalidade */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase font-black text-[10px] tracking-widest">
                <MapPin size={14} /> Localidades da REDEC 10 Vinculadas
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  checked={form.fora_area}
                  onChange={(e) => setForm({ ...form, fora_area: e.target.checked })}
                />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Fora da Área</span>
              </label>
            </div>

            {!form.fora_area && (
              <div className="grid gap-3 animate-in fade-in">
                {municipios?.length > 0 ? (
                  municipios.map((m) => {
                    const selec = municipiosSelecionados[m.id]
                    return (
                      <div key={m.id} className={`transition-all rounded-2xl border-2 ${selec ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                        <div className="p-4 flex items-center justify-between">
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900"
                              checked={!!selec}
                              onChange={() => toggleMunicipio(m.id)}
                            />
                            <span className={`font-black text-sm uppercase ${selec ? 'text-slate-900' : 'text-slate-500 opacity-60'}`}>{m.nome}</span>
                          </label>
                        </div>
                        {/* Caixa de Danos Humanos: Aparece exclusivamente se o município for selecionado E a aba for ANORMALIDADE */}
                        {selec && tab === "ANORMALIDADE" && (
                          <div className="px-4 pb-4 grid grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-1">
                            {Object.keys(selec.dados).map((campo) => (
                              <div key={campo} className="space-y-1 text-center">
                                <span className="text-[8px] font-black text-slate-400 uppercase block truncate">{campo}</span>
                                <input
                                  type="number"
                                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-center outline-none focus:ring-1 ring-red-500"
                                  value={selec.dados[campo]}
                                  onChange={(e) => updateDadoHumano(m.id, campo, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-xs font-bold text-slate-400 py-4 italic uppercase">Carregando municípios da base...</p>
                )}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <textarea
              placeholder="DESCRIÇÃO DETALHADA E OBSERVAÇÕES..."
              rows={4}
              className="w-full bg-slate-100 border-none rounded-3xl p-6 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 ring-slate-900 outline-none transition-all resize-none uppercase"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </section>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t bg-slate-50/80 backdrop-blur-md">
          <button
            onClick={salvarEvento}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[2rem] font-black text-sm flex justify-center items-center gap-3 shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /> Salvar no Sistema</>}
          </button>
        </div>
      </div>
    </div>
  )
}
