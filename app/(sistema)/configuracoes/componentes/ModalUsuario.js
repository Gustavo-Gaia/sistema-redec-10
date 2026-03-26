/* app/(sistema)/configuracoes/componentes/ModalUsuario.js */

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ModalUsuario({ usuario, onClose, onAtualizado }) {

  const [form, setForm] = useState({
    email: usuario.email || "",
    rg: usuario.rg || "",
    orgao: usuario.orgao || "",
    nivel: usuario.nivel || "usuario",
    ativo: usuario.ativo ?? true
  })

  const [salvando, setSalvando] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    })
  }

  async function salvar() {
    try {
      setSalvando(true)

      const { error } = await supabase
        .from("usuarios")
        .update(form)
        .eq("id", usuario.id)

      if (error) {
        alert("Erro ao salvar")
        return
      }

      alert("Usuário atualizado com sucesso")

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

        {/* EMAIL */}
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          placeholder="Email"
        />

        {/* RG */}
        <input
          name="rg"
          value={form.rg}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          placeholder="RG"
        />

        {/* ORGÃO */}
        <input
          name="orgao"
          value={form.orgao}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          placeholder="Órgão"
        />

        {/* NÍVEL */}
        <select
          name="nivel"
          value={form.nivel}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        >
          <option value="usuario">Usuário</option>
          <option value="admin">Admin</option>
        </select>

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
