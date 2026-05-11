/* app/(sistema)/municipios/componentes/eventos/ModalEvento.js */

"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

import {
  X,
  Save,
  Loader2,
  AlertTriangle,
  Info,
  CalendarDays,
  MapPin,
  FileText,
  ShieldAlert,
  Building2,
  CheckCircle2
} from "lucide-react"

// ======================================================
// ATIVIDADES
// ======================================================

const atividadesMunicipio = [
  { id: "8730", label: "8730 - Preparação (reuniões, simulados, palestras)" },
  { id: "5518", label: "5518 - Assessoria técnica aos municípios" },
  { id: "7181", label: "7181 - Apoio na resposta a desastres" },
  { id: "APOIO_HUMANITARIO", label: "Apoio Humanitário" },
  { id: "VISITA_TECNICA", label: "Visita Técnica" }
]

const atividadesREDEC = [
  { id: "ANALISE_TECNICA", label: "Análise técnica" },
  { id: "CAPACITACAO", label: "Capacitação externa" },
  { id: "COLABORACAO", label: "Colaboração técnica" },
  { id: "EVENTO", label: "Participação em evento" },
  { id: "REUNIAO_INTERNA", label: "Reunião de Trabalho Interna" }
]

// ======================================================
// COMPONENTE
// ======================================================

export default function ModalEvento({
  evento,
  municipios = [],
  onClose,
  onSaved
}) {

  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] = useState(false)

  const [tipoRegistro, setTipoRegistro] = useState(
    evento?.tipo_registro || "ROTINA"
  )

  const [form, setForm] = useState({
    titulo: "",
    tipo_registro: "ROTINA",

    categoria: "MUNICIPIO",
    tipo_atividade: "",
    fora_area: false,

    data_inicio: new Date().toISOString().split("T")[0],
    descricao: "",

    // ANORMALIDADE
    intencao_decretar: false,
    status_anormalidade: "SE",
    nivel_desastre: "I",
    protocolo_s2id: "",
    cobrade: ""
  })

  const [municipiosSelecionados, setMunicipiosSelecionados] = useState({})

  // ======================================================
  // LOAD EVENT
  // ======================================================

  useEffect(() => {
    if (!evento) return

    setForm({
      titulo: evento.titulo || "",
      tipo_registro: evento.tipo_registro || "ROTINA",

      categoria: evento.categoria || "MUNICIPIO",
      tipo_atividade: evento.tipo_atividade || "",
      fora_area: evento.fora_area || false,

      data_inicio: evento.data_inicio || "",
      descricao: evento.descricao || "",

      intencao_decretar: evento.intencao_decretar || false,
      status_anormalidade: evento.status_anormalidade || "SE",
      nivel_desastre: evento.nivel_desastre || "I",
      protocolo_s2id: evento.protocolo_s2id || "",
      cobrade: evento.cobrade || ""
    })

    setTipoRegistro(evento.tipo_registro || "ROTINA")

    carregarMunicipiosEvento(evento.id)

  }, [evento])

  // ======================================================
  // LOAD MUNICIPIOS
  // ======================================================

  async function carregarMunicipiosEvento(eventoId) {

    const { data, error } = await supabase
      .from("eventos_municipios")
      .select(`
        *,
        eventos_dados (*)
      `)
      .eq("evento_id", eventoId)

    if (error) {
      console.error(error)
      return
    }

    const mapa = {}

    data?.forEach((item) => {

      mapa[item.municipio_id] = {
        dados: item.eventos_dados?.[0] || {
          desalojados: 0,
          desabrigados: 0,
          afetados: 0,
          mortos: 0,
          desaparecidos: 0
        }
      }
    })

    setMunicipiosSelecionados(mapa)
  }

  // ======================================================
  // HELPERS
  // ======================================================

  const atividadesDisponiveis = useMemo(() => {
    return form.categoria === "MUNICIPIO"
      ? atividadesMunicipio
      : atividadesREDEC
  }, [form.categoria])

  function updateForm(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor
    }))
  }

  function toggleMunicipio(id) {

    setMunicipiosSelecionados((prev) => {

      const novo = { ...prev }

      if (novo[id]) {
        delete novo[id]
      } else {
        novo[id] = {
          dados: {
            desalojados: 0,
            desabrigados: 0,
            afetados: 0,
            mortos: 0,
            desaparecidos: 0
          }
        }
      }

      return novo
    })
  }

  function updateDado(municipioId, campo, valor) {

    setMunicipiosSelecionados((prev) => ({
      ...prev,

      [municipioId]: {
        ...prev[municipioId],

        dados: {
          ...prev[municipioId].dados,
          [campo]: Number(valor) || 0
        }
      }
    }))
  }

  // ======================================================
  // VALIDAR
  // ======================================================

  function validarFormulario() {

    if (!form.titulo?.trim()) {
      alert("Informe o título.")
      return false
    }

    if (!form.data_inicio) {
      alert("Informe a data.")
      return false
    }

    if (
      form.categoria === "MUNICIPIO" &&
      !form.fora_area &&
      Object.keys(municipiosSelecionados).length === 0
    ) {
      alert("Selecione pelo menos um município.")
      return false
    }

    return true
  }

  // ======================================================
  // SALVAR
  // ======================================================

  async function salvarEvento() {

    if (!validarFormulario()) return

    setLoading(true)

    try {

      const payload = {
        ...form,
        tipo_registro: tipoRegistro
      }

      let eventoId = evento?.id

      // =========================================
      // UPDATE
      // =========================================

      if (eventoId) {

        const { error } = await supabase
          .from("eventos")
          .update(payload)
          .eq("id", eventoId)

        if (error) throw error

      } else {

        // =========================================
        // INSERT
        // =========================================

        const { data, error } = await supabase
          .from("eventos")
          .insert(payload)
          .select()
          .single()

        if (error) throw error

        // =========================================
        // CORREÇÃO DO SEU ERRO
        // =========================================

        if (!data?.id) {
          throw new Error("Evento não retornou ID.")
        }

        eventoId = data.id
      }

      // =========================================
      // REMOVE VÍNCULOS ANTIGOS
      // =========================================

      await supabase
        .from("eventos_municipios")
        .delete()
        .eq("evento_id", eventoId)

      // =========================================
      // CRIA MUNICÍPIOS
      // =========================================

      const precisaMunicipio =
        form.categoria === "MUNICIPIO" &&
        !form.fora_area

      if (precisaMunicipio) {

        for (const municipioId of Object.keys(municipiosSelecionados)) {

          const { data: vinculo, error: erroVinculo } = await supabase
            .from("eventos_municipios")
            .insert({
              evento_id: eventoId,
              municipio_id: municipioId
            })
            .select()
            .single()

          if (erroVinculo) throw erroVinculo

          // =====================================
          // DADOS HUMANOS
          // =====================================

          if (
            tipoRegistro === "ANORMALIDADE" &&
            vinculo?.id
          ) {

            const dados = municipiosSelecionados[municipioId].dados

            const { error: erroDados } = await supabase
              .from("eventos_dados")
              .insert({
                evento_municipio_id: vinculo.id,

                desalojados: dados.desalojados || 0,
                desabrigados: dados.desabrigados || 0,
                afetados: dados.afetados || 0,
                mortos: dados.mortos || 0,
                desaparecidos: dados.desaparecidos || 0
              })

            if (erroDados) throw erroDados
          }
        }
      }

      onSaved?.()

    } catch (err) {

      console.error(err)

      alert(
        "Erro ao salvar evento:\n\n" +
        (err.message || "Erro desconhecido")
      )

    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-2xl flex flex-col">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6">

          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_40%)]" />

          <div className="relative flex items-start justify-between gap-4">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">
                Gestão de Eventos
              </p>

              <h2 className="text-3xl font-black text-white mt-1">
                {evento ? "Editar Evento" : "Novo Evento"}
              </h2>

              <p className="text-sm text-slate-300 mt-2">
                Cadastro de ocorrências, atividades e situações de anormalidade.
              </p>
            </div>

            <button
              onClick={onClose}
              className="h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>

          </div>

          {/* TABS */}
          <div className="relative mt-6 flex gap-3">

            <button
              onClick={() => setTipoRegistro("ROTINA")}
              className={`
                flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition-all
                ${
                  tipoRegistro === "ROTINA"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }
              `}
            >
              <Info size={16} />
              EVENTO DE ROTINA
            </button>

            <button
              onClick={() => setTipoRegistro("ANORMALIDADE")}
              className={`
                flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition-all
                ${
                  tipoRegistro === "ANORMALIDADE"
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }
              `}
            >
              <AlertTriangle size={16} />
              ANORMALIDADE
            </button>

          </div>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="flex-1 overflow-y-auto bg-slate-50">

          <div className="p-8 space-y-8">

            {/* ======================================================
                BLOCO PRINCIPAL
            ====================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="text-lg font-black text-slate-800">
                  Informações Principais
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Dados básicos do registro.
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* TÍTULO */}
                <div className="md:col-span-2">
                  <label className="label">
                    Título do Evento
                  </label>

                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => updateForm("titulo", e.target.value)}
                    placeholder="Ex.: Chuvas intensas em Italva"
                    className="input"
                  />
                </div>

                {/* DATA */}
                <div>
                  <label className="label">
                    Data do Evento
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={form.data_inicio || ""}
                      onChange={(e) =>
                        updateForm("data_inicio", e.target.value)
                      }
                      className="input pl-12"
                    />
                  </div>
                </div>

                {/* CATEGORIA */}
                <div>
                  <label className="label">
                    Categoria
                  </label>

                  <select
                    value={form.categoria}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        categoria: e.target.value,
                        tipo_atividade: ""
                      }))
                    }
                    className="input"
                  >
                    <option value="MUNICIPIO">
                      Com Municípios
                    </option>

                    <option value="REDEC">
                      Interno REDEC
                    </option>
                  </select>
                </div>

                {/* TIPO ATIVIDADE */}
                {tipoRegistro === "ROTINA" && (
                  <div className="md:col-span-2">
                    <label className="label">
                      Tipo de Atividade
                    </label>

                    <select
                      value={form.tipo_atividade}
                      onChange={(e) =>
                        updateForm("tipo_atividade", e.target.value)
                      }
                      className="input"
                    >
                      <option value="">
                        Selecione uma atividade
                      </option>

                      {atividadesDisponiveis.map((atividade) => (
                        <option
                          key={atividade.id}
                          value={atividade.id}
                        >
                          {atividade.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            </div>

            {/* ======================================================
                BLOCO ANORMALIDADE
            ====================================================== */}

            {tipoRegistro === "ANORMALIDADE" && (

              <div className="rounded-3xl border border-red-200 bg-white shadow-sm overflow-hidden">

                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 text-white">

                  <div className="flex items-center gap-3">
                    <ShieldAlert size={22} />

                    <div>
                      <h3 className="text-lg font-black">
                        Situação de Anormalidade
                      </h3>

                      <p className="text-red-100 text-sm mt-1">
                        Dados operacionais do desastre.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
                    <label className="label">
                      Status
                    </label>

                    <select
                      value={form.status_anormalidade}
                      onChange={(e) =>
                        updateForm("status_anormalidade", e.target.value)
                      }
                      className="input"
                    >
                      <option value="SE">
                        Situação de Emergência
                      </option>

                      <option value="ECP">
                        Estado de Calamidade Pública
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Nível do Desastre
                    </label>

                    <select
                      value={form.nivel_desastre}
                      onChange={(e) =>
                        updateForm("nivel_desastre", e.target.value)
                      }
                      className="input"
                    >
                      <option value="I">Nível I</option>
                      <option value="II">Nível II</option>
                      <option value="III">Nível III</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Protocolo S2ID
                    </label>

                    <input
                      type="text"
                      value={form.protocolo_s2id}
                      onChange={(e) =>
                        updateForm("protocolo_s2id", e.target.value)
                      }
                      placeholder="Ex.: REC-RJ-3302056-20250101"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">
                      COBRADE
                    </label>

                    <input
                      type="text"
                      value={form.cobrade}
                      onChange={(e) =>
                        updateForm("cobrade", e.target.value)
                      }
                      placeholder="Ex.: 1.3.2.1.4"
                      className="input"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* ======================================================
                MUNICÍPIOS
            ====================================================== */}

            {!form.fora_area && form.categoria === "MUNICIPIO" && (

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

                <div className="border-b border-slate-100 px-6 py-5">

                  <div className="flex items-center gap-3">

                    <Building2
                      size={20}
                      className="text-slate-700"
                    />

                    <div>
                      <h3 className="text-lg font-black text-slate-800">
                        Municípios Vinculados
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Selecione os municípios envolvidos.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="p-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {municipios.map((municipio) => {

                      const ativo =
                        municipiosSelecionados[municipio.id]

                      return (
                        <div
                          key={municipio.id}
                          className={`
                            rounded-2xl border p-5 transition-all
                            ${
                              ativo
                                ? tipoRegistro === "ANORMALIDADE"
                                  ? "border-red-300 bg-red-50"
                                  : "border-slate-900 bg-slate-100"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }
                          `}
                        >

                          <label className="flex items-start gap-4 cursor-pointer">

                            <input
                              type="checkbox"
                              checked={!!ativo}
                              onChange={() =>
                                toggleMunicipio(municipio.id)
                              }
                              className="mt-1 h-5 w-5 rounded border-slate-300"
                            />

                            <div className="flex-1">

                              <div className="flex items-center justify-between gap-3">

                                <div>
                                  <p className="font-black text-slate-800">
                                    {municipio.nome}
                                  </p>
                                </div>

                                {ativo && (
                                  <CheckCircle2
                                    size={18}
                                    className={
                                      tipoRegistro === "ANORMALIDADE"
                                        ? "text-red-600"
                                        : "text-slate-900"
                                    }
                                  />
                                )}

                              </div>

                              {/* DADOS HUMANOS */}
                              {ativo &&
                                tipoRegistro === "ANORMALIDADE" && (

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">

                                  {[
                                    {
                                      campo: "afetados",
                                      label: "Afetados"
                                    },
                                    {
                                      campo: "desalojados",
                                      label: "Desalojados"
                                    },
                                    {
                                      campo: "desabrigados",
                                      label: "Desabrigados"
                                    },
                                    {
                                      campo: "mortos",
                                      label: "Mortos"
                                    },
                                    {
                                      campo: "desaparecidos",
                                      label: "Desaparecidos"
                                    }
                                  ].map((item) => (

                                    <div key={item.campo}>

                                      <label className="text-[11px] font-bold uppercase tracking-wide text-red-700">
                                        {item.label}
                                      </label>

                                      <input
                                        type="number"
                                        min="0"
                                        value={
                                          ativo.dados[item.campo]
                                        }
                                        onChange={(e) =>
                                          updateDado(
                                            municipio.id,
                                            item.campo,
                                            e.target.value
                                          )
                                        }
                                        className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                      />

                                    </div>
                                  ))}

                                </div>
                              )}

                            </div>

                          </label>

                        </div>
                      )
                    })}

                  </div>

                </div>

              </div>
            )}

            {/* ======================================================
                FORA DA ÁREA
            ====================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="p-6">

                <label className="flex items-start gap-4 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={form.fora_area}
                    onChange={(e) =>
                      updateForm("fora_area", e.target.checked)
                    }
                    className="mt-1 h-5 w-5 rounded border-slate-300"
                  />

                  <div>
                    <p className="font-black text-slate-800">
                      Evento fora da área da REDEC
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Utilize esta opção quando o evento não estiver
                      vinculado aos municípios da regional.
                    </p>
                  </div>

                </label>

              </div>
            </div>

            {/* ======================================================
                DESCRIÇÃO
            ====================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              <div className="border-b border-slate-100 px-6 py-5">

                <div className="flex items-center gap-3">

                  <FileText
                    size={20}
                    className="text-slate-700"
                  />

                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      Observações e Descrição
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Informações adicionais do evento.
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-6">

                <textarea
                  rows={6}
                  value={form.descricao}
                  onChange={(e) =>
                    updateForm("descricao", e.target.value)
                  }
                  placeholder="Descreva detalhes importantes do evento..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-200 resize-none"
                />

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="border-t border-slate-200 bg-white px-8 py-5">

          <div className="flex items-center justify-between gap-4">

            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-700">
                Sistema de Gestão Operacional
              </p>

              <p className="text-xs text-slate-500 mt-1">
                REDEC • Registro de eventos e ocorrências
              </p>
            </div>

            <div className="flex gap-3 ml-auto">

              <button
                onClick={onClose}
                disabled={loading}
                className="h-12 px-6 rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEvento}
                disabled={loading}
                className={`
                  h-12 px-8 rounded-2xl text-sm font-black text-white transition-all flex items-center gap-3
                  ${
                    tipoRegistro === "ANORMALIDADE"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-slate-900 hover:bg-slate-800"
                  }
                  disabled:opacity-60
                `}
              >
                {loading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {loading
                  ? "Salvando..."
                  : evento
                    ? "Salvar Alterações"
                    : "Criar Evento"}
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          CLASSES AUXILIARES
      ====================================================== */}

      <style jsx>{`
        .label {
          display: block;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgb(71 85 105);
          margin-bottom: 10px;
        }

        .input {
          width: 100%;
          height: 56px;
          border-radius: 18px;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding-left: 18px;
          padding-right: 18px;
          font-size: 14px;
          font-weight: 600;
          color: rgb(15 23 42);
          outline: none;
          transition: all 0.2s;
        }

        .input:focus {
          border-color: rgb(15 23 42);
          background: white;
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.08);
        }
      `}</style>

    </div>
  )
}
