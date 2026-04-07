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
  }

  async function buscarSaldo() {
    const { data } = await supabase
      .from("saldo_humanitario")
      .select("*")
      .single()

    if (data) setSaldo(data)
  }

  async function uploadArquivo(file) {
    if (!file) return null

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from("guias-humanitarias")
      .upload(fileName, file)

    if (error) {
      showToast("Erro ao enviar arquivo", "error")
      return null
    }

    const { data } = await supabase.storage
      .from("guias-humanitarias")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7)

    return data.signedUrl
  }

  async function salvarMovimentacao(form, file, id = null) {
    const { data: user } = await supabase.auth.getUser()

    let arquivo_url = form.arquivo_url || null

    if (file) {
      arquivo_url = await uploadArquivo(file)
    }

    try {
      if (id) {
        await supabase
          .from("movimentacoes_humanitarias")
          .update({ ...form, arquivo_url })
          .eq("id", id)

        showToast("Movimentação atualizada")
      } else {
        await supabase.from("movimentacoes_humanitarias").insert([
          {
            ...form,
            arquivo_url,
            usuario_id: user.user.id
          }
        ])

        showToast("Movimentação registrada")
      }

      await buscarMovimentacoes()
      await buscarSaldo()

      setModalOpen(false)
      setMovimentacaoEditando(null)

    } catch {
      showToast("Erro ao salvar", "error")
    }
  }

  async function deletarMovimentacao(id) {
    if (!confirm("Deseja excluir?")) return

    await supabase
      .from("movimentacoes_humanitarias")
      .delete()
      .eq("id", id)

    showToast("Excluído")

    await buscarMovimentacoes()
    await buscarSaldo()
  }

  function editarMovimentacao(mov) {
    setMovimentacaoEditando(mov)
    setModalOpen(true)
  }

  // 🔥 EXPORTAÇÃO PROFISSIONAL
  async function exportarRelatorio(ano) {
    const doc = new jsPDF()
  
    const dados = movimentacoes.filter(
      (m) => new Date(m.data_hora).getFullYear() === ano
    )
  
    // 🔹 LOGO
    const img = new Image()
    img.src = "/logotipo_redec_norte.png"
    await new Promise((r) => (img.onload = r))
  
    doc.addImage(img, "PNG", 10, 10, 25, 25)
  
    // 🔹 CABEÇALHO ORGANIZADO
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("SECRETARIA DE ESTADO DE DEFESA CIVIL", 40, 14)
  
    doc.setFont("helvetica", "normal")
    doc.text("DIRETORIA GERAL DE DEFESA CIVIL", 40, 19)
    doc.text("REGIONAL DE DEFESA CIVIL - REDEC 10 - NORTE", 40, 24)
  
    // 🔹 TÍTULO EM 3 LINHAS
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("RELATÓRIO GERAL", 105, 40, { align: "center" })
  
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Contêiner Humanitário C-02", 105, 47, { align: "center" })
  
    doc.text(`Ano ${ano}`, 105, 53, { align: "center" })
  
    // 🔹 TABELA
    const rows = dados.map((m, i) => {
      const data = new Date(m.data_hora)
  
      return [
        i + 1,
        m.tipo,
        data.toLocaleDateString(),
        data.toLocaleTimeString().slice(0, 5),
        m.viatura || "-",
        m.origem_destino || "-",
        `Colchões: ${m.colchao_qtd} / Kits: ${m.kit_dorm_qtd}`,
        m.observacao || "-"
      ]
    })
  
    const autoTable = (await import("jspdf-autotable")).default
  
    autoTable(doc, {
      startY: 60,
    
      head: [[
        "Nº",
        "Situação",
        "Data",
        "Hora",
        "Viatura",
        "Destino",
        "Material",
        "Observação"
      ]],
    
      body: rows,
    
      styles: {
        fontSize: 9,
        cellPadding: 2,
        textColor: [31, 41, 55] // cinza escuro elegante
      },
    
      headStyles: {
        fillColor: [55, 65, 81], // cinza escuro (header)
        textColor: 255,
        fontSize: 11, // 🔹 cabeçalho
        halign: "center"
      },
    
      alternateRowStyles: {
        fillColor: [249, 250, 251] // leve cinza alternado
      },
    
      didParseCell: function (data) {
        if (data.section === "body") {
          const tipo = dados[data.row.index].tipo
    
          if (tipo === "ENTRADA") {
            data.cell.styles.fillColor = [243, 244, 246] // cinza claro
          }
    
          if (tipo === "SAÍDA") {
            data.cell.styles.fillColor = [229, 231, 235] // cinza médio
          }
        }
      }
    })
  
    // 🔹 PAGINAÇÃO + RODAPÉ
    const totalPages = doc.getNumberOfPages()
  
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
  
      doc.setFontSize(9)
  
      doc.text(
        `Página ${i} de ${totalPages}`,
        200,
        290,
        { align: "right" }
      )
  
      doc.text(
        `© ${ano} | REDEC 10 - Norte | Defesa Civil Estadual`,
        105,
        290,
        { align: "center" }
      )
    }
  
    doc.save(`relatorio_${ano}.pdf`)
  }

  useEffect(() => {
    buscarMovimentacoes()
    buscarSaldo()
  }, [])

  return (
    <div className="p-6 space-y-6">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white z-50 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">
          Contêiner Humanitário C-02
        </h1>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            const ano = prompt("Digite o ano:", new Date().getFullYear())
            if (ano) exportarRelatorio(Number(ano))
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Exportar Relatório
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
