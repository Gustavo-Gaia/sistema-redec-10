/* app/(sistema)/boletins/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus } from "lucide-react"
import { toast } from "react-hot-toast" // Assumindo que você usa react-hot-toast

// Componentes que vamos criar nos próximos passos
import AbasBoletins from "./componentes/AbasBoletins"
import HeaderBoletins from "./componentes/HeaderBoletins"
import Filtros from "./componentes/Filtros"
import Tabela from "./componentes/Tabela"
import ModalCadastro from "./componentes/ModalCadastro"
import { ordenarLista } from "./componentes/utils"

export default function BoletinsPage() {
  // 1. ESTADOS PRINCIPAIS
  const [abaAtiva, setAbaAtiva] = useState("sei") // 'sei' ou 'boletins'
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados de Controle
  const [modalOpen, setModalOpen] = useState(false)
  const [itemParaEditar, setItemParaEditar] = useState(null)
  const [filtros, setFiltros] = useState({ busca: "", ano: new Date().getFullYear().toString(), especial: false })

  // 2. BUSCAR DADOS DO SUPABASE
  async function carregarDados() {
    setLoading(true)
    try {
      // Buscamos da tabela única que criamos
      const { data, error } = await supabase
        .from("documentos_administrativos")
        .select("*")
        .eq("categoria", abaAtiva === "sei" ? "sei" : "boletim")

      if (error) throw error
      
      // Aplicamos a ordenação inteligente do utils.js
      setDados(ordenarLista(data || []))
    } catch (error) {
      console.error("Erro ao carregar:", error)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  // Recarregar sempre que trocar a aba
  useEffect(() => {
    carregarDados()
  }, [abaAtiva])

  // 3. FILTRAGEM EM TEMPO REAL (No Front-end para agilidade)
  const dadosFiltrados = dados.filter(item => {
    const matchesBusca = item.assunto.toLowerCase().includes(filtros.busca.toLowerCase()) || 
                         item.numero.toLowerCase().includes(filtros.busca.toLowerCase())
    const matchesAno = item.data_registro.startsWith(filtros.ano)
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
      
      {/* Topo com Título e Visto Até */}
      <HeaderBoletins 
        abaAtiva={abaAtiva} 
        onNovo={handleNovo} 
      />

      {/* Seletor de Abas */}
      <AbasBoletins 
        abaAtiva={abaAtiva} 
        setAbaAtiva={setAbaAtiva} 
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
          onSuccess={carregarDados}
        />
      )}

      {/* Botão Flutuante (estilo que você gostou) */}
      <button
        onClick={handleNovo}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center group z-40"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  )
}
