/* app/(sistema)/configuracoes/componentes/ModalUsuario.js */

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ModalUsuario({ usuario, onClose, onAtualizado }) {

  const [form, setForm] = useState({
    rg: usuario.rg || "",
    orgao: usuario.orgao || "",
    nivel: usuario.nivel || "usuario",
    ativo: usuario.ativo ?? true
  })

  const [salvando, setSalvando] = useState(false)

  function somenteNumero(v) {
    return v.replace(/\D/g, "")
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setForm({
      ...form,
      [name]: type === "checkbox"
        ? checked
        : name === "rg"
        ? somenteNumero(value)
        : value
    })
  }

  async function salvar() {
    try {
      setSalvando(true)

      // =========================
      // 🔒 VALIDAR RG DUPLICADO
      // =========================
      const { data: existe } = await supabase
        .from("usuarios")
        .select("id")
        .eq("rg", form.rg)
        .neq("id", usuario.id)
        .maybeSingle()

      if (existe) {
        alert("RG já está em uso por outro usuário")
        return
      }

      // =========================
      // 💾 ATUALIZA SOMENTE CAMPOS SEGUROS
      // =========================
      const { error } = await supabase
        .from("usuarios")
        .update({
          rg: form.rg,
          orgao: form.orgao,
          nivel: form.nivel,
          ativo: form.ativo
        })
        .eq("id", usuario.id)

      if (error) {
        alert("Erro ao salvar")
        return
      }

      alert("✅ Usuário atualizado com sucesso")

      onAtualizado()
      onClose()

    } catch (err) {
      alert("Erro inesperado")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">

        <h3 className="text-xl font-bold text-slate-800">
          Editar Usuário
        </h3>

        {/* EMAIL (SOMENTE VISUALIZAÇÃO) */}
        <div>
          <label className="text-xs text-slate-500">Email (login)</label>
          <input
            value={usuario.email || ""}
            disabled
            className="w-full border rounded-lg p-2 bg-slate-100 text-slate-500 cursor-not-allowed"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            O email é usado no login e não pode ser alterado aqui
          </p>
        </div>

        {/* RG */}
        <div>
          <label className="text-xs text-slate-500">RG</label>
          <input
            name="rg"
            value={form.rg}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Somente números"
          />
        </div>

        {/* ORGÃO */}
        <div>
          <label className="text-xs text-slate-500">Órgão</label>
          <input
            name="orgao"
            value={form.orgao}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* NÍVEL */}
        <div>
          <label className="text-xs text-slate-500">Nível de acesso</label>
          <select
            name="nivel"
            value={form.nivel}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="usuario">Usuário</option>
            <option value="operador">Operador</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* ATIVO */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="ativo"
            checked={form.ativo}
            onChange={handleChange}
          />
          Usuário ativo
        </label>

        {/* ALERTA */}
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs p-3 rounded-lg">
          Alterações de RG impactam o login do usuário.
        </div>

        {/* BOTÕES */}
        <div className="flex justify-end gap-2 pt-4">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={salvar}
            disabled={salvando}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

        </div>

      </div>
    </div>
  )
}
