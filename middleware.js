/* middleware.js */

import { NextResponse } from "next/server"

export function middleware(request){

const url = request.nextUrl.clone()

const isLogin = url.pathname.startsWith("/login")

/* verifica se existe token do supabase */

const accessToken = request.cookies.get("sb-access-token")

/* se não estiver logado e tentar acessar páginas protegidas */

if(!accessToken && !isLogin){
url.pathname = "/login"
return NextResponse.redirect(url)
}

return NextResponse.next()

}

export const config = {
matcher:[
"/dashboard/:path*",
"/monitoramento/:path*",
"/equipe/:path*",
"/boletins/:path*",
"/agenda/:path*",
"/viaturas/:path*",
"/municipios/:path*",
"/patrimonio/:path*",
"/configuracoes/:path*"
]
}
