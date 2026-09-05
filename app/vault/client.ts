import type { VaultFile } from "@/app/lib/vault-types";
export async function responseJson<T>(response: Response): Promise<T> {
  const body=await response.json().catch(()=>({error:"The server returned an unreadable response."}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
  return body as T;
}
export async function downloadFile(file: VaultFile, key?: string) {
  const response=await fetch(`/api/vault/files/${encodeURIComponent(file.id)}`,{cache:"no-store",headers:key?{"x-sabitx-key":key}:{}});
  if (!response.ok) await responseJson(response);
  const url=URL.createObjectURL(await response.blob());
  const anchor=document.createElement("a"); anchor.href=url; anchor.download=file.name;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function fileSize(bytes:number){return bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(1)} MB`;}
