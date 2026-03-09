/* app/login/page.js */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  const router = useRouter()

  const [rg, setRg] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {

    e.preventDefault()

    setErro("")
    setLoading(true)

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("rg", rg)
      .eq("senha", senha)
      .single()

    if (error || !data) {
      setErro("RG ou senha inválidos")
      setLoading(false)
      return
    }

    localStorage.setItem("usuario", JSON.stringify(data))

    router.push("/dashboard")
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        {/* Logo e título */}
        <div className="text-center mb-6">

          <Image
            src="/logotipo_redec_norte.png"
            alt="REDEC 10"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />

          <h1 className="text-xl font-bold text-slate-800">
            Sistema Integrado REDEC 10 Norte
          </h1>

          <p className="text-sm text-slate-500">
            Gestão Estratégica em Defesa Civil
          </p>

        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="text"
            value={rg}
            onChange={(e) => setRg(e.target.value.replace(/\D/g, ""))}
            placeholder="RG (somente números)"
            className="w-full border p-2 rounded-lg"
            required
          />

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="w-full border p-2 rounded-lg"
            required
          />

          {erro && (
            <p className="text-red-500 text-sm">{erro}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        {/* Links */}
        <div className="flex justify-between mt-4 text-sm">

          <Link href="/recuperar-senha" className="text-blue-600 hover:underline">
            Esqueci minha senha
          </Link>

          <Link href="/cadastro" className="text-blue-600 hover:underline">
            Criar conta
          </Link>

        </div>

      </div>

    </div>
  )
}
