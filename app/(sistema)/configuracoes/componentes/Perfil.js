/* app/(sistema)/configuracoes/componentes/Perfil.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ModalUsuario from "./ModalUsuario"

export default function Perfil() {

  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)

  // =========================
  // 🔄 CARREGAR USUÁRIOS
  // =========================
  async function carregarUsuarios() {
    setLoading(true)

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("criado_em", { ascending: false })

    if (!error) {
      setUsuarios(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-black text-slate-800">
          👤 Usuários do Sistema
        </h2>
        <p className="text-slate-500 text-sm">
          Gerencie acessos e permissões
        </p>
      </div>

      {/* LISTA */}
      <div className="bg-white rounded-2xl border overflow-hidden">

        {loading ? (
          <p className="p-6 text-slate-500">Carregando...</p>
        ) : (
          <div className="divide-y">

            {usuarios.map((user) => (
              <div
                key={user.id}
                className="p-4 flex justify-between items-center hover:bg-slate-50 transition"
              >

                {/* INFO */}
                <div>
                  <p className="font-bold text-slate-800">
                    {user.email}
                  </p>

                  <p className="text-sm text-slate-500">
                    RG: {user.rg || "-"} • {user.orgao || "-"}
                  </p>

                  <div className="flex gap-2 mt-1 text-xs">
                    <span className={`px-2 py-1 rounded-full font-semibold
                      ${user.nivel === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                      }`}>
                      {user.nivel}
                    </span>

                    <span className={`px-2 py-1 rounded-full font-semibold
                      ${user.ativo
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                      }`}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                {/* BOTÃO */}
                <button
                  onClick={() => setUsuarioSelecionado(user)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Editar
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* MODAL */}
      {usuarioSelecionado && (
        <ModalUsuario
          usuario={usuarioSelecionado}
          onClose={() => setUsuarioSelecionado(null)}
          onAtualizado={carregarUsuarios}
        />
      )}

    </div>
  )
}
