/* app/(sistema)/patrimonio/componentes/ModalPatrimonio.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Trash2, Package, Calendar, MapPin, Info, Landmark, FileText } from "lucide-react"

export default function ModalPatrimonio({ bem, onClose, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [dados, setDados] = useState({
    nome_bem: "",
    num_patrimonial: "",
    data_entrada: "",
    data_saida: "",
    localizacao: "",
    condicao: "Armazenado",
    propriedade: "",
    observacoes: "" // Novo campo
  })

  useEffect(() => {
    if (bem) setDados(bem)
  }, [bem])

  async function salvar() {
    // Validação de campos obrigatórios (Not Null no banco)
    if (!dados.nome_bem || !dados.num_patrimonial || !dados.propriedade) {
      alert("Campos obrigatórios: Nome, Nº Patrimonial e Propriedade.")
      return
    }

    try {
      setLoading(true)

      // Higienização dos dados antes de enviar
      const payload = {
        nome_bem: dados.nome_bem.trim(),
        num_patrimonial: dados.num_patrimonial.trim(),
        propriedade: dados.propriedade.trim(),
        localizacao: dados.localizacao?.trim() || null,
        condicao: dados.condicao,
        observacoes: dados.observacoes?.trim() || null,
        data_entrada: dados.data_entrada || null,
        data_saida: dados.data_saida || null,
      }

      if (bem?.id) {
        const { error } = await supabase
          .from("patrimonio")
          .update({ ...payload, atualizado_em: new Date() })
          .eq("id", bem.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("patrimonio")
          .insert([payload])
        
        if (error) {
          if (error.code === '23505') {
            alert("Erro: Este Nº Patrimonial já está em uso em outro bem.")
            return
          }
          throw error
        }
      }

      onSaved()
      onClose()
    } catch (error) {
      console.error("Erro Supabase:", error)
      alert("Falha ao salvar: " + (error.message || "Verifique a conexão."))
    } finally {
      setLoading(false)
    }
  }

  async function excluir() {
    if (!confirm("Excluir este patrimônio permanentemente?")) return
    try {
      setLoading(true)
      const { error } = await supabase.from("patrimonio").delete().eq("id", bem.id)
      if (error) throw error
      onSaved()
      onClose()
    } catch (error) {
      console.error("Erro ao excluir:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-900">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {bem ? "Editar Patrimônio" : "Novo Cadastro"}
              </h2>
              <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Carga Regional REDEC 10</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* FORMULÁRIO COM SCROLL SE NECESSÁRIO */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <div className="relative group">
            <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-amber-600 transition-colors">
              Nome do Bem / Descrição Detalhada
            </span>
            <input 
              className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 transition-all bg-slate-50/30"
              value={dados.nome_bem}
              onChange={e => setDados({...dados, nome_bem: e.target.value})}
              placeholder="Ex: Rádio HT Motorola"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-amber-600 transition-colors">
                Nº Patrimonial (Tombo)
              </span>
              <input 
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 transition-all bg-slate-50/30"
                value={dados.num_patrimonial}
                onChange={e => setDados({...dados, num_patrimonial: e.target.value})}
              />
            </div>

            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-amber-600 transition-colors">
                Propriedade (Órgão)
              </span>
              <Landmark className="absolute right-4 top-4 text-slate-300 w-5 h-5" />
              <input 
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 transition-all bg-slate-50/30"
                value={dados.propriedade}
                onChange={e => setDados({...dados, propriedade: e.target.value})}
                placeholder="Ex: REDEC 10 / CBA IV"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-amber-600 transition-colors">
                Localização Atual
              </span>
              <MapPin className="absolute right-4 top-4 text-slate-300 w-5 h-5" />
              <input 
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 transition-all bg-slate-50/30"
                value={dados.localizacao}
                onChange={e => setDados({...dados, localizacao: e.target.value})}
              />
            </div>

            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-amber-600 transition-colors">
                Status / Condição
              </span>
              <select 
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 transition-all bg-slate-50/30 appearance-none cursor-pointer"
                value={dados.condicao}
                onChange={e => setDados({...dados, condicao: e.target.value})}
              >
                <option value="Em uso">🟢 Em uso</option>
                <option value="Armazenado">📦 Armazenado</option>
                <option value="Inservível">🔴 Inservível</option>
                <option value="Acautelado">🛡️ Acautelado</option>
                <option value="Baixa Definitiva">✖️ Baixa Definitiva</option>
              </select>
              <Info className="absolute right-4 top-4 text-slate-300 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Data de Entrada
              </span>
              <Calendar className="absolute right-4 top-4 text-slate-300 w-5 h-5 pointer-events-none" />
              <input 
                type="date"
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 transition-all bg-slate-50/30"
                value={dados.data_entrada || ""}
                onChange={e => setDados({...dados, data_entrada: e.target.value})}
              />
            </div>

            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
                Data de Baixa (Se houver)
              </span>
              <input 
                type="date"
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-red-500 transition-all bg-red-50/10"
                value={dados.data_saida || ""}
                onChange={e => setDados({...dados, data_saida: e.target.value})}
              />
            </div>
          </div>

          {/* CAMPO DE INFORMAÇÕES / OBSERVAÇÕES */}
          <div className="relative group pt-2">
            <span className="absolute left-4 -top-0.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-amber-600 transition-colors">
              Informações Adicionais / Observações
            </span>
            <FileText className="absolute right-4 top-6 text-slate-300 w-5 h-5" />
            <textarea 
              rows={3}
              className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 transition-all bg-slate-50/30 resize-none"
              value={dados.observacoes || ""}
              onChange={e => setDados({...dados, observacoes: e.target.value})}
              placeholder="Ex: Doação feita pela prefeitura, número de série XXXXX..."
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 p-6 flex justify-between gap-4 border-t border-slate-100">
          {bem && (
            <button 
              onClick={excluir}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 text-red-600 font-black text-[10px] uppercase hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={16} /> Excluir Registro
            </button>
          )}
          
          <div className="flex gap-3 ml-auto">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={salvar}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-amber-500 font-black text-[10px] uppercase rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-lg disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? "Processando..." : "Salvar Patrimônio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
