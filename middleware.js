/* middleware.js */

import { NextResponse } from "next/server"

export function middleware(request){

const url = request.nextUrl.clone()

const isLoginPage = url.pathname.startsWith("/login")

const accessToken = request.cookies.get("sb-access-token")

const usuarioCookie = request.cookies.get("usuario")

const isLogged = accessToken || usuarioCookie

if(!isLogged && !isLoginPage){
url.pathname = "/login"
return NextResponse.redirect(url)
}

if(isLogged && isLoginPage){
url.pathname = "/dashboard"
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
