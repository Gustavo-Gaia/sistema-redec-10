/* app/login/page.js */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { supabase } from "@/lib/supabase"

export default function LoginPage(){

const router = useRouter()

const [rg,setRg] = useState("")
const [senha,setSenha] = useState("")
const [erro,setErro] = useState("")
const [loading,setLoading] = useState(false)

const handleLogin = async (e)=>{

e.preventDefault()

setErro("")
setLoading(true)

/* busca usuário pelo RG */

const { data:userData, error:userError } = await supabase
.from("usuarios")
.select("id,email,ativo")
.eq("rg",rg)
.maybeSingle()

if(userError || !userData){
setErro("RG ou senha inválidos")
setLoading(false)
return
}

/* verifica se usuário está ativo */

if(!userData.ativo){
setErro("Usuário desativado")
setLoading(false)
return
}

/* login usando auth */

const { error:loginError } = await supabase.auth.signInWithPassword({
email:userData.email,
password:senha
})

if(loginError){
setErro("RG ou senha inválidos")
setLoading(false)
return
}

/* cookie simples para middleware */

document.cookie = `usuario=${userData.id}; path=/; max-age=86400`

router.push("/dashboard")

}

return(

<div className="min-h-screen flex items-center justify-center bg-slate-100">

<div className="w-full max-w-md p-4">

<div className="bg-white p-8 rounded-2xl shadow-xl">

{/* LOGO */}

<div className="text-center mb-6">

<div className="flex justify-center">

<Image
src="/logotipo_redec_norte.png"
alt="REDEC 10"
width={90}
height={90}
priority
className="drop-shadow-xl"
/>

</div>

<h1 className="text-xl font-bold text-slate-800 mt-4">
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
onChange={(e)=>setRg(e.target.value.replace(/\D/g,""))}
placeholder="RG (somente números)"
className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
required
/>

<input
type="password"
value={senha}
onChange={(e)=>setSenha(e.target.value)}
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

<Link
href="/login/recuperar-senha"
className="text-blue-600 hover:underline"
>
Esqueci minha senha
</Link>

<Link
href="/login/cadastro"
className="text-blue-600 hover:underline"
>
Criar conta
</Link>

</div>

</div>

</div>

</div>

)

}
