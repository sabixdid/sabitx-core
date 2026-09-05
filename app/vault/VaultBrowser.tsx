"use client";
import { useEffect,useState } from "react";
import type { FormEvent } from "react";
import type { VaultAccess,VaultFile } from "@/app/lib/vault-types";
import { responseJson,downloadFile,fileSize } from "./client";
import styles from "./vault.module.css";
export default function VaultBrowser(){
  const [share,setShare]=useState(""),[passcode,setPasscode]=useState(""),[access,setAccess]=useState<VaultAccess|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("share")||"";setShare(id);
    // A newly opened share link must be redeemed, not confused with another folder's existing session.
    if(!id) fetch("/api/vault/session",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{if(data)setAccess(data);}).catch(()=>{});
  },[]);
  async function unlock(event:FormEvent){event.preventDefault();setBusy(true);setError("");
    try{let id=share.trim();if(id.startsWith("https://"))id=new URL(id).searchParams.get("share")||"";
      await responseJson(await fetch("/api/vault/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({share:id,passcode})}));
      setPasscode("");setAccess(await responseJson<VaultAccess>(await fetch("/api/vault/session",{cache:"no-store"})));
    }catch(e){setError(e instanceof Error?e.message:"Access unavailable.");}finally{setBusy(false);}}
  async function lock(){setBusy(true);setError("");try{await responseJson(await fetch("/api/vault/session",{method:"DELETE"}));setAccess(null);}catch(e){setError(e instanceof Error?e.message:"Unable to close the session.");}finally{setBusy(false);}}
  async function download(file:VaultFile){setError("");try{await downloadFile(file);}catch(e){setError(e instanceof Error?e.message:"Download unavailable.");}}
  return <main className={styles.page}><header className={styles.nav}><a href="/access">SABITX / RUN</a><a href="/vault/manage">OWNER CONSOLE ↗</a></header>
    <section className={styles.header}><p>VAULT / SCOPED ACCESS</p><h1>{access?access.folderName:<>The right files.<br/><span>Nothing else.</span></>}</h1><p className={styles.description}>A shared link and its passcode open one folder. They never grant operator access.</p></section>
    <section className={styles.card}>{!access?<form onSubmit={unlock} className={styles.form}>
      <label htmlFor="vault-share">Shared link or reference</label><input id="vault-share" value={share} onChange={e=>setShare(e.target.value)} autoComplete="off" maxLength={400} required disabled={busy}/>
      <label htmlFor="vault-passcode">Folder passcode</label><input id="vault-passcode" type="password" value={passcode} onChange={e=>setPasscode(e.target.value)} autoComplete="off" maxLength={128} required disabled={busy}/>
      <button disabled={busy}>{busy?"VERIFYING…":"OPEN SHARED FOLDER →"}</button><small>No passcodes are saved in browser storage.</small>
    </form>:<><div className={styles.toolbar}><span>GRANT EXPIRES / {new Date(access.expiresAt).toLocaleString()}</span><button onClick={lock} disabled={busy}>LOCK FOLDER</button></div>
      <div className={styles.files}>{access.files.length?access.files.map(file=><article key={file.id}><div><strong>{file.name}</strong><small>{fileSize(file.size)}</small></div><button onClick={()=>download(file)}>DOWNLOAD ↓</button></article>):<p>This folder has no files yet.</p>}</div>
      <p className={styles.subtle}>Downloads are checked against the current grant on every request. The session ends after one hour or sooner if access expires or is revoked.</p></>}
      {error&&<p className={styles.error} role="alert">{error}</p>}
    </section><footer className={styles.footer}><span>PRIVATE BY SCOPE. NOT BY APPEARANCE.</span><a href="/operator">OPERATOR ↗</a></footer>
  </main>;
}
