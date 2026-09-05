export type VaultFolder = { id: string; name: string; total_bytes: number; file_count: number };
export type VaultFile = { id: string; name: string; mime: string; size: number; created_at: string };
export type VaultGrant = { id: string; expires_at: string; revoked_at: string | null; created_at: string };
export type VaultAdminState = { setupRequired: boolean; folders: VaultFolder[]; files: VaultFile[]; grants: VaultGrant[] };
export type VaultAccess = { folderName: string; expiresAt: string; files: VaultFile[] };
