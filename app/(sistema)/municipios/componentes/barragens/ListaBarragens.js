/* app/(sistema)/municipios/componentes/barragens/ListaBarragens.js */

"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Plus, 
  Trash2, 
  Waves, 
  Edit3, 
  Loader2, 
  AlertTriangle, 
  Info 
} from "lucide-react"
import ModalBarragem from "./ModalBarragem"

export default function ListaBarragens({ municipioId, municipioNome }) {
  const [barragens, setBarragens] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [barragemSelecionada, setBarragemSelecionada] = useState(null)

  // Memoizando a função para evitar re-renderizações desnecessárias
  const carregarBarragens = useCallback(async () => {
    if (!municipioId) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("barragens")
        .select("*")
        .eq("municipio_id", municipioId)
        .order("nome", { ascending: true })

      if (error) throw error
      setBarragens(data || [])
    } catch (err) {
      console.error("Erro ao carregar barragens:", err.message)
    } finally {
      setLoading(false)
    }
  }, [municipioId])

  useEffect(() => {
    carregarBarragens()
  }, [carregarBarragens])

  function handleNovo() {
    setBarragemSelecionada(null)
    setModalOpen(true)
  }

  function handleEditar(b) {
    setBarragemSelecionada(b)
    setModalOpen(true)
  }

  async function handleExcluir(id) {
    if (!confirm("Deseja realmente remover esta barragem do sistema?")) return

    try {
      const { error } = await supabase
        .from("barragens")
        .delete()
        .eq("id", id)

      if (error) throw error
      carregarBarragens() // Atualiza a lista após deletar
    } catch (err) {
      alert("Erro ao excluir: " + err.message)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Header da Seção */}
      <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <Waves size={18} />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 leading-none">Segurança de</h3>
            <p className="text-sm font-black uppercase text-slate-700">Barragens</p>
          </div>
        </div>

        <button
          onClick={handleNovo}
          className="bg-slate-900 hover:bg-blue-600 text-white p-2 px-4 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} />
          Cadastrar Estrutura
        </button>
      </div>

      {/* Estado de Carregamento */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Consultando Banco...</span>
        </div>
      ) : barragens.length === 0 ? (
        /* Vazio */
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-3">
            <Info className="text-slate-300" size={24} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Nenhuma estrutura técnica cadastrada para este município.
          </p>
        </div>
      ) : (
        /* Lista de Cards */
        <div className="grid gap-3">
          {barragens.map((b) => (
            <div
              key={b.id}
              className="group relative bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div 
                className="flex-1 cursor-pointer" 
                onClick={() => handleEditar(b)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                    {b.codigo_snisb || "S/ CÓDIGO"}
                  </span>
                  <h4 className="text-xs font-black uppercase text-slate-700 group-hover:text-blue-600 transition-colors">
                    {b.nome}
                  </h4>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">CRI:</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase">{b.cri || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">DPA:</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase">{b.dpa || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Uso:</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase truncate max-w-[150px]">
                      {b.uso_principal || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditar(b)}
                  className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Editar"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleExcluir(b.id)}
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renderização Condicional do Modal */}
      {modalOpen && (
        <ModalBarragem
          barragem={barragemSelecionada}
          municipioId={municipioId}
          municipioNome={municipioNome}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            carregarBarragens()
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
