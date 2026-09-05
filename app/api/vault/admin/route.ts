import { NextRequest } from "next/server";
import { hasRunAccess, sameOrigin } from "@/app/lib/runtime-access";
import { boundedBody, vaultBody, vaultFailure, vaultJson } from "@/app/lib/vault-http";
import { MAX_VAULT_FILE_BYTES, VaultError } from "@/app/lib/vault-policy";
import { initializeVault, readVaultAdmin, createVaultFolder, uploadVaultFile, createVaultGrant, revokeVaultGrant } from "@/app/lib/vault-store";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=30;
export async function GET(request: NextRequest) {
  if (!hasRunAccess(request)) return vaultJson({error:"Owner clearance required."},401);
  try { return vaultJson(await readVaultAdmin(request.nextUrl.searchParams.get("folder") || undefined)); }
  catch(error) { return vaultFailure(error); }
}
export async function POST(request: NextRequest) {
  if (!hasRunAccess(request)) return vaultJson({error:"Owner clearance required."},401);
  if (!sameOrigin(request)) return vaultJson({error:"Origin denied."},403);
  try {
    if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
      const raw=await boundedBody(request,MAX_VAULT_FILE_BYTES+131072);
      const form=await new Request(request.url,{method:"POST",headers:{"Content-Type":request.headers.get("content-type")!},body:new Uint8Array(raw)}).formData();
      const file=form.get("file");
      if (!(file instanceof File)) throw new VaultError("A file is required.");
      return vaultJson(await uploadVaultFile(form.get("folderId"),file.name,new Uint8Array(await file.arrayBuffer())),201);
    }
    const body=await vaultBody(request);
    switch(body.action) {
      case "initialize": await initializeVault(); return vaultJson({ok:true});
      case "create_folder": return vaultJson(await createVaultFolder(body.name),201);
      case "create_grant": return vaultJson(await createVaultGrant(body.folderId,body.hours),201);
      case "revoke_grant": await revokeVaultGrant(body.grantId); return vaultJson({ok:true});
      default: throw new VaultError("Unknown action.");
    }
  } catch(error) { return vaultFailure(error); }
}
