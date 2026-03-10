/* app/login/cadastro/page.js */

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function Cadastro(){

const router = useRouter()

const [rg,setRg] = useState("")
const [email,setEmail] = useState("")
const [senha,setSenha] = useState("")
const [confirmar,setConfirmar] = useState("")
const [orgao,setOrgao] = useState("SEDEC")
const [msg,setMsg] = useState("")
const [loading,setLoading] = useState(false)
const [forca,setForca] = useState(0)

function somenteNumero(v){
return v.replace(/\D/g,"")
}

/* força da senha */

function calcularForca(valor){

let pontos = 0

if(valor.length >= 6) pontos++
if(/[A-Z]/.test(valor)) pontos++
if(/[0-9]/.test(valor)) pontos++
if(/[^A-Za-z0-9]/.test(valor)) pontos++

setForca(pontos)

}

async function cadastrar(e){

e.preventDefault()

setMsg("")
setLoading(true)

if(!rg || !email || !senha){
setMsg("Preencha todos os campos")
setLoading(false)
return
}

if(senha !== confirmar){
setMsg("As senhas não conferem")
setLoading(false)
return
}

/* verifica se RG já existe */

const { data:existe } = await supabase
.from("usuarios")
.select("rg")
.eq("rg",rg)
.maybeSingle()

if(existe){
setMsg("RG já cadastrado")
setLoading(false)
return
}

/* cria usuário no auth */

const { data, error } = await supabase.auth.signUp({
email:email,
password:senha
})

if(error){
setMsg(error.message)
setLoading(false)
return
}

/* atualiza dados adicionais */

await supabase
.from("usuarios")
.update({
rg,
orgao
})
.eq("user_id",data.user.id)

setMsg("Usuário criado com sucesso!")

setTimeout(()=>{
router.push("/login")
},2000)

setLoading(false)

}

return(

<div className="min-h-screen relative flex items-center justify-center overflow-hidden">

{/* LOGO FUNDO */}

<div className="absolute inset-0 flex items-center justify-center opacity-10">

<Image
src="/logotipo_redec_norte.png"
alt="REDEC"
width={700}
height={700}
priority
/>

</div>

{/* OVERLAY */}

<div className="absolute inset-0 bg-slate-100/80"></div>

{/* CARD */}

<div className="relative w-full max-w-md">

<div className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">

{/* LOGO */}

<div className="text-center mb-6">

<Image
src="/logotipo_redec_norte.png"
alt="REDEC"
width={90}
height={90}
className="mx-auto mb-4"
priority
/>

<h1 className="text-xl font-bold">
Criar conta
</h1>

<p className="text-sm text-slate-500 mt-1">
Cadastro de usuário do sistema
</p>

</div>

<form onSubmit={cadastrar} className="space-y-4">

<input
type="text"
placeholder="RG (somente números)"
value={rg}
onChange={(e)=>setRg(somenteNumero(e.target.value))}
className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
/>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
/>

<select
value={orgao}
onChange={(e)=>setOrgao(e.target.value)}
className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
>
<option>SEDEC</option>
<option>CBMERJ</option>
<option>OUTROS</option>
</select>

<input
type="password"
placeholder="Senha"
value={senha}
onChange={(e)=>{
setSenha(e.target.value)
calcularForca(e.target.value)
}}
className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
/>

{/* BARRA FORÇA SENHA */}

{senha && (

<div className="w-full bg-slate-200 h-2 rounded">

<div
className={`h-2 rounded transition-all duration-300
${forca === 1 ? "w-1/4 bg-red-500" : ""}
${forca === 2 ? "w-2/4 bg-orange-500" : ""}
${forca === 3 ? "w-3/4 bg-yellow-500" : ""}
${forca === 4 ? "w-full bg-green-500" : ""}
`}
></div>

</div>

)}

<input
type="password"
placeholder="Confirmar senha"
value={confirmar}
onChange={(e)=>setConfirmar(e.target.value)}
className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
/>

<button
disabled={loading}
className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white py-2 rounded-lg font-semibold shadow-md"
>

{loading ? (
<>
<span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
Cadastrando...
</>
) : (
"Cadastrar usuário"
)}

</button>

</form>

{msg && (
<p className="text-sm text-red-500 mt-4 text-center">
{msg}
</p>
)}

<div className="text-center mt-6 text-sm">

<Link
href="/login"
className="text-blue-600 hover:underline font-medium"
>
Voltar para login
</Link>

</div>

</div>

</div>

</div>

)

}
