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

    try {
      /* 1. BUSCAR USUÁRIO PELO RG */
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("id, email, ativo")
        .eq("rg", rg)
        .single()

      if (userError || !userData) {
        setErro("Usuário não encontrado")
        return
      }

      if (!userData.ativo) {
        setErro("Usuário desativado")
        return
      }

      /* 2. LOGIN NO AUTH */
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: userData.email,
          password: senha
        })

      if (loginError) {
        setErro("Senha incorreta")
        return
      }

      /* 3. GARANTIR SESSÃO */
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        setErro("Erro ao criar sessão")
        return
      }

      /* 4. COOKIE AUXILIAR (OPCIONAL) */
      document.cookie = `usuario=${userData.id}; path=/; max-age=86400; SameSite=Lax`

      /* 5. REDIRECIONAMENTO CORRETO */
      router.push("/dashboard")

    } catch (err) {
      console.error(err)
      setErro("Erro inesperado ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">

      {/* FUNDO */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Image
          src="/logotipo_redec_norte.png"
          alt="REDEC"
          width={600}
          height={600}
          priority
        />
      </div>

      <div className="absolute inset-0 bg-slate-100/80"></div>

      {/* CARD */}
      <div className="relative bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <div className="text-center mb-6">
          <Image
            src="/logotipo_redec_norte.png"
            alt="REDEC 10"
            width={90}
            height={90}
            className="mx-auto mb-4"
          />

          <h1 className="text-xl font-bold text-slate-800">
            Sistema Integrado REDEC 10 Norte
          </h1>

          <p className="text-sm text-slate-500">
            Gestão Estratégica em Defesa Civil
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="text"
            value={rg}
            onChange={(e) => setRg(e.target.value.replace(/\D/g, ""))}
            placeholder="RG (somente números)"
            className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {erro && (
            <p className="text-red-500 text-sm text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        <div className="flex justify-between mt-4 text-sm">
          <Link href="/login/recuperar-senha" className="text-blue-600 hover:underline">
            Esqueci minha senha
          </Link>

          <Link href="/login/cadastro" className="text-blue-600 hover:underline">
            Criar conta
          </Link>
        </div>

      </div>
    </div>
  )
}
