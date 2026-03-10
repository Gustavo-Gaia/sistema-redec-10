/* app/login/nova-senha/page.js */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"

export default function NovaSenha(){

const router = useRouter()

const [senha,setSenha] = useState("")
const [confirmar,setConfirmar] = useState("")
const [msg,setMsg] = useState("")
const [loading,setLoading] = useState(false)
const [sessaoValida,setSessaoValida] = useState(false)
const [forca,setForca] = useState(0)

/* verificar força da senha */

function calcularForca(valor){

let pontos = 0

if(valor.length >= 6) pontos++
if(/[A-Z]/.test(valor)) pontos++
if(/[0-9]/.test(valor)) pontos++
if(/[^A-Za-z0-9]/.test(valor)) pontos++

setForca(pontos)

}

/* verifica sessão do link */

useEffect(()=>{

async function verificarSessao(){

const { data } = await supabase.auth.getSession()

if(data.session){
setSessaoValida(true)
}else{
setMsg("Link de recuperação inválido ou expirado")
}

}

verificarSessao()

},[])

async function redefinir(e){

e.preventDefault()

setMsg("")

if(!sessaoValida){
setMsg("Link inválido ou expirado")
return
}

if(senha.length < 6){
setMsg("A senha deve ter pelo menos 6 caracteres")
return
}

if(senha !== confirmar){
setMsg("As senhas não conferem")
return
}

setLoading(true)

const { error } = await supabase.auth.updateUser({
password: senha
})

if(error){
console.log(error)
setMsg("Erro ao redefinir senha")
setLoading(false)
return
}

setMsg("Senha atualizada com sucesso!")

setTimeout(()=>{
router.push("/login")
},2000)

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
Nova senha
</h1>

<p className="text-sm text-slate-500 mt-1">
Defina sua nova senha
</p>

</div>

<form onSubmit={redefinir} className="space-y-4">

<input
type="password"
placeholder="Nova senha"
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
placeholder="Confirmar nova senha"
value={confirmar}
onChange={(e)=>setConfirmar(e.target.value)}
className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
/>

<button
disabled={loading || !sessaoValida}
className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white py-2 rounded-lg font-semibold shadow-md disabled:opacity-50"
>

{loading ? (
<>
<span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
Salvando...
</>
) : (
"Redefinir senha"
)}

</button>

</form>

{msg && (
<p className="text-center mt-4 text-sm text-blue-600">
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
