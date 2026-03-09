/* app/login/cadastro/page.js */

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Cadastro() {

const router = useRouter()

const [rg,setRg] = useState("")
const [email,setEmail] = useState("")
const [senha,setSenha] = useState("")
const [confirmar,setConfirmar] = useState("")
const [orgao,setOrgao] = useState("SEDEC")
const [msg,setMsg] = useState("")
const [loading,setLoading] = useState(false)

function somenteNumero(v){
return v.replace(/\D/g,"")
}

async function cadastrar(e){

e.preventDefault()
setMsg("")
setLoading(true)

if(senha !== confirmar){
setMsg("As senhas não conferem")
setLoading(false)
return
}

const { data:existe } = await supabase
.from("usuarios")
.select("rg")
.eq("rg",rg)
.single()

if(existe){
setMsg("Usuário já cadastrado. Utilize recuperar senha.")
setLoading(false)
return
}

const { error } = await supabase
.from("usuarios")
.insert([{ rg, senha, email, orgao }])

if(error){
setMsg("Erro ao cadastrar usuário")
setLoading(false)
return
}

setMsg("Usuário criado com sucesso")

setTimeout(()=>{
router.push("/login")
},2000)

}

return(

<div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">

<div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

<h1 className="text-xl font-bold text-center mb-6">
Criar Conta
</h1>

<form onSubmit={cadastrar} className="space-y-4">

<input
type="text"
placeholder="RG (somente números)"
value={rg}
onChange={(e)=>setRg(somenteNumero(e.target.value))}
className="w-full border p-2 rounded-lg"
/>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border p-2 rounded-lg"
/>

<select
value={orgao}
onChange={(e)=>setOrgao(e.target.value)}
className="w-full border p-2 rounded-lg"
>
<option>SEDEC</option>
<option>CBMERJ</option>
<option>OUTROS</option>
</select>

<input
type="password"
placeholder="Senha"
value={senha}
onChange={(e)=>setSenha(e.target.value)}
className="w-full border p-2 rounded-lg"
/>

<input
type="password"
placeholder="Confirmar senha"
value={confirmar}
onChange={(e)=>setConfirmar(e.target.value)}
className="w-full border p-2 rounded-lg"
/>

<button
disabled={loading}
className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
>
{loading ? "Cadastrando..." : "Cadastrar usuário"}
</button>

</form>

{msg && (
<p className="text-sm text-red-500 mt-4 text-center">{msg}</p>
)}

<div className="text-center mt-4 text-sm">
<Link href="/login" className="text-blue-600 hover:underline">
Voltar para login
</Link>
</div>

</div>
</div>

)

}
