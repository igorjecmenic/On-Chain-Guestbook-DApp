# On-Chain Guestbook DApp

Guestbook on Sui where anyone can post short messages (100-byte max) to a shared object. Includes Move contracts, a React frontend, and an optional sponsored-transaction backend using Enoki.

## Smart Contracts (contracts/guestbook)
- Build: `sui move build contracts/guestbook`
- Test: `sui move test contracts/guestbook`
- Deploy: `sui client publish --gas-budget 100000000 contracts/guestbook`
- Initialize shared guestbook (post-deploy):  
  `sui client call --package <PACKAGE_ID> --module guestbook --function init_shared --gas-budget 20000000`  
  Capture the returned shared `Guestbook` object ID for envs.
- Behavior: `post_message` enforces 100-byte limit and emits `MessagePosted` events.

## Frontend (frontend/)
- Install: `cd frontend && npm install`
- Env: copy `.env.example` to `.env.local` and set:
  - `VITE_PACKAGE_ID=<published package>`
  - `VITE_GUESTBOOK_ID=<shared Guestbook object>`
  - `VITE_SUI_NETWORK` (`testnet` default) and optional `VITE_FULLNODE_URL`
  - Sponsored flow: `VITE_USE_SPONSORED_TRANSACTIONS=true`, `VITE_BACKEND_URL=http://localhost:3001`
  - Enoki: `VITE_ENOKI_API_KEY`, `VITE_GOOGLE_CLIENT_ID`
  - Feed polling: `VITE_GUESTBOOK_REFRESH_MS=5000` (default)
- Run: `npm run dev` (build: `npm run build`)
- UI: Enoki/Wallet connect, 100-byte input with counter, posts via direct or sponsored tx, live feed sorted newest-first.

## Sponsored Transaction Backend (backend/)
- Install: `cd backend && npm install`
- Env: copy `.env.example` to `.env` and set:
  - `ENOKI_PRIVATE_KEY=<enoki portal key>`
  - `SUI_NETWORK=testnet` (or mainnet/devnet), optional `FULLNODE_URL`
  - `PORT=3001` (default)
  - `PACKAGE_ID=<published package>` (can also be provided per request)
  - `GUESTBOOK_ID=<shared Guestbook object>` (can also be provided per request)
- Run: `npm run dev` (build: `npm run build`, start: `npm start`)
- Endpoints:
  - `POST /api/sponsor-message` with `{ sender, guestbookId, text, packageId? }` → returns `{ bytes, digest }`
  - `POST /api/execute-transaction` with `{ digest, signature }` → executes sponsored tx
  - `GET /health` for status
- Notes: Enforces 100-byte limit server-side; uses clock object `0x6` in the transaction builder.

Last updated on: 31.12.2025.
