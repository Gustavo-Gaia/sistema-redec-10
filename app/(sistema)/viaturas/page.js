/* app/(sistema)/viaturas/page.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Wrench, Car, FileWarning } from "lucide-react"

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

  // ---------------- BUSCAS ----------------
  async function buscarViaturas() {
    const { data, error } = await supabase
      .from("viaturas")
      .select("*")
      .order("prefixo")

    if (error) {
      console.error(error)
      showToast("Erro ao buscar viaturas", "error")
    } else {
      setViaturas(data || [])
    }
  }

  async function buscarManutencoes() {
    const { data, error } = await supabase
      .from("viaturas_manutencoes")
      .select(`*, viaturas ( prefixo )`)
      .order("data", { ascending: false })

    if (error) {
      console.error(error)
      showToast("Erro ao buscar manutenções", "error")
    } else {
      setManutencoes(data || [])
    }
  }

  async function buscarMultas() {
    const { data, error } = await supabase
      .from("viaturas_multas")
      .select(`*, viaturas ( prefixo )`)
      .order("data_infracao", { ascending: false })

    if (error) {
      console.error(error)
      showToast("Erro ao buscar multas", "error")
    } else {
      setMultas(data || [])
    }
  }

  async function carregarTudo() {
    setLoading(true)
    await buscarViaturas()
    await buscarManutencoes()
    await buscarMultas()
    setLoading(false)
  }

  // ---------------- VIATURA ----------------
  async function salvarViatura(form) {
    try {
      if (editandoViatura) {
        const { error } = await supabase
          .from("viaturas")
          .update(form)
          .eq("id", editandoViatura.id)

        if (error) throw error
        showToast("Viatura atualizada")
      } else {
        const { error } = await supabase
          .from("viaturas")
          .insert([form])

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
      const { error } = await supabase
        .from("viaturas")
        .delete()
        .eq("id", id)

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
        const { error } = await supabase
          .from("viaturas_manutencoes")
          .update(payload)
          .eq("id", id)

        if (error) throw error
        showToast("Manutenção atualizada")
      } else {
        const { error } = await supabase
          .from("viaturas_manutencoes")
          .insert([payload])

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
      const { error } = await supabase
        .from("viaturas_manutencoes")
        .delete()
        .eq("id", id)

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
        observacao: form.observacao || null
      }

      if (id) {
        const { error } = await supabase
          .from("viaturas_multas")
          .update(payload)
          .eq("id", id)

        if (error) throw error
        showToast("Multa atualizada")
      } else {
        const { error } = await supabase
          .from("viaturas_multas")
          .insert([payload])

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
      const { error } = await supabase
        .from("viaturas_multas")
        .delete()
        .eq("id", id)

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

  // ---------------- FILTROS ----------------
  const manutencoesFiltradas = filtroViatura
    ? manutencoes.filter(m => m.viatura_id === filtroViatura)
    : manutencoes

  const multasFiltradas = filtroViatura
    ? multas.filter(m => m.viatura_id === filtroViatura)
    : multas

  // ---------------- UI ----------------
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

      {/* HEADER */}
      <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">Gestão de Viaturas</h1>
        <p className="text-sm opacity-80">
          Cadastro, manutenção e controle da frota
        </p>
      </div>

      {/* ABAS */}
      <div className="flex gap-2">
        <button onClick={() => setAba("viaturas")} className={`px-4 py-2 rounded-xl ${aba === "viaturas" ? "bg-slate-700 text-white" : "bg-white border"}`}>
          <Car size={16}/> Viaturas
        </button>

        <button onClick={() => setAba("manutencoes")} className={`px-4 py-2 rounded-xl ${aba === "manutencoes" ? "bg-slate-700 text-white" : "bg-white border"}`}>
          <Wrench size={16}/> Manutenções
        </button>

        <button onClick={() => setAba("multas")} className={`px-4 py-2 rounded-xl ${aba === "multas" ? "bg-slate-700 text-white" : "bg-white border"}`}>
          <FileWarning size={16}/> Multas
        </button>
      </div>

      {/* FILTRO GLOBAL */}
      {(aba === "manutencoes" || aba === "multas") && (
        <div className="bg-white p-4 rounded-2xl border flex gap-3 items-center">
          <select
            value={filtroViatura}
            onChange={(e) => setFiltroViatura(e.target.value)}
            className="border rounded-xl px-3 py-2"
          >
            <option value="">Todas as viaturas</option>
            {viaturas.map(v => (
              <option key={v.id} value={v.id}>{v.prefixo}</option>
            ))}
          </select>

          {filtroViatura && (
            <button onClick={() => setFiltroViatura("")} className="text-red-500 text-sm">
              Limpar filtro
            </button>
          )}
        </div>
      )}

      {/* VIATURAS */}
      {aba === "viaturas" && (
        <div className="grid grid-cols-3 gap-4">
          {viaturas.map(v => (
            <div key={v.id} onClick={() => {
              setEditandoViatura(v)
              setModalViaturaOpen(true)
            }} className="bg-white p-4 border rounded-xl cursor-pointer">
              <h2 className="font-bold">{v.prefixo}</h2>
              <p className="text-sm">{v.marca} {v.modelo}</p>
            </div>
          ))}
        </div>
      )}

      {/* MANUTENÇÕES */}
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

      {/* MULTAS */}
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

      {/* BOTÃO */}
      <button
        onClick={() => {
          if (aba === "viaturas") {
            setEditandoViatura(null)
            setModalViaturaOpen(true)
          }
          if (aba === "manutencoes") {
            setEditandoManut(null)
            setModalManutOpen(true)
          }
          if (aba === "multas") {
            setEditandoMulta(null)
            setModalMultaOpen(true)
          }
        }}
        className="fixed bottom-20 right-6 bg-slate-700 text-white p-4 rounded-full shadow-lg"
      >
        <Plus />
      </button>

      {/* MODAIS */}
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
