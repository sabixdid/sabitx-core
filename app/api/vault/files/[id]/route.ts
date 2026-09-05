import { NextRequest, NextResponse } from "next/server";
import { hasRunAccess } from "@/app/lib/runtime-access";
import { PRIVATE_HEADERS, vaultCookie, vaultFailure, vaultJson } from "@/app/lib/vault-http";
import { downloadVaultFile } from "@/app/lib/vault-store";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request: NextRequest,{params}:{params:Promise<{id:string}>}) {
  const owner=hasRunAccess(request), token=request.cookies.get(vaultCookie(request).name)?.value;
  if (!owner && !token) return vaultJson({error:"Clearance required."},401);
  try {
    const file=await downloadVaultFile((await params).id,token,owner);
    return new NextResponse(new Uint8Array(file.bytes),{headers:{...PRIVATE_HEADERS,
      "Content-Type":file.mime,"Content-Disposition":`attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Content-Security-Policy":"default-src 'none'; sandbox","X-Frame-Options":"DENY"}});
  } catch(error) { return vaultFailure(error); }
}
