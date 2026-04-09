/* app/(sistema)/boletins/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus } from "lucide-react"
import { toast } from "react-hot-toast"

import AbasBoletins from "./componentes/AbasBoletins"
import HeaderBoletins from "./componentes/HeaderBoletins"
import Filtros from "./componentes/Filtros"
import Tabela from "./componentes/Tabela"
import ModalCadastro from "./componentes/ModalCadastro"
import { ordenarLista } from "./componentes/utils"

export default function BoletinsPage() {
  // 1. ESTADOS PRINCIPAIS
  const [abaAtiva, setAbaAtiva] = useState("boletins") // 'sei' ou 'boletins'
  const [orgaoAtivo, setOrgaoAtivo] = useState("SEDEC") // 'SEDEC' ou 'DGDEC'
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados de Controle
  const [modalOpen, setModalOpen] = useState(false)
  const [itemParaEditar, setItemParaEditar] = useState(null)
  const [filtros, setFiltros] = useState({ 
    busca: "", 
    ano: "2026", 
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

      // Se estiver na aba de boletins, filtra também pelo órgão selecionado no banco
      if (abaAtiva === "boletins") {
        query = query.eq("tipo_orgao", orgaoAtivo)
      }

      const { data, error } = await query

      if (error) throw error
      
      setDados(ordenarLista(data || []))
    } catch (error) {
      console.error("Erro ao carregar:", error)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  // Recarregar sempre que trocar a aba principal OU o órgão (sub-aba)
  useEffect(() => {
    carregarDados()
  }, [abaAtiva, orgaoAtivo])

  // 3. FILTRAGEM EM TEMPO REAL (Busca e Ano)
  const dadosFiltrados = dados.filter(item => {
    const assunto = item.assunto?.toLowerCase() || ""
    const numero = item.numero?.toLowerCase() || ""
    const busca = filtros.busca.toLowerCase()

    const matchesBusca = assunto.includes(busca) || numero.includes(busca)
    const matchesAno = item.data_registro?.startsWith(filtros.ano)
    const matchesEspecial = filtros.especial ? item.acompanhamento_especial === true : true

    return matchesBusca && matchesAno && matchesEspecial
  })

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
      
      {/* Topo: Agora passamos o orgaoAtivo para evitar o erro de 'undefined' */}
      <HeaderBoletins 
        abaAtiva={abaAtiva} 
        orgaoAtivo={orgaoAtivo}
        onNovo={handleNovo} 
      />

      {/* Seletor de Abas Principal e Sub-abas de Órgãos */}
      <AbasBoletins 
        abaAtiva={abaAtiva} 
        setAbaAtiva={setAbaAtiva} 
        orgaoAtivo={orgaoAtivo}
        setOrgaoAtivo={setOrgaoAtivo}
      />

      {/* Área de Filtros e Tabela */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <Filtros 
          filtros={filtros} 
          setFiltros={setFiltros} 
          abaAtiva={abaAtiva} 
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

      {/* Modal de Cadastro/Edição */}
      {modalOpen && (
        <ModalCadastro
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          item={itemParaEditar}
          abaAtiva={abaAtiva}
          orgaoPadrao={orgaoAtivo} // Define se o novo registro vem como SEDEC ou DGDEC
          onSuccess={carregarDados}
        />
      )}

      {/* Botão Flutuante de Acesso Rápido */}
      <button
        onClick={handleNovo}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center group z-40"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  )
}
