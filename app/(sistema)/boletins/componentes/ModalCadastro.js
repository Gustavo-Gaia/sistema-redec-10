/* app/(sistema)/boletins/componentes/ModalCadastro.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Trash2, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"

export default function ModalCadastro({ isOpen, onClose, item, abaAtiva, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoria: abaAtiva,
    tipo_orgao: abaAtiva === "boletins" ? "SEDEC" : null,
    numero: "",
    data_registro: "",
    assunto: "",
    destino_remetente: "",
    prazo: "",
    acompanhamento_especial: false,
  })

  // 1. Lógica de Sugestão e Edição
  useEffect(() => {
    if (item) {
      setFormData(item)
    } else {
      // Se for novo boletim, tentar sugerir a próxima data baseada no "Visto até"
      prepararSugestaoData()
    }
  }, [item, abaAtiva])

  async function prepararSugestaoData() {
    if (abaAtiva === "boletins") {
      const { data } = await supabase
        .from("controle_leitura_boletins")
        .select("visto_ate")
        .eq("tipo_orgao", "SEDEC") // Sugestão baseada no principal
        .single()

      if (data?.visto_ate) {
        const d = new Date(data.visto_ate)
        d.setDate(d.getDate() + 1)
        setFormData(prev => ({ ...prev, data_registro: d.toISOString().split("T")[0] }))
      }
    } else {
      setFormData(prev => ({ ...prev, data_registro: new Date().toISOString().split("T")[0] }))
    }
  }

  // 2. Salvar / Atualizar
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("documentos_administrativos")
        .upsert({
          ...formData,
          // Garante que campos irrelevantes fiquem nulos
          tipo_orgao: abaAtiva === "boletins" ? formData.tipo_orgao : null,
          destino_remetente: abaAtiva === "sei" ? formData.destino_remetente : null,
          prazo: formData.prazo || null,
        })

      if (error) throw error
      toast.success(item ? "Atualizado!" : "Cadastrado com sucesso!")
      onSuccess()
      onClose()
    } catch (error) {
      toast.error("Erro ao salvar dados")
    } finally {
      setLoading(false)
    }
  }

  // 3. Excluir
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header do Modal */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {item ? "Editar Registro" : `Novo ${abaAtiva === "sei" ? "Processo SEI" : "Boletim"}`}
            </h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Módulo Administrativo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Campo Tipo (Só Boletim) */}
            {abaAtiva === "boletins" && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Órgão Emissor</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.tipo_orgao}
                  onChange={e => setFormData({...formData, tipo_orgao: e.target.value})}
                >
                  <option value="SEDEC">SEDEC</option>
                  <option value="DGDEC">DGDEC</option>
                </select>
              </div>
            )}

            {/* Número */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Nº do {abaAtiva === "sei" ? "SEI" : "Boletim"}</label>
              <input 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.numero}
                onChange={e => setFormData({...formData, numero: e.target.value})}
              />
            </div>

            {/* Data Registro */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Data</label>
              <input 
                type="date" required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.data_registro}
                onChange={e => setFormData({...formData, data_registro: e.target.value})}
              />
            </div>

            {/* Prazo (Opcional) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Prazo Final (Opcional)</label>
              <input 
                type="date"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.prazo || ""}
                onChange={e => setFormData({...formData, prazo: e.target.value})}
              />
            </div>

            {/* Destino (Só SEI) */}
            {abaAtiva === "sei" && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Destino / Remetente</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.destino_remetente}
                  onChange={e => setFormData({...formData, destino_remetente: e.target.value})}
                />
              </div>
            )}

            {/* Assunto */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Assunto / Notas Importantes</label>
              <textarea 
                required rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={formData.assunto}
                onChange={e => setFormData({...formData, assunto: e.target.value})}
              />
            </div>
          </div>

          {/* Toggle Estrela */}
          <div 
            onClick={() => setFormData({...formData, acompanhamento_especial: !formData.acompanhamento_especial})}
            className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-amber-50/50 border border-amber-100 w-fit"
          >
            <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.acompanhamento_especial ? 'bg-amber-400' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.acompanhamento_especial ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm font-bold text-amber-700">Acompanhamento Especial</span>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-between pt-4">
            {item && (
              <button type="button" onClick={handleExcluir} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-bold transition-colors">
                <Trash2 size={18} /> Excluir
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
              <button disabled={loading} type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={20} /> {loading ? "Salvando..." : "Salvar Registro"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
