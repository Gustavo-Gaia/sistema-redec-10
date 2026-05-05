/* app/(sistema)/municipios/componentes/DrawerMunicipio.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

import ListaDocumentos from "./documentos/ListaDocumentos"
import UploadDocumento from "./documentos/UploadDocumento"

import {
  X,
  Save,
  Loader2,
  Building2,
  FileText,
  AlertTriangle
} from "lucide-react"

export default function DrawerMunicipio({
  municipio,
  eventos = [],
  eventosMunicipios = [],
  dadosEventos = [],
  onClose,
  onSaved
}) {

  const [aba, setAba] = useState("dados")
  const [loading, setLoading] = useState(false)

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
      setForm({ ...municipio })
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
        dados
      }
    }).filter(Boolean)
  }

  // ===============================
  // SALVAR
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
      alert("Erro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* DRAWER */}
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
            { id: "eventos", label: "Eventos", icon: AlertTriangle },
            { id: "documentos", label: "Documentos", icon: FileText }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase border-b-2 ${
                aba === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}

        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ================= DADOS ================= */}
          {aba === "dados" && (
            <div className="space-y-4">

              <input
                placeholder="Nome do Município"
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

              <input
                placeholder="Contato Prefeito"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.prefeito_contato}
                onChange={(e) => setForm({ ...form, prefeito_contato: e.target.value })}
              />

              <input
                placeholder="Secretário DC"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.secretario_dc}
                onChange={(e) => setForm({ ...form, secretario_dc: e.target.value })}
              />

              <input
                placeholder="Contato DC"
                className="w-full p-4 bg-slate-100 rounded-xl"
                value={form.secretario_dc_contato}
                onChange={(e) => setForm({ ...form, secretario_dc_contato: e.target.value })}
              />

              <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                <input
                  type="checkbox"
                  checked={form.possui_barragem}
                  onChange={(e) =>
                    setForm({ ...form, possui_barragem: e.target.checked })
                  }
                />
                Possui barragem
              </label>

            </div>
          )}

          {/* ================= EVENTOS ================= */}
          {aba === "eventos" && (
            <div className="space-y-4">

              {!municipio && (
                <p className="text-xs text-amber-500 font-bold uppercase text-center">
                  Salve o município para visualizar eventos
                </p>
              )}

              {municipio && (
                <>
                  {getEventosDoMunicipio().length === 0 && (
                    <p className="text-center text-xs text-slate-400 font-bold uppercase">
                      Nenhum evento vinculado
                    </p>
                  )}

                  {getEventosDoMunicipio().map(ev => (
                    <div
                      key={ev.id}
                      className="bg-white border rounded-2xl p-4 shadow-sm"
                    >
                      <h3 className="text-xs font-black uppercase text-slate-700">
                        {ev.titulo}
                      </h3>

                      <p className="text-[10px] text-slate-500 mt-1">
                        {ev.tipo} • {ev.cobrade}
                      </p>

                      {ev.dados && (
                        <div className="mt-2 text-[10px] text-slate-600 space-y-1">
                          <p>Desalojados: {ev.dados.desalojados}</p>
                          <p>Desabrigados: {ev.dados.desabrigados}</p>
                          <p>Afetados: {ev.dados.afetados}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

            </div>
          )}

          {/* ================= DOCUMENTOS ================= */}
          {aba === "documentos" && (
            <div className="space-y-4">

              {!municipio && (
                <p className="text-xs text-amber-500 font-bold uppercase text-center">
                  Salve o município antes de anexar documentos
                </p>
              )}

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

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t">
          <button
            onClick={salvarMunicipio}
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-2xl flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            {loading ? "SALVANDO..." : "SALVAR"}
          </button>
        </div>

      </div>
    </div>
  )
}
