/* app/(sistema)/equipe/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { verificarSeAtivo } from "./componentes/utils"

// Componentes do Módulo
import Indicadores from "./componentes/Indicadores"
import BlocoComando from "./componentes/BlocoComando"
import ListaAdministrativo from "./componentes/ListaAdministrativo"
import DrawerMilitar from "./componentes/DrawerMilitar"
import TabelaEfetivo from "./componentes/TabelaEfetivo"
import MuralExCoordenadores from "./componentes/MuralExCoordenadores"

// Ícones e UI
import { Plus, RefreshCw, LayoutDashboard, Shield, History, ClipboardList, CalendarDays } from "lucide-react"

export default function EquipePage() {
  // ESTADOS PRINCIPAIS
  const [militares, setMilitares] = useState([])
  const [afastamentos, setAfastamentos] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  // NAVEGAÇÃO POR ABAS (prontidao | efetivo | mural | ferias)
  const [abaAtiva, setAbaAtiva] = useState("prontidao")

  // ESTADOS EXCLUSIVOS DO RELATÓRIO DE FÉRIAS (Filtro por Ano de Gozo das Férias)
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear())
  const [dataHoraGeracao, setDataHoraGeracao] = useState("")

  // ESTADOS DE INTERFACE
  const [militarSelecionado, setMilitarSelecionado] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function carregarDados() {
    try {
      setLoading(true)
      
      const { data: mData } = await supabase
        .from("equipe")
        .select("*")
        .order("ordem", { ascending: true })

      const { data: aData } = await supabase
        .from("equipe_afastamentos")
        .select("*")

      const { data: cData } = await supabase
        .from("equipe_config")
        .select("*")
        .single()

      setMilitares(mData || [])
      setAfastamentos(aData || [])
      setConfig(cData || null)

      const agora = new Date()
      setDataHoraGeracao(`${agora.toLocaleDateString("pt-BR")} às ${agora.toLocaleTimeString("pt-BR")}`)
    } catch (error) {
      console.error("Erro ao carregar equipe:", error)
      showToast("Erro ao carregar dados", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const militaresAtivos = militares.filter(m => verificarSeAtivo(m))

  // Auxiliares de Formatação para o Documento Oficial
  function formatarPeriodo(inicioStr, fimStr) {
    if (!inicioStr || !fimStr) return "-"
    const dIni = new Date(inicioStr + "T12:00:00").toLocaleDateString("pt-BR")
    const dFim = new Date(fimStr + "T12:00:00").toLocaleDateString("pt-BR")
    return `${dIni} a ${dFim}`
  }

  function obterQtdDias(inicioStr, fimStr) {
    if (!inicioStr || !fimStr) return "-"
    const d1 = new Date(inicioStr + "T12:00:00")
    const d2 = new Date(fimStr + "T12:00:00")
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : "-"
  }

  // =========================================================================
  // 🔥 LÓGICA CORRIGIDA: FILTRAR POR ANO DO CALENDÁRIO (GOZO DE FÉRIAS)
  // =========================================================================
  const dadosFeriasRelatorio = (() => {
    if (!anoFiltro) return []
    
    // Define as strings limites de comparação: 01/01 a 31/12 do ano selecionado
    const dataInicioLimite = `${anoFiltro}-01-01`
    const dataFimLimite = `${anoFiltro}-12-31`

    return afastamentos
      .filter(a => {
        return (
          a.tipo === "Férias" && 
          a.data_inicio >= dataInicioLimite && 
          a.data_inicio <= dataFimLimite
        )
      })
      .map(afast => {
        const mil = militares.find(m => m.id === afast.equipe_id)
        return {
          ...afast,
          nome_completo: mil?.nome_completo || "Militar Não Identificado",
          rg: mil?.rg || "-",
          posto_graduacao: mil?.posto_graduacao || "-"
        }
      })
      .sort((a, b) => (a.data_inicio > b.data_inicio ? 1 : -1))
  })()

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50 pb-24 print:bg-white print:p-0 print:pb-0">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`print:hidden fixed top-6 right-6 px-4 py-2 rounded-lg text-white font-medium shadow-2xl z-[100] transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="print:hidden bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Gestão de Efetivo</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase leading-none">REDEC 10 - Norte</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium italic">"Prontidão e Resiliência"</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={carregarDados}
              className={`p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="print:hidden flex flex-wrap gap-2 p-1.5 bg-slate-200/50 w-fit rounded-2xl border border-slate-200">
        {[
          { id: "prontidao", label: "Painel de Prontidão", icon: LayoutDashboard },
          { id: "efetivo", label: "Efetivo Geral", icon: ClipboardList },
          { id: "mural", label: "Galeria de Ex-Coordenadores", icon: History },
          { id: "ferias", label: "Relatório de Férias", icon: CalendarDays }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all ${
              abaAtiva === tab.id 
                ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" 
                : "text-slate-500 hover:bg-white/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="animate-in fade-in duration-500">
        
        {abaAtiva === "prontidao" && (
          <div className="space-y-6 print:hidden">
            <Indicadores militares={militaresAtivos} afastamentos={afastamentos} />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Comando Atual</h2>
                <BlocoComando 
                  config={config} 
                  militares={militaresAtivos} 
                  afastamentos={afastamentos}
                  onSelect={(m) => { setMilitarSelecionado(m); setDrawerOpen(true); }}
                />
              </div>
              <div className="lg:col-span-8 space-y-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Efetivo Administrativo</h2>
                <ListaAdministrativo 
                  militares={militaresAtivos} 
                  config={config} 
                  afastamentos={afastamentos}
                  onSelect={(m) => { setMilitarSelecionado(m); setDrawerOpen(true); }}
                />
              </div>
            </div>
          </div>
        )}

        {abaAtiva === "efetivo" && (
          <div className="print:hidden">
            <TabelaEfetivo 
              militares={militares} 
              onEdit={(m) => { setMilitarSelecionado(m); setDrawerOpen(true); }} 
            />
          </div>
        )}

        {abaAtiva === "mural" && (
          <div className="print:hidden">
            <MuralExCoordenadores />
          </div>
        )}

        {/* ABA: RELATÓRIO OFICIAL DE FÉRIAS */}
        {abaAtiva === "ferias" && (
          <div className="space-y-6 bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
            
            {/* CONTROLES VISÍVEIS APENAS NA TELA */}
            <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-2">
              <div className="flex items-center gap-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Mês/Ano de Gozo das Férias:</label>
                <input 
                  type="number" 
                  value={anoFiltro || ''} 
                  onChange={(e) => setAnoFiltro(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Ex: 2025"
                  className="border border-slate-300 px-3 py-1.5 rounded-xl text-sm w-32 font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition shadow-md active:scale-95"
              >
                🖨️ Imprimir Plano de Férias
              </button>
            </div>

            {/* DOCUMENTO OFICIAL FORMATADO PARA IMPRESSÃO */}
            <div className="w-full max-w-5xl mx-auto space-y-6 bg-white p-2">
              
              {/* CABEÇALHO COM LOGOTIPO TIMBRADO */}
              <div className="flex items-center gap-6 border-b-2 border-slate-950 pb-4 text-slate-950">
                <img 
                  src="/logotipo_redec_norte.png" 
                  alt="Logotipo REDEC Norte" 
                  className="w-16 h-16 object-contain"
                />
                <div className="text-left leading-tight font-sans">
                  <h2 className="text-xs font-black uppercase tracking-tight">Secretaria de Estado de Defesa Civil</h2>
                  <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-800">Diretoria Geral de Defesa Civil</h3>
                  <h4 className="text-[11px] font-bold uppercase tracking-tight text-slate-600">Coordenadoria Regional de Defesa Civil - REDEC 10 - Norte</h4>
                </div>
              </div>

              {/* TÍTULO */}
              <div className="text-center py-2">
                <h1 className="text-base font-black text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-2 w-fit mx-auto px-6">
                  Plano Geral de Férias Gozadas — Exercício de {anoFiltro || "---"}
                </h1>
              </div>

              {/* LISTAGEM ADMINISTRATIVA */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-950 text-left text-[11px] text-slate-900">
                  <thead>
                    <tr className="bg-slate-100 uppercase font-black text-slate-900 border-b border-slate-950">
                      <th className="border border-slate-950 px-3 py-2.5">Posto/Grad</th>
                      <th className="border border-slate-950 px-3 py-2.5">Nome Completo</th>
                      <th className="border border-slate-950 px-3 py-2.5 text-center">RG</th>
                      <th className="border border-slate-950 px-3 py-2.5 text-center">Ano Ref.</th>
                      <th className="border border-slate-950 px-3 py-2.5 text-center">Período de Gozo</th>
                      <th className="border border-slate-950 px-2 py-2.5 text-center">Dias</th>
                      <th className="border border-slate-950 px-3 py-2.5">Observações / Publicação</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {dadosFeriasRelatorio.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400 font-bold uppercase text-xs">
                          Nenhum registro de férias iniciado no ano de {anoFiltro || "especificado"}.
                        </td>
                      </tr>
                    ) : (
                      dadosFeriasRelatorio.map((item, idx) => (
                        <tr key={item.id || idx} className="border-b border-slate-950 font-sans hover:bg-slate-50/50">
                          <td className="border border-slate-950 px-3 py-2 uppercase font-bold text-slate-800 whitespace-nowrap">
                            {item.posto_graduacao}
                          </td>
                          <td className="border border-slate-950 px-3 py-2 uppercase font-black text-slate-950">
                            {item.nome_completo}
                          </td>
                          <td className="border border-slate-950 px-3 py-2 text-center font-mono">
                            {item.rg}
                          </td>
                          <td className="border border-slate-950 px-3 py-2 text-center font-bold bg-slate-50/50 text-slate-600">
                            {item.ano_referencia || "-"}
                          </td>
                          <td className="border border-slate-950 px-3 py-2 text-center font-bold whitespace-nowrap">
                            {formatarPeriodo(item.data_inicio, item.data_fim)}
                          </td>
                          <td className="border border-slate-950 px-2 py-2 text-center font-black">
                            {obterQtdDias(item.data_inicio, item.data_fim)}
                          </td>
                          <td className="border border-slate-950 px-3 py-2 uppercase text-[10px] leading-tight text-slate-700">
                            {item.observacao ? item.observacao : "Registro Interno Administrativo"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* RODAPÉ DO DOCUMENTO */}
              <div className="text-right pt-8 text-[9px] font-bold uppercase tracking-wider text-slate-400 italic">
                Sistema REDEC 10 • Relatório emitido em: {dataHoraGeracao}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* BOTÃO FLUTUANTE DE CADASTRO */}
      <button 
        onClick={() => { setMilitarSelecionado(null); setDrawerOpen(true); }}
        className="print:hidden fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-600 hover:scale-110 active:scale-90 transition-all z-50 group border-4 border-white"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* DRAWER LATERAL */}
      {drawerOpen && (
        <div className="print:hidden">
          <DrawerMilitar
            militar={militarSelecionado}
            afastamentos={afastamentos.filter(a => a.equipe_id === militarSelecionado?.id)}
            militares={militares}
            onClose={() => { setDrawerOpen(false); setMilitarSelecionado(null); }}
            onSaved={() => { carregarDados(); showToast(militarSelecionado ? "Prontuário atualizado" : "Novo militar cadastrado"); }}
          />
        </div>
      )}

    </div>
  )
}
