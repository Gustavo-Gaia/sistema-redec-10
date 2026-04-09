/* app/(sistema)/boletins/componentes/ModalCadastro.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"

export default function ModalCadastro({ isOpen, onClose, item, abaAtiva, onSuccess, orgaoPadrao }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoria: abaAtiva,
    tipo_orgao: abaAtiva === "boletins" ? (orgaoPadrao || "SEDEC") : null,
    numero: "",
    data_registro: "",
    assunto: "",
    destino_remetente: "",
    prazo: "",
    acompanhamento_especial: false,
  })

  // Sincroniza dados ao abrir ou mudar de aba
  useEffect(() => {
    if (item) {
      // Se for boletim, removemos o "Bol-" para o usuário editar apenas o número no input
      if (abaAtiva === "boletins" && item.numero?.startsWith("Bol-")) {
        setFormData({ ...item, numero: item.numero.replace("Bol-", "") })
      } else {
        setFormData(item)
      }
    } else {
      prepararSugestaoData()
    }
  }, [item, abaAtiva, orgaoPadrao])

  async function prepararSugestaoData() {
    const hoje = new Date().toISOString().split("T")[0]
    if (abaAtiva === "boletins") {
      const orgaoReferencia = orgaoPadrao || "SEDEC"
      const { data } = await supabase
        .from("controle_leitura_boletins")
        .select("visto_ate")
        .eq("tipo_orgao", orgaoReferencia)
        .single()

      let dataSugerida = hoje
      if (data?.visto_ate) {
        const d = new Date(data.visto_ate)
        d.setDate(d.getDate() + 1)
        dataSugerida = d.toISOString().split("T")[0]
      }

      setFormData(prev => ({ 
        ...prev, 
        tipo_orgao: orgaoReferencia,
        data_registro: dataSugerida,
        numero: "" 
      }))
    } else {
      setFormData(prev => ({ 
        ...prev, 
        data_registro: hoje,
        destino_remetente: "",
        numero: ""
      }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    // Formata o número final (Ex: Bol-012)
    const numeroFinal = abaAtiva === "boletins" 
      ? `Bol-${formData.numero.toString().padStart(3, '0')}`
      : formData.numero

    try {
      // 1. Salva no Banco de Documentos
      const { data: docSalvo, error: errorDoc } = await supabase
        .from("documentos_administrativos")
        .upsert({
          ...formData,
          numero: numeroFinal,
          tipo_orgao: abaAtiva === "boletins" ? formData.tipo_orgao : null,
          destino_remetente: abaAtiva === "sei" ? formData.destino_remetente : null,
          prazo: formData.prazo || null,
        })
        .select()
        .single()

      if (errorDoc) throw errorDoc

      // 2. Integração com Agenda (Se houver prazo)
      if (formData.prazo) {
        // Título formatado: PRAZO: Bol-061-SEDEC ou PRAZO: SEI 123456
        const tituloAgenda = abaAtiva === "boletins"
          ? `PRAZO: ${numeroFinal}-${formData.tipo_orgao}`
          : `PRAZO: SEI ${numeroFinal}`

        const payloadAgenda = {
          titulo: tituloAgenda,
          descricao: `Assunto: ${formData.assunto}\nRef: ${numeroFinal}`,
          data_inicio: `${formData.prazo} 17:00:00`,
          data_fim: `${formData.prazo} 18:00:00`,
          cor: "#78350f", // Marrom padrão para boletins
          tipo: "Administrativo"
        }

        await supabase.from("agenda_eventos").insert([payloadAgenda])
      }

      toast.success(item ? "Atualizado!" : "Cadastrado com sucesso!")
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar dados")
    } finally {
      setLoading(false)
    }
  }

  async function handleExcluir() {
    if (!confirm("Deseja realmente excluir este registro?")) return
    setLoading(true)
    try {
      const { error } = await supabase.from("documentos_administrativos").delete().eq("id", item.id)
      if (error) throw error
      toast.success("Excluído!")
      onSuccess()
      onClose()
    } catch (error) { toast.error("Erro ao excluir") }
    finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {item ? "Editar Registro" : `Novo ${abaAtiva === "sei" ? "Processo SEI" : "Boletim"}`}
            </h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Módulo Administrativo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {abaAtiva === "boletins" && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Órgão Emissor</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={formData.tipo_orgao || "SEDEC"}
                  onChange={e => setFormData({...formData, tipo_orgao: e.target.value})}
                >
                  <option value="SEDEC">SEDEC</option>
                  <option value="DGDEC">DGDEC</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">
                Nº do {abaAtiva === "sei" ? "SEI" : "Boletim"}
              </label>
              
              {abaAtiva === "boletins" ? (
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-slate-400 select-none">Bol-</span>
                  <input 
                    type="number"
                    required
                    placeholder="000"
                    className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.numero}
                    onChange={e => setFormData({...formData, numero: e.target.value})}
                  />
                </div>
              ) : (
                <input 
                  required
                  placeholder="000000/0000/0000"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.numero}
                  onChange={e => setFormData({...formData, numero: e.target.value})}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Data de Registro</label>
              <input 
                type="date" required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.data_registro}
                onChange={e => setFormData({...formData, data_registro: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 text-amber-600">Prazo Final</label>
              <input 
                type="date"
                className="w-full p-3 bg-amber-50/50 border border-amber-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500"
                value={formData.prazo || ""}
                onChange={e => setFormData({...formData, prazo: e.target.value})}
              />
            </div>

            {abaAtiva === "sei" && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Destino / Remetente</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.destino_remetente || ""}
                  onChange={e => setFormData({...formData, destino_remetente: e.target.value})}
                />
              </div>
            )}

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Assunto / Notas</label>
              <textarea 
                required rows={4}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={formData.assunto}
                onChange={e => setFormData({...formData, assunto: e.target.value})}
              />
            </div>
          </div>

          <div 
            onClick={() => setFormData({...formData, acompanhamento_especial: !formData.acompanhamento_especial})}
            className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-amber-50/50 border border-amber-100 w-fit mt-6"
          >
            <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.acompanhamento_especial ? 'bg-amber-400' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.acompanhamento_especial ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm font-bold text-amber-700">Acompanhamento Especial</span>
          </div>
        </form>

        {/* FOOTER */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex items-center justify-between shrink-0">
          {item && (
            <button type="button" onClick={handleExcluir} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-bold transition-colors">
              <Trash2 size={18} /> Excluir
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
            <button 
              disabled={loading} 
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Save size={20} /> {loading ? "Salvando..." : "Salvar Registro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
