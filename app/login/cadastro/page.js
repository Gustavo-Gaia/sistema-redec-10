/* app/login/cadastro/page.js */

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Cadastro(){

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
.single()

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
required
/>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full border p-2 rounded-lg"
required
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
required
/>

<input
type="password"
placeholder="Confirmar senha"
value={confirmar}
onChange={(e)=>setConfirmar(e.target.value)}
className="w-full border p-2 rounded-lg"
required
/>

<button
disabled={loading}
className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
>
{loading ? "Cadastrando..." : "Cadastrar usuário"}
</button>

</form>

{msg && (
<p className="text-sm text-red-500 mt-4 text-center">
{msg}
</p>
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
