/* app/(sistema)/boletins/page.js */

"use client"

import { useState, useEffect, useMemo } from "react" // Adicionado useMemo
import { supabase } from "@/lib/supabase"
import { Plus } from "lucide-react"
import { toast } from "react-hot-toast"

import AbasBoletins from "./componentes/AbasBoletins"
import HeaderBoletins from "./componentes/HeaderBoletins"
import Filtros from "./componentes/Filtros"
import Tabela from "./componentes/Tabela"
import ModalCadastro from "./componentes/ModalCadastro"

export default function BoletinsPage() {
  // 1. ESTADOS PRINCIPAIS
  const [abaAtiva, setAbaAtiva] = useState("boletins") 
  const [orgaoAtivo, setOrgaoAtivo] = useState("SEDEC") 
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados de Controle
  const [modalOpen, setModalOpen] = useState(false)
  const [itemParaEditar, setItemParaEditar] = useState(null)
  
  // Ano atual dinâmico para o filtro inicial
  const anoAtual = new Date().getFullYear().toString()
  
  const [filtros, setFiltros] = useState({ 
    busca: "", 
    ano: anoAtual, 
    especial: false 
  })

  // 2. BUSCAR DADOS DO SUPABASE
  async function carregarDados() {
    setLoading(true)
    try {
      let query = supabase
        .from("documentos_administrativos")
        .select("*")
        .eq("categoria", abaAtiva)

      if (abaAtiva === "boletins") {
        query = query.eq("tipo_orgao", orgaoAtivo)
      }

      // 🔥 ORDENAÇÃO FIXA: Resolve o problema do item pular para o final
      // Ordena por data (mais recente) e depois por número (mais alto)
      query = query.order("data_registro", { ascending: false })
                   .order("numero", { ascending: false })

      const { data, error } = await query
      if (error) throw error
      
      setDados(data || [])
    } catch (error) {
      console.error("Erro ao carregar:", error)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [abaAtiva, orgaoAtivo])

  // 3. LÓGICA DE FILTROS E ANOS DINÂMICOS
  
  // Gera a lista de anos baseada APENAS nos dados que existem no banco
  const anosDisponiveis = useMemo(() => {
    if (dados.length === 0) return [anoAtual]
    
    const anosSet = new Set()
    dados.forEach(item => {
      if (item.data_registro) {
        const ano = item.data_registro.split("-")[0]
        anosSet.add(ano)
      }
    })
    
    // Converte para array e ordena do maior para o menor
    return Array.from(anosSet).sort((a, b) => b - a)
  }, [dados, anoAtual])

  // Filtra os dados em tempo real
  const dadosFiltrados = useMemo(() => {
    return dados.filter(item => {
      const assunto = item.assunto?.toLowerCase() || ""
      const numero = item.numero?.toLowerCase() || ""
      const busca = filtros.busca.toLowerCase()

      const matchesBusca = assunto.includes(busca) || numero.includes(busca)
      
      // ✅ Filtro de ano robusto: extrai o ano da string YYYY-MM-DD
      const anoItem = item.data_registro?.split("-")[0]
      const matchesAno = filtros.ano ? anoItem === filtros.ano : true
      
      const matchesEspecial = filtros.especial ? item.acompanhamento_especial === true : true

      return matchesBusca && matchesAno && matchesEspecial
    })
  }, [dados, filtros])

  // 4. FUNÇÕES DE AÇÃO
  const handleNovo = () => {
    setItemParaEditar(null)
    setModalOpen(true)
  }

  const handleEditar = (item) => {
    setItemParaEditar(item)
    setModalOpen(true)
  }

  return (
    <div className="p-6 pb-20 max-w-[1600px] mx-auto space-y-6">
      
      <HeaderBoletins 
        abaAtiva={abaAtiva} 
        orgaoAtivo={orgaoAtivo}
        onNovo={handleNovo} 
      />

      <AbasBoletins 
        abaAtiva={abaAtiva} 
        setAbaAtiva={setAbaAtiva} 
        orgaoAtivo={orgaoAtivo}
        setOrgaoAtivo={setOrgaoAtivo}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 🔥 Passamos a lista de anos dinâmicos para o componente Filtros */}
        <Filtros 
          filtros={filtros} 
          setFiltros={setFiltros} 
          abaAtiva={abaAtiva} 
          anosDisponiveis={anosDisponiveis} 
        />
        
        <Tabela 
          dados={dadosFiltrados} 
          loading={loading} 
          abaAtiva={abaAtiva} 
          orgaoAtivo={orgaoAtivo}
          onEdit={handleEditar}
          onRefresh={carregarDados}
        />
      </div>

      {modalOpen && (
        <ModalCadastro
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          item={itemParaEditar}
          abaAtiva={abaAtiva}
          orgaoPadrao={orgaoAtivo}
          onSuccess={carregarDados}
        />
      )}

      <button
        onClick={handleNovo}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center group z-40"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  )
}
