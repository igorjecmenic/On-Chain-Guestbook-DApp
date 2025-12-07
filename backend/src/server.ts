import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { EnokiClient } from '@mysten/enoki';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { toBase64 } from '@mysten/sui/utils';
import { buildPostMessageTransaction, MAX_MESSAGE_BYTES } from './buildPostMessageTransaction';

dotenv.config();

const PORT = process.env.PORT || 3001;
const ENOKI_PRIVATE_KEY = process.env.ENOKI_PRIVATE_KEY;
const SUI_NETWORK = (process.env.SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet' | 'devnet';
const FULLNODE_URL =
  process.env.FULLNODE_URL && process.env.FULLNODE_URL.trim().length > 0
    ? process.env.FULLNODE_URL
    : getFullnodeUrl(SUI_NETWORK);
const DEFAULT_PACKAGE_ID = process.env.PACKAGE_ID;

if (!ENOKI_PRIVATE_KEY) {
  throw new Error('ENOKI_PRIVATE_KEY must be set in the backend environment');
}

const app = express();
app.use(cors());
app.use(express.json());

const suiClient = new SuiClient({ url: FULLNODE_URL });
const enokiClient = new EnokiClient({ apiKey: ENOKI_PRIVATE_KEY });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', network: SUI_NETWORK });
});

app.post('/api/sponsor-message', async (req, res) => {
  try {
    const { sender, packageId, guestbookId, text } = req.body as {
      sender?: string;
      packageId?: string;
      guestbookId?: string;
      text?: string;
    };

    const resolvedPackageId = packageId ?? DEFAULT_PACKAGE_ID;

    if (!sender || !guestbookId || !resolvedPackageId || typeof text !== 'string') {
      res
        .status(400)
        .json({ error: 'sender, guestbookId, text, and packageId (via body or env) are required' });
      return;
    }

    const byteLength = Buffer.byteLength(text, 'utf8');
    if (byteLength > MAX_MESSAGE_BYTES) {
      res.status(400).json({ error: `Message too long (${byteLength} bytes). Max is ${MAX_MESSAGE_BYTES}.` });
      return;
    }

    const tx = buildPostMessageTransaction(resolvedPackageId, guestbookId, text);
    const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

    const sponsored = await enokiClient.createSponsoredTransaction({
      network: SUI_NETWORK,
      transactionKindBytes: toBase64(txBytes),
      sender,
      allowedMoveCallTargets: [`${resolvedPackageId}::guestbook::post_message`],
      allowedAddresses: [sender],
    });

    res.json({ bytes: sponsored.bytes, digest: sponsored.digest });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: `Failed to sponsor message transaction: ${message}` });
  }
});

app.post('/api/execute-transaction', async (req, res) => {
  try {
    const { digest, signature } = req.body as { digest?: string; signature?: string };

    if (!digest || !signature) {
      res.status(400).json({ error: 'digest and signature are required' });
      return;
    }

    const result = await enokiClient.executeSponsoredTransaction({ digest, signature });
    res.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: `Failed to execute sponsored transaction: ${message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Guestbook sponsor backend listening on port ${PORT}, network ${SUI_NETWORK}`);
});
