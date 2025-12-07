import { getFullnodeUrl } from '@mysten/sui/client';

export type SupportedNetwork = 'testnet' | 'mainnet' | 'devnet' | 'localnet';

const envNetwork = (import.meta.env.VITE_SUI_NETWORK as string | undefined)?.toLowerCase();
export const NETWORK: SupportedNetwork =
  envNetwork === 'mainnet' || envNetwork === 'devnet' || envNetwork === 'localnet'
    ? envNetwork
    : 'testnet';

export const FULLNODE_URL =
  (import.meta.env.VITE_FULLNODE_URL as string | undefined) ?? getFullnodeUrl(NETWORK);
export const PACKAGE_ID = (import.meta.env.VITE_PACKAGE_ID as string | undefined) ?? '';
export const GUESTBOOK_ID = (import.meta.env.VITE_GUESTBOOK_ID as string | undefined) ?? '';

const refreshMsRaw = Number(import.meta.env.VITE_GUESTBOOK_REFRESH_MS ?? 5000);
export const GUESTBOOK_REFRESH_MS = Number.isFinite(refreshMsRaw) && refreshMsRaw > 0 ? refreshMsRaw : 5000;

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '';
export const USE_SPONSORED_TRANSACTIONS =
  (import.meta.env.VITE_USE_SPONSORED_TRANSACTIONS as string | undefined)?.toLowerCase() === 'true';

export const ENOKI_API_KEY = (import.meta.env.VITE_ENOKI_API_KEY as string | undefined) ?? '';
export const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '';
