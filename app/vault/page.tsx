import type { Metadata } from "next";
import VaultBrowser from "./VaultBrowser";
export const metadata:Metadata={title:"Vault | SABITX RUN",description:"Passcode-scoped shared files.",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function VaultPage(){return <VaultBrowser/>;}
