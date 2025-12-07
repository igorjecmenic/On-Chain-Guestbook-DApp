# On-Chain Guestbook Frontend

React + Vite app for posting and reading guestbook messages stored on Sui. Uses `@mysten/dapp-kit` for wallet/Enoki auth and optional sponsored transactions via the backend in `../backend`.

## Setup
```bash
cd frontend
npm install
cp .env.example .env.local
```

Set envs in `.env.local`:
- `VITE_PACKAGE_ID` — published guestbook package ID.
- `VITE_GUESTBOOK_ID` — shared Guestbook object ID (from `init_shared`).
- `VITE_SUI_NETWORK` (`testnet` default) and optional `VITE_FULLNODE_URL`.
- Sponsorship: `VITE_USE_SPONSORED_TRANSACTIONS=true`, `VITE_BACKEND_URL=http://localhost:3001`.
- Enoki auth: `VITE_ENOKI_API_KEY`, `VITE_GOOGLE_CLIENT_ID`.
- Refresh cadence: `VITE_GUESTBOOK_REFRESH_MS` (default 5000) to poll the feed.

## Run
```bash
npm run dev     # start Vite dev server
npm run build   # typecheck and build
npm run preview # preview production build
```

## Behavior
- Shows the shared guestbook ID and network info.
- Auth via Enoki Google (when configured) or Wallet Standard.
- Input validates 100-byte max; posts on-chain via sponsored or direct tx.
- Feed reads messages from the guestbook object and shows newest first.
