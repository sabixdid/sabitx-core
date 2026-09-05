import { NextRequest, NextResponse } from "next/server";
function rewrite(request:NextRequest,path:string){const url=request.nextUrl.clone();url.pathname=path;return NextResponse.rewrite(url);}
export function proxy(request:NextRequest){
  const host=(request.headers.get("host")||request.nextUrl.host).split(":")[0].toLowerCase();
  if(host==="www.sabitx.run"){const url=request.nextUrl.clone();url.protocol="https:";url.hostname="sabitx.run";url.port="";return NextResponse.redirect(url,308);}
  const path=request.nextUrl.pathname;
  if(host==="sabitx.run"&&path==="/")return rewrite(request,"/access");
  if(path==="/api/agent")return rewrite(request,"/api/runtime/agent");
  if(path==="/api/status")return rewrite(request,"/api/runtime/status");
  return NextResponse.next();
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
