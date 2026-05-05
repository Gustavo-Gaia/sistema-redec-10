/* app/(sistema)/municipios/componentes/barragens/ModalBarragem.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Loader2, Waves } from "lucide-react"

export default function ModalBarragem({
  barragem,
  municipioId,
  onClose,
  onSaved
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    codigo_snisb: "",
    nome: "",
    empreendedor: "",
    uso_principal: "",
    ici: "",
    cri: "",
    dpa: "",
    classe_residuo: ""
  })

  useEffect(() => {
    if (barragem) setForm(barragem)
  }, [barragem])

  async function salvar() {
    if (!form.nome) return alert("O nome da barragem é obrigatório")
    setLoading(true)

    try {
      const payload = {
        ...form,
        municipio_id: municipioId,
        nome: form.nome.toUpperCase() // Padronização REDEC
      }

      if (barragem?.id) {
        await supabase
          .from("barragens")
          .update(payload)
          .eq("id", barragem.id)
      } else {
        await supabase.from("barragens").insert(payload)
      }

      onSaved()
      onClose() // Fecha após salvar
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Z-INDEX elevado para ficar acima do Drawer (z-60)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Backdrop com desfoque para evitar confusão visual */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Conteúdo do Modal - e.stopPropagation impede fechar ao clicar nos inputs */}
      <div 
        className="relative bg-white w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Waves size={18} className="text-blue-600" />
            <h2 className="font-black uppercase text-xs text-slate-700">
              {barragem ? "Editar Barragem" : "Cadastrar Nova Barragem"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form - Scrollable se necessário */}
        <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Código SNISB</label>
            <input 
              value={form.codigo_snisb}
              onChange={e => setForm({...form, codigo_snisb: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome da Barragem</label>
            <input 
              value={form.nome}
              onChange={e => setForm({...form, nome: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold uppercase"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Empreendedor</label>
            <input 
              value={form.empreendedor}
              onChange={e => setForm({...form, empreendedor: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Uso Principal</label>
            <input 
              value={form.uso_principal}
              onChange={e => setForm({...form, uso_principal: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ICI</label>
            <input 
              value={form.ici}
              onChange={e => setForm({...form, ici: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CRI</label>
            <input 
              value={form.cri}
              onChange={e => setForm({...form, cri: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">DPA</label>
            <input 
              value={form.dpa}
              onChange={e => setForm({...form, dpa: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Classe de Resíduo</label>
            <input 
              value={form.classe_residuo}
              onChange={e => setForm({...form, classe_residuo: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-xl border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

        </div>

        {/* Footer com botão */}
        <div className="p-6 bg-slate-50 border-t">
          <button
            onClick={salvar}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white p-4 rounded-2xl flex justify-center items-center gap-3 font-black uppercase text-xs transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Gravando..." : "Salvar Barragem"}
          </button>
        </div>

      </div>
    </div>
  )
}
