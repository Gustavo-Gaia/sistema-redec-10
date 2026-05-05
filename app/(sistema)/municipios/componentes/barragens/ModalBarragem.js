/* app/(sistema)/municipios/componentes/barragens/ModalBarragem.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Loader2, Waves, AlertCircle } from "lucide-react"

export default function ModalBarragem({
  barragem,
  municipioId,
  municipioNome, // Recebido do componente pai
  onClose,
  onSaved
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    codigo_snisb: "",
    nome: "",
    empreendedor: "",
    uso_principal: "",
    ici: "",
    cri: "",
    dpa: "",
    classe_residuo: "",
    uf: "RJ"
  })

  // Sincroniza o formulário quando entra em modo de edição
  useEffect(() => {
    if (barragem) {
      setForm({
        codigo_snisb: barragem.codigo_snisb || "",
        nome: barragem.nome || "",
        empreendedor: barragem.empreendedor || "",
        uso_principal: barragem.uso_principal || "",
        ici: barragem.ici || "",
        cri: barragem.cri || "",
        dpa: barragem.dpa || "",
        classe_residuo: barragem.classe_residuo || "",
        uf: barragem.uf || "RJ"
      })
    }
  }, [barragem])

  async function salvar() {
    if (!form.nome) return alert("O nome da barragem é obrigatório")
    
    setLoading(true)
    setError(null)

    try {
      // Montagem do payload rigorosa com as colunas do seu banco
      const payload = {
        municipio_id: municipioId,
        municipio_nome: municipioNome, // Garante que o nome do município seja salvo
        codigo_snisb: form.codigo_snisb.trim(),
        nome: form.nome.toUpperCase().trim(),
        empreendedor: form.empreendedor.trim(),
        uso_principal: form.uso_principal.trim(),
        ici: form.ici.trim(),
        cri: form.cri.trim(),
        dpa: form.dpa.trim(),
        classe_residuo: form.classe_residuo.trim(),
        uf: form.uf
      }

      if (barragem?.id) {
        const { error: updateError } = await supabase
          .from("barragens")
          .update(payload)
          .eq("id", barragem.id)
        
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from("barragens")
          .insert([payload])
        
        if (insertError) throw insertError
      }

      // Pequeno delay para garantir que o Supabase processe antes do refresh da lista
      setTimeout(() => {
        onSaved()
        onClose()
      }, 500)

    } catch (err) {
      console.error("Erro Supabase:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div 
        className="relative bg-white w-full max-w-lg overflow-hidden rounded-[2rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Waves size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-black uppercase text-xs text-slate-400 leading-none">Gestão Técnica</h2>
              <p className="text-sm font-black uppercase text-slate-800">
                {barragem ? "Editar Barragem" : "Nova Barragem"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-8 grid grid-cols-2 gap-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
          
          {error && (
            <div className="col-span-2 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Código SNISB</label>
            <input 
              value={form.codigo_snisb}
              onChange={e => setForm({...form, codigo_snisb: e.target.value})}
              placeholder="Ex: 17432"
              className="w-full p-3 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">UF</label>
            <input 
              value={form.uf}
              disabled
              className="w-full p-3 bg-slate-100 rounded-2xl border-2 border-transparent text-slate-400 outline-none text-sm font-bold opacity-60 cursor-not-allowed"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome da Estrutura</label>
            <input 
              value={form.nome}
              onChange={e => setForm({...form, nome: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold uppercase"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Empreendedor / Responsável</label>
            <input 
              value={form.empreendedor}
              onChange={e => setForm({...form, empreendedor: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div className="col-span-2 text-slate-300 border-b pb-1 mt-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Classificação Técnica</span>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CRI (Risco)</label>
            <input 
              value={form.cri}
              onChange={e => setForm({...form, cri: e.target.value})}
              placeholder="Baixo/Médio/Alto"
              className="w-full p-3 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold uppercase"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">DPA (Dano)</label>
            <input 
              value={form.dpa}
              onChange={e => setForm({...form, dpa: e.target.value})}
              placeholder="Baixo/Médio/Alto"
              className="w-full p-3 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold uppercase"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ICI (Integridade)</label>
            <input 
              value={form.ici}
              onChange={e => setForm({...form, ici: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Classe Resíduo</label>
            <input 
              value={form.classe_residuo}
              onChange={e => setForm({...form, classe_residuo: e.target.value})}
              className="w-full p-3 bg-slate-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/80 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border-2 border-slate-200 text-slate-500 p-4 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          
          <button
            onClick={salvar}
            disabled={loading}
            className="flex-[2] bg-slate-900 hover:bg-blue-600 disabled:bg-slate-400 text-white p-4 rounded-2xl flex justify-center items-center gap-3 font-black uppercase text-[10px] transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? "Processando..." : "Confirmar e Salvar"}
          </button>
        </div>

      </div>
    </div>
  )
}
