/* app/(sistema)/container/page.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import CardResumo from "./componentes/CardResumo"
import TimelineMovimentacoes from "./componentes/TimelineMovimentacoes"
import ModalMovimentacao from "./componentes/ModalMovimentacao"

import { Plus } from "lucide-react"
import jsPDF from "jspdf"

export default function ContainerPage() {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [saldo, setSaldo] = useState({ colchoes: 0, kits: 0 })
  const [modalOpen, setModalOpen] = useState(false)
  const [movimentacaoEditando, setMovimentacaoEditando] = useState(null)
  const [toast, setToast] = useState(null)
  const [anoSelecionado, setAnoSelecionado] = useState("total")
  const [anosDisponiveis, setAnosDisponiveis] = useState([])

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function buscarMovimentacoes() {
    const { data } = await supabase
      .from("movimentacoes_humanitarias")
      .select("*")
      .order("data_hora", { ascending: false })

    setMovimentacoes(data || [])

    const anos = [
      ...new Set(
        (data || []).map((m) => new Date(m.data_hora).getFullYear())
      )
    ].sort((a, b) => b - a)

    setAnosDisponiveis(anos)
  }

  async function buscarSaldo() {
    const { data } = await supabase
      .from("saldo_humanitario")
      .select("*")
      .single()

    if (data) setSaldo(data)
  }

  // 🔥 UPLOAD: Mantém apenas o nome do arquivo no Storage
  async function uploadArquivo(file) {
    if (!file) return null

    // Sanitização básica do nome do arquivo
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`

    const { error } = await supabase.storage
      .from("guias-humanitarias")
      .upload(fileName, file)

    if (error) {
      showToast("Erro ao enviar arquivo", "error")
      return null
    }

    return fileName 
  }

  // 🔥 SALVAR: Agora totalmente blindado contra URLs com Token
  async function salvarMovimentacao(form, file, id = null) {
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Começamos com o que veio do formulário (pode ser o nome do arquivo já existente)
    let arquivo_nome = form.arquivo_url || null

    // 2. 🛡️ Filtro de Segurança: Se for uma URL (http), limpamos para pegar só o nome
    // Isso evita que links expirados entrem no seu banco de dados
    if (arquivo_nome && arquivo_nome.startsWith("http")) {
      const partes = arquivo_nome.split("guias-humanitarias/")
      arquivo_nome = partes.length > 1 ? partes[1].split("?")[0] : null
    }

    // 3. Se o usuário selecionou um NOVO arquivo, fazemos o upload e pegamos o novo nome
    if (file) {
      const novoNome = await uploadArquivo(file)
      if (novoNome) arquivo_nome = novoNome
    }

    try {
      const payload = {
        ...form,
        arquivo_url: arquivo_nome, // Salvamos apenas o nome puro
        usuario_id: user.id
      }

      if (id) {
        const { error } = await supabase
          .from("movimentacoes_humanitarias")
          .update(payload)
          .eq("id", id)
        
        if (error) throw error
        showToast("Movimentação atualizada")
      } else {
        const { error } = await supabase
          .from("movimentacoes_humanitarias")
          .insert([payload])
        
        if (error) throw error
        showToast("Movimentação registrada")
      }

      await buscarMovimentacoes()
      await buscarSaldo()
      setModalOpen(false)
      setMovimentacaoEditando(null)

    } catch (err) {
      console.error(err)
      showToast("Erro ao salvar dados", "error")
    }
  }

  async function deletarMovimentacao(id) {
    if (!confirm("Deseja excluir permanentemente este registro?")) return

    const { error } = await supabase
      .from("movimentacoes_humanitarias")
      .delete()
      .eq("id", id)

    if (error) {
      showToast("Erro ao excluir", "error")
    } else {
      showToast("Excluído com sucesso")
      await buscarMovimentacoes()
      await buscarSaldo()
    }
  }

  function editarMovimentacao(mov) {
    setMovimentacaoEditando(mov)
    setModalOpen(true)
  }

  // --- Lógica do Relatório PDF (Mantida sem alterações) ---
  async function exportarRelatorio(ano) {
    const doc = new jsPDF()
    const dados = ano === "total" 
      ? movimentacoes 
      : movimentacoes.filter(m => new Date(m.data_hora).getFullYear() === ano)

    let totalColchoes = 0
    let totalKits = 0

    dados.forEach((m) => {
      if (m.tipo === "ENTRADA") {
        totalColchoes += m.colchao_qtd
        totalKits += m.kit_dorm_qtd
      } else {
        totalColchoes -= m.colchao_qtd
        totalKits -= m.kit_dorm_qtd
      }
    })

    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString()
    const horaFormatada = agora.toLocaleTimeString().slice(0, 5)

    const img = new Image()
    img.src = "/logotipo_redec_norte.png"
    await new Promise((r) => (img.onload = r))

    doc.addImage(img, "PNG", 10, 10, 25, 25)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("SECRETARIA DE ESTADO DE DEFESA CIVIL", 40, 14)
    doc.setFont("helvetica", "normal")
    doc.text("DIRETORIA GERAL DE DEFESA CIVIL", 40, 19)
    doc.text("REGIONAL DE DEFESA CIVIL - REDEC 10 - NORTE", 40, 24)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("RELATÓRIO GERAL", 105, 40, { align: "center" })
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Contêiner Humanitário C-02", 105, 47, { align: "center" })
    doc.text(ano === "total" ? "Período: Geral" : `Ano ${ano}`, 105, 53, { align: "center" })

    const rows = dados.map((m, i) => {
      const data = new Date(m.data_hora)
      return [
        i + 1,
        m.tipo,
        data.toLocaleDateString(),
        data.toLocaleTimeString().slice(0, 5),
        m.viatura || "-",
        m.origem_destino || "-",
        `${m.colchao_qtd} Colchões / ${m.kit_dorm_qtd} Kits`,
        m.observacao || "-"
      ]
    })

    const autoTable = (await import("jspdf-autotable")).default
    autoTable(doc, {
      startY: 60,
      head: [["Nº","Situação","Data","Hora","Viatura","Destino","Material","Observação"]],
      body: rows,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [55,65,81], textColor: 255 }
    })

    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(9)
    doc.text("Kits: São kits dormitórios compostos por:", 14, finalY)
    doc.text("01 Lençol", 14, finalY + 5)
    doc.text("01 Fronha", 14, finalY + 10)
    doc.text("01 Travesseiro", 14, finalY + 15)
    doc.text("01 Cobertor", 14, finalY + 20)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(`Colchões: ${totalColchoes}`, 200, finalY + 6, { align: "right" })
    doc.text(`Kits: ${totalKits}`, 200, finalY + 12, { align: "right" })
    doc.setFontSize(9)
    doc.text(`Dados obtidos em ${dataFormatada} às ${horaFormatada}h`, 14, finalY + 28)
    doc.save(ano === "total" ? "relatorio_geral.pdf" : `relatorio_${ano}.pdf`)
  }

  useEffect(() => {
    buscarMovimentacoes()
    buscarSaldo()
  }, [])

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white z-50 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">Contêiner Humanitário C-02</h1>
      </div>

      <div className="flex justify-end gap-2 items-center">
        <select
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(e.target.value)}
          className="border rounded-lg px-3 py-2 shadow-sm"
        >
          <option value="total">Relatório Geral</option>
          {anosDisponiveis.map((ano) => (
            <option key={ano} value={ano}>{ano}</option>
          ))}
        </select>

        <button
          onClick={() => exportarRelatorio(anoSelecionado === "total" ? "total" : Number(anoSelecionado))}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardResumo titulo="Colchões" quantidade={saldo.colchoes} capacidade={102} />
        <CardResumo titulo="Kits" quantidade={saldo.kits} capacidade={102} />
      </div>

      <TimelineMovimentacoes
        movimentacoes={movimentacoes}
        onDelete={deletarMovimentacao}
        onEdit={editarMovimentacao}
      />

      <button
        onClick={() => {
          setMovimentacaoEditando(null)
          setModalOpen(true)
        }}
        className="fixed bottom-20 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg z-50"
      >
        <Plus />
      </button>

      {modalOpen && (
        <ModalMovimentacao
          onClose={() => {
            setModalOpen(false)
            setMovimentacaoEditando(null)
          }}
          onSave={salvarMovimentacao}
          movimentacao={movimentacaoEditando}
        />
      )}
    </div>
  )
}
