import type { Metadata } from "next";
import VaultManager from "./VaultManager";
export const metadata:Metadata={title:"Manage Vault | SABITX RUN",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function ManageVaultPage(){return <VaultManager/>;}
