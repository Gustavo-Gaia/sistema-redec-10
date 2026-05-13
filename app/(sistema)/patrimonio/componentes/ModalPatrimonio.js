/* app/(sistema)/patrimonio/componentes/ModalPatrimonio.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Save, Trash2, Package, Calendar, MapPin, Info, Landmark } from "lucide-react"

export default function ModalPatrimonio({ bem, onClose, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [dados, setDados] = useState({
    nome_bem: "",
    num_patrimonial: "",
    data_entrada: "",
    data_saida: "",
    localizacao: "",
    condicao: "Armazenado",
    propriedade: ""
  })

  // Carrega os dados se for edição
  useEffect(() => {
    if (bem) setDados(bem)
  }, [bem])

  async function salvar() {
    // Validação básica antes de tentar enviar
    if (!dados.nome_bem || !dados.num_patrimonial || !dados.propriedade) {
      alert("Por favor, preencha os campos obrigatórios: Nome, Nº Patrimonial e Propriedade.");
      return;
    }
  
    try {
      setLoading(true);
  
      // Preparar o objeto para o banco (converter string vazia em null para datas)
      const payload = {
        nome_bem: dados.nome_bem,
        num_patrimonial: dados.num_patrimonial,
        propriedade: dados.propriedade,
        localizacao: dados.localizacao || null,
        condicao: dados.condicao,
        data_entrada: dados.data_entrada || null, // Se estiver "", vira null
        data_saida: dados.data_saida || null,
      };
  
      if (bem?.id) {
        // UPDATE
        const { error } = await supabase
          .from("patrimonio")
          .update({ ...payload, atualizado_em: new Date() })
          .eq("id", bem.id);
        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from("patrimonio")
          .insert([payload]);
        
        // Se der erro de duplicidade, o código do erro no Postgres costuma ser '23505'
        if (error) {
          if (error.code === '23505') {
            alert("O Nº Patrimonial informado já está cadastrado.");
            return;
          }
          throw error;
        }
      }
  
      onSaved();
      onClose();
    } catch (error) {
      console.error("Erro detalhado do Supabase:", error);
      alert("Erro ao salvar: " + (error.message || "Verifique os dados informados."));
    } finally {
      setLoading(false);
    }
  }

  async function excluir() {
    if (!confirm("Tem certeza que deseja excluir este bem permanentemente?")) return
    
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
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER MODAL */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg text-slate-900">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {bem ? "Editar Bem" : "Novo Cadastro"}
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Patrimônio REDEC 10</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* NOME DO BEM */}
          <div className="relative group">
            <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-yellow-600 transition-colors">
              Nome do Bem / Descrição
            </span>
            <input 
              className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-yellow-500 transition-all bg-slate-50/30"
              value={dados.nome_bem}
              onChange={e => setDados({...dados, nome_bem: e.target.value})}
              placeholder="Ex: Rádio HT Motorola"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nº PATRIMONIAL */}
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-yellow-600 transition-colors">
                Nº Patrimonial (Tombo)
              </span>
              <input 
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-yellow-500 transition-all bg-slate-50/30"
                value={dados.num_patrimonial}
                onChange={e => setDados({...dados, num_patrimonial: e.target.value})}
              />
            </div>

            {/* PROPRIEDADE */}
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-yellow-600 transition-colors">
                Propriedade (Dono)
              </span>
              <Landmark className="absolute right-4 top-4 text-slate-300 w-5 h-5" />
              <input 
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-yellow-500 transition-all bg-slate-50/30"
                value={dados.propriedade}
                onChange={e => setDados({...dados, propriedade: e.target.value})}
                placeholder="Ex: SEDEC / CBMERJ"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LOCALIZAÇÃO */}
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-yellow-600 transition-colors">
                Localização Atual
              </span>
              <MapPin className="absolute right-4 top-4 text-slate-300 w-5 h-5" />
              <input 
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-yellow-500 transition-all bg-slate-50/30"
                value={dados.localizacao}
                onChange={e => setDados({...dados, localizacao: e.target.value})}
              />
            </div>

            {/* CONDIÇÃO (SELECT) */}
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-yellow-600 transition-colors">
                Condição do Bem
              </span>
              <select 
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-yellow-500 transition-all bg-slate-50/30 appearance-none"
                value={dados.condicao}
                onChange={e => setDados({...dados, condicao: e.target.value})}
              >
                <option value="Armazenado">📦 Armazenado</option>
                <option value="Em uso">🟢 Em uso</option>
                <option value="Inservível">🔴 Inservível</option>
              </select>
              <Info className="absolute right-4 top-4 text-slate-300 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* DATA ENTRADA */}
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Data de Entrada
              </span>
              <Calendar className="absolute right-4 top-4 text-slate-300 w-5 h-5 pointer-events-none" />
              <input 
                type="date"
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-yellow-500 transition-all bg-slate-50/30"
                value={dados.data_entrada || ""}
                onChange={e => setDados({...dados, data_entrada: e.target.value})}
              />
            </div>

            {/* DATA SAÍDA */}
            <div className="relative group">
              <span className="absolute left-4 -top-2.5 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-red-400">
                Data de Baixa (Saída)
              </span>
              <input 
                type="date"
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-red-500 transition-all bg-red-50/10"
                value={dados.data_saida || ""}
                onChange={e => setDados({...dados, data_saida: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* FOOTER AÇÕES */}
        <div className="bg-slate-50 p-6 flex justify-between gap-4">
          {bem && (
            <button 
              onClick={excluir}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 text-red-600 font-black text-xs uppercase hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={18} /> Excluir Item
            </button>
          )}
          
          <div className="flex gap-3 ml-auto">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-slate-500 font-black text-xs uppercase hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={salvar}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black text-xs uppercase rounded-xl hover:bg-yellow-500 transition-all shadow-lg disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Salvando..." : "Salvar Patrimônio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
