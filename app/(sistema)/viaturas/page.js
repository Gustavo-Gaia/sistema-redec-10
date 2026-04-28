/* app/(sistema)/viaturas/page.js */

"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Wrench, Car, FileWarning, Eye, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"

import ModalViatura from "./componentes/ModalViatura"
import TimelineManutencoes from "./componentes/TimelineManutencoes"
import ModalManutencao from "./componentes/ModalManutencao"
import TimelineMultas from "./componentes/TimelineMultas"
import ModalMulta from "./componentes/ModalMulta"

export default function ViaturasPage() {

  // ---------------- STATES ----------------
  const [viaturas, setViaturas] = useState([])
  const [manutencoes, setManutencoes] = useState([])
  const [multas, setMultas] = useState([])

  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState("viaturas")

  const [modalViaturaOpen, setModalViaturaOpen] = useState(false)
  const [modalManutOpen, setModalManutOpen] = useState(false)
  const [modalMultaOpen, setModalMultaOpen] = useState(false)

  const [editandoViatura, setEditandoViatura] = useState(null)
  const [editandoManut, setEditandoManut] = useState(null)
  const [editandoMulta, setEditandoMulta] = useState(null)

  const [toast, setToast] = useState(null)
  const [filtroViatura, setFiltroViatura] = useState("")

  // ---------------- TOAST ----------------
  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ---------------- BUSCAS OTIMIZADAS ----------------
  // Agora disparando em paralelo para maior velocidade
  async function carregarTudo() {
    setLoading(true)
    try {
      const [vRes, mRes, mtRes] = await Promise.all([
        supabase.from("viaturas").select("*").order("prefixo"),
        supabase.from("viaturas_manutencoes").select(`*, viaturas ( prefixo )`).order("data", { ascending: false }),
        supabase.from("viaturas_multas").select(`*, viaturas ( prefixo )`).order("data_infracao", { ascending: false })
      ])

      if (vRes.error) throw vRes.error
      if (mRes.error) throw mRes.error
      if (mtRes.error) throw mtRes.error

      setViaturas(vRes.data || [])
      setManutencoes(mRes.data || [])
      setMultas(mtRes.data || [])
    } catch (error) {
      console.error(error)
      showToast("Erro ao carregar dados", "error")
    } finally {
      setLoading(false)
    }
  }

  // Funções de busca individuais (mantidas para atualização pós-save)
  async function buscarViaturas() {
    const { data, error } = await supabase.from("viaturas").select("*").order("prefixo")
    if (!error) setViaturas(data || [])
  }

  async function buscarManutencoes() {
    const { data, error } = await supabase.from("viaturas_manutencoes").select(`*, viaturas ( prefixo )`).order("data", { ascending: false })
    if (!error) setManutencoes(data || [])
  }

  async function buscarMultas() {
    const { data, error } = await supabase.from("viaturas_multas").select(`*, viaturas ( prefixo )`).order("data_infracao", { ascending: false })
    if (!error) setMultas(data || [])
  }

  // ---------------- VIATURA ----------------
  async function salvarViatura(form) {
    try {
      if (editandoViatura) {
        const { error } = await supabase.from("viaturas").update(form).eq("id", editandoViatura.id)
        if (error) throw error
        showToast("Viatura atualizada")
      } else {
        const { error } = await supabase.from("viaturas").insert([form])
        if (error) throw error
        showToast("Viatura cadastrada")
      }
      await buscarViaturas()
      setModalViaturaOpen(false)
      setEditandoViatura(null)
    } catch (err) {
      console.error(err)
      showToast("Erro ao salvar viatura", "error")
    }
  }

  async function deletarViatura(id) {
    if (!confirm("Deseja excluir esta viatura?")) return
    try {
      const { error } = await supabase.from("viaturas").delete().eq("id", id)
      if (error) throw error
      showToast("Viatura excluída")
      await carregarTudo()
    } catch (err) {
      console.error(err)
      showToast("Erro ao excluir", "error")
    }
  }

  // ---------------- MANUTENÇÃO ----------------
  async function salvarManutencao(form, id = null) {
    try {
      const payload = {
        viatura_id: form.viatura_id,
        numero_os: form.numero_os || null,
        data: form.data || null,
        execucao: form.execucao || null,
        odometro: form.odometro || null,
        defeito: form.defeito || null,
        observacao: form.observacao || null
      }

      if (id) {
        const { error } = await supabase.from("viaturas_manutencoes").update(payload).eq("id", id)
        if (error) throw error
        showToast("Manutenção atualizada")
      } else {
        const { error } = await supabase.from("viaturas_manutencoes").insert([payload])
        if (error) throw error
        showToast("Manutenção cadastrada")
      }
      await buscarManutencoes()
      setModalManutOpen(false)
      setEditandoManut(null)
    } catch (err) {
      console.error(err)
      showToast(err.message, "error")
    }
  }

  async function deletarManutencao(id) {
    if (!confirm("Excluir manutenção?")) return
    try {
      const { error } = await supabase.from("viaturas_manutencoes").delete().eq("id", id)
      if (error) throw error
      showToast("Excluído com sucesso")
      await buscarManutencoes()
    } catch (err) {
      console.error(err)
      showToast("Erro ao excluir", "error")
    }
  }

  // ---------------- MULTAS ----------------
  async function salvarMulta(form, id = null) {
    try {
      const payload = {
        viatura_id: form.viatura_id,
        data_infracao: form.data_infracao || null,
        hora: form.hora || null,
        local: form.local || null,
        valor: form.valor ? Number(form.valor) : null,
        orgao: form.orgao || null,
        status: form.status || "PENDENTE",
        numero_auto: form.numero_auto || null,
        observacao: form.observacao || null
      }

      if (id) {
        const { error } = await supabase.from("viaturas_multas").update(payload).eq("id", id)
        if (error) throw error
        showToast("Multa atualizada")
      } else {
        const { error } = await supabase.from("viaturas_multas").insert([payload])
        if (error) throw error
        showToast("Multa cadastrada")
      }
      await buscarMultas()
      setModalMultaOpen(false)
      setEditandoMulta(null)
    } catch (err) {
      console.error(err)
      showToast(err.message, "error")
    }
  }

  async function deletarMulta(id) {
    if (!confirm("Excluir multa?")) return
    try {
      const { error } = await supabase.from("viaturas_multas").delete().eq("id", id)
      if (error) throw error
      showToast("Multa excluída")
      await buscarMultas()
    } catch (err) {
      console.error(err)
      showToast("Erro ao excluir", "error")
    }
  }

  // ---------------- INIT ----------------
  useEffect(() => {
    carregarTudo()
  }, [])

  // ---------------- FILTROS (USEMEMO PARA PERFORMANCE) ----------------
  const manutencoesFiltradas = useMemo(() => {
    return filtroViatura ? manutencoes.filter(m => m.viatura_id === filtroViatura) : manutencoes
  }, [filtroViatura, manutencoes])

  const multasFiltradas = useMemo(() => {
    return filtroViatura ? multas.filter(m => m.viatura_id === filtroViatura) : multas
  }, [filtroViatura, multas])

  // Navegação contextual: Ver histórico direto do card
  const verHistoricoViatura = (id) => {
    setFiltroViatura(id)
    setAba("manutencoes")
  }

  // ---------------- UI ----------------
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-2xl text-white z-[100] shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === "error" ? "bg-red-500" : "bg-emerald-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER PROFISSIONAL */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight uppercase">Gestão de Frota</h1>
          <p className="text-slate-300 font-medium">Controle Logístico REDEC 10 - Norte</p>
        </div>
        <Car className="absolute -right-4 -bottom-4 text-white/10 w-48 h-48" />
      </div>

      {/* NAVEGAÇÃO POR ABAS ESTILIZADA */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { key: "viaturas", label: "Viaturas", icon: Car },
          { key: "manutencoes", label: "Manutenções", icon: Wrench },
          { key: "multas", label: "Multas", icon: FileWarning }
        ].map(tab => {
          const Icon = tab.icon
          const ativo = aba === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setAba(tab.key)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                ativo 
                  ? "bg-white text-slate-800 shadow-sm scale-105" 
                  : "text-slate-500 hover:bg-white/50"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* FILTROS E BUSCA */}
      {(aba === "manutencoes" || aba === "multas") && (
        <div className="bg-white p-4 rounded-3xl border shadow-sm flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400 uppercase ml-2">Filtrar por:</span>
            <select
              value={filtroViatura}
              onChange={(e) => setFiltroViatura(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-700 focus:ring-2 ring-slate-200 outline-none cursor-pointer"
            >
              <option value="">Todas as viaturas</option>
              {viaturas.map(v => (
                <option key={v.id} value={v.id}>{v.prefixo}</option>
              ))}
            </select>
            {filtroViatura && (
              <button 
                onClick={() => setFiltroViatura("")} 
                className="text-red-500 text-xs font-black hover:underline"
              >
                LIMPAR FILTRO
              </button>
            )}
          </div>
        </div>
      )}

      {/* ÁREA DE CONTEÚDO */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold animate-pulse">Sincronizando dados...</p>
          </div>
        ) : (
          <>
            {aba === "viaturas" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {viaturas.map(v => (
                  <div key={v.id} className="bg-white border rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div 
                      className="p-6 cursor-pointer" 
                      onClick={() => { setEditandoViatura(v); setModalViaturaOpen(true); }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${v.situacao === 'OPERANTE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          <Car size={24}/>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          v.situacao === 'OPERANTE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {v.situacao === 'OPERANTE' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                          {v.situacao || 'S/ STATUS'}
                        </div>
                      </div>
                      
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{v.prefixo}</h2>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{v.marca} {v.modelo}</p>
                      
                      <div className="mt-4 flex gap-2">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200">
                          {v.placa || "S/ PLACA"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
                      <button 
                        onClick={() => verHistoricoViatura(v.id)}
                        className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <Eye size={16}/> HISTÓRICO
                      </button>
                      <button 
                        onClick={() => deletarViatura(v.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aba === "manutencoes" && (
              <TimelineManutencoes
                manutencoes={manutencoesFiltradas}
                onDelete={deletarManutencao}
                onEdit={(m) => {
                  setEditandoManut(m)
                  setModalManutOpen(true)
                }}
              />
            )}

            {aba === "multas" && (
              <TimelineMultas
                multas={multasFiltradas}
                onDelete={deletarMulta}
                onEdit={(m) => {
                  setEditandoMulta(m)
                  setModalMultaOpen(true)
                }}
              />
            )}
          </>
        )}
      </div>

      {/* BOTÃO FLUTUANTE DE AÇÃO */}
      <button
        onClick={() => {
          if (aba === "viaturas") { setEditandoViatura(null); setModalViaturaOpen(true); }
          if (aba === "manutencoes") { setEditandoManut(null); setModalManutOpen(true); }
          if (aba === "multas") { setEditandoMulta(null); setModalMultaOpen(true); }
        }}
        className="fixed bottom-10 right-10 bg-slate-800 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* MODAIS (Lógica original preservada) */}
      {modalViaturaOpen && (
        <ModalViatura
          onClose={() => setModalViaturaOpen(false)}
          onSave={salvarViatura}
          viatura={editandoViatura}
        />
      )}

      {modalManutOpen && (
        <ModalManutencao
          onClose={() => setModalManutOpen(false)}
          onSave={salvarManutencao}
          manutencao={editandoManut}
          viaturas={viaturas}
        />
      )}

      {modalMultaOpen && (
        <ModalMulta
          onClose={() => setModalMultaOpen(false)}
          onSave={salvarMulta}
          multa={editandoMulta}
          viaturas={viaturas}
        />
      )}

    </div>
  )
}
