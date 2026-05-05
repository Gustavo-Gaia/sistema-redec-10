/* app/(sistema)/municipios/componentes/DrawerMunicipio.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

import ListaDocumentos from "./documentos/ListaDocumentos"
import UploadDocumento from "./documentos/UploadDocumento"

// 🔥 NOVOS
import ListaEventosMunicipio from "./eventos/ListaEventosMunicipio"
import ModalVincularEvento from "./eventos/ModalVincularEvento"

import {
  X,
  Save,
  Loader2,
  Building2,
  FileText,
  AlertTriangle,
  Plus
} from "lucide-react"

export default function DrawerMunicipio({
  municipio,
  eventos,
  eventosMunicipios,
  dadosEventos,
  onClose,
  onSaved
}) {

  const [aba, setAba] = useState("dados")
  const [loading, setLoading] = useState(false)

  const [modalEventoOpen, setModalEventoOpen] = useState(false)

  const [form, setForm] = useState({
    id: null,
    nome: "",
    prefeito: "",
    prefeito_contato: "",
    secretario_dc: "",
    secretario_dc_contato: "",
    possui_barragem: false
  })

  const [documentos, setDocumentos] = useState([])

  // ===============================
  // CARREGAR MUNICÍPIO
  // ===============================
  useEffect(() => {
    if (municipio) {
      setForm(municipio)
    } else {
      setForm({
        id: null,
        nome: "",
        prefeito: "",
        prefeito_contato: "",
        secretario_dc: "",
        secretario_dc_contato: "",
        possui_barragem: false
      })
    }
  }, [municipio])

  // ===============================
  // 🔥 EVENTOS DO MUNICÍPIO
  // ===============================
  function getEventosDoMunicipio() {
    if (!municipio) return []

    const vinculos = eventosMunicipios.filter(
      em => em.municipio_id === municipio.id
    )

    return vinculos.map(v => {
      const evento = eventos.find(e => e.id === v.evento_id)
      const dados = dadosEventos.find(d => d.evento_municipio_id === v.id)

      return {
        ...evento,
        dados,
        vinculoId: v.id
      }
    })
  }

  // ===============================
  // DOCUMENTOS
  // ===============================
  async function carregarDocs() {
    if (!municipio?.id) return

    const { data } = await supabase
      .from("municipios_documentos")
      .select("*")
      .eq("municipio_id", municipio.id)
      .order("created_at", { ascending: false })

    setDocumentos(data || [])
  }

  useEffect(() => {
    if (aba === "documentos") carregarDocs()
  }, [aba, municipio])

  async function deletarDocumento(doc) {
    if (!confirm("Excluir documento?")) return

    await supabase.storage
      .from("municipios-documentos")
      .remove([doc.arquivo_nome])

    await supabase
      .from("municipios_documentos")
      .delete()
      .eq("id", doc.id)

    carregarDocs()
  }

  // ===============================
  // SALVAR MUNICÍPIO
  // ===============================
  async function salvarMunicipio() {
    setLoading(true)

    try {
      const payload = {
        ...form,
        nome: form.nome.toUpperCase()
      }

      const { error } = await supabase
        .from("municipios")
        .upsert(payload)

      if (error) throw error

      onSaved()
      onClose()

    } catch (err) {
      alert("Erro ao salvar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const eventosMunicipio = getEventosDoMunicipio()

  // ===============================
  // UI
  // ===============================
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">

      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">

        {/* HEADER */}
        <div className="p-6 border-b bg-slate-50 flex justify-between">
          <div>
            <h2 className="text-xl font-black uppercase">
              {municipio ? form.nome : "Novo Município"}
            </h2>
            <p className="text-[10px] text-blue-600 font-black uppercase">
              Cadastro Municipal
            </p>
          </div>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b px-4 bg-slate-50 overflow-x-auto">

          {[
            { id: "dados", label: "Dados", icon: Building2 },
            { id: "documentos", label: "Documentos", icon: FileText },
            { id: "eventos", label: "Eventos", icon: AlertTriangle }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase border-b-2 ${
                aba === t.id
                  ? "border-blue-600 text-blue-600"
                  : "text-slate-400"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ===== DADOS ===== */}
          {aba === "dados" && (
            <>
              <input
                placeholder="Nome"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />

              <input
                placeholder="Prefeito"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.prefeito}
                onChange={(e) => setForm({ ...form, prefeito: e.target.value })}
              />
            </>
          )}

          {/* ===== DOCUMENTOS ===== */}
          {aba === "documentos" && (
            <>
              {municipio && (
                <>
                  <UploadDocumento
                    municipioId={municipio.id}
                    onUploaded={carregarDocs}
                  />

                  <ListaDocumentos
                    documentos={documentos}
                    onDelete={deletarDocumento}
                  />
                </>
              )}
            </>
          )}

          {/* ===== EVENTOS ===== */}
          {aba === "eventos" && (
            <div className="space-y-4">

              {!municipio && (
                <p className="text-xs text-amber-500 font-bold text-center">
                  Salve o município antes de vincular eventos
                </p>
              )}

              {municipio && (
                <>
                  <button
                    onClick={() => setModalEventoOpen(true)}
                    className="w-full bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase"
                  >
                    <Plus size={14} />
                    Vincular Evento
                  </button>

                  <ListaEventosMunicipio
                    eventos={eventosMunicipio}
                  />
                </>
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t">
          <button
            onClick={salvarMunicipio}
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-xs flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            SALVAR
          </button>
        </div>
      </div>

      {/* MODAL */}
      {modalEventoOpen && (
        <ModalVincularEvento
          municipioId={municipio.id}
          eventos={eventos}
          onClose={() => setModalEventoOpen(false)}
          onSaved={onSaved}
        />
      )}

    </div>
  )
}
