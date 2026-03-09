/* app/login/page.js */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
export default function LoginPage(){

  const router = useRouter()

  const [rg,setRg] = useState("")
  const [senha,setSenha] = useState("")
  const [erro,setErro] = useState("")

  const handleLogin = async(e)=>{
    e.preventDefault()

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("rg",rg)
      .eq("senha",senha)
      .single()

    if(error || !data){
      setErro("RG ou senha inválidos")
      return
    }

    localStorage.setItem("usuario",JSON.stringify(data))

    router.push("/dashboard")
  }

  return(

  <div className="min-h-screen flex items-center justify-center bg-slate-100">

    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

      <div className="text-center mb-6">

        <img src="/logotipo_redec_norte.png" className="h-20 mx-auto mb-4"/>

        <h1 className="text-xl font-bold">
          Sistema Integrado REDEC 10 Norte
        </h1>

      </div>

      <form onSubmit={handleLogin} className="space-y-4">

        <input
          type="text"
          value={rg}
          onChange={(e)=>setRg(e.target.value.replace(/\D/g,""))}
          placeholder="RG"
          className="w-full border p-2 rounded-lg"
        />

        <input
          type="password"
          value={senha}
          onChange={(e)=>setSenha(e.target.value)}
          placeholder="Senha"
          className="w-full border p-2 rounded-lg"
        />

        {erro && (
          <p className="text-red-500 text-sm">{erro}</p>
        )}

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
          Entrar
        </button>

      </form>

      <div className="flex justify-between mt-4 text-sm">

        <a href="/recuperar-senha" className="text-blue-600">
          Esqueci minha senha
        </a>

        <a href="/cadastro" className="text-blue-600">
          Criar conta
        </a>

      </div>

    </div>

  </div>

  )
}
