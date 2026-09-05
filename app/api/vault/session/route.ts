import { NextRequest } from "next/server";
import { sameOrigin } from "@/app/lib/runtime-access";
import { vaultBody, vaultCookie, vaultFailure, vaultJson } from "@/app/lib/vault-http";
import { closeVaultSession, readVaultAccess, redeemVaultGrant } from "@/app/lib/vault-store";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=30;
export async function GET(request: NextRequest) {
  const token=request.cookies.get(vaultCookie(request).name)?.value;
  if (!token) return vaultJson({error:"Shared-drive clearance required."},401);
  try { return vaultJson(await readVaultAccess(token)); }
  catch(error) { return vaultFailure(error); }
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return vaultJson({error:"Origin denied."},403);
  try {
    const body=await vaultBody(request);
    const {token,maxAge}=await redeemVaultGrant(body.share,body.passcode);
    const response=vaultJson({ok:true});
    response.cookies.set({...vaultCookie(request),value:token,maxAge});
    return response;
  } catch(error) { return vaultFailure(error); }
}
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return vaultJson({error:"Origin denied."},403);
  try {
    const settings=vaultCookie(request);
    await closeVaultSession(request.cookies.get(settings.name)?.value);
    const response=vaultJson({ok:true});
    response.cookies.set({...settings,value:"",maxAge:0});
    return response;
  } catch(error) { return vaultFailure(error); }
}
