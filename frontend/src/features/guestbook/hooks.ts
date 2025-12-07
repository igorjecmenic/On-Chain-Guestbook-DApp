import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount, useSignAndExecuteTransaction, useSignTransaction, useSuiClient } from '@mysten/dapp-kit';
import {
  BACKEND_URL,
  GUESTBOOK_ID,
  NETWORK,
  PACKAGE_ID,
  USE_SPONSORED_TRANSACTIONS,
  GUESTBOOK_REFRESH_MS,
} from '../../config';
import { executeSponsoredTransaction, requestSponsoredMessage } from '../../lib/sponsor';
import { fetchGuestbook } from './api';

const guestbookKey = ['guestbook', GUESTBOOK_ID];
const MAX_MESSAGE_BYTES = 100;

export const useGuestbookQuery = () =>
  useQuery({
    queryKey: guestbookKey,
    queryFn: () => fetchGuestbook(GUESTBOOK_ID),
    enabled: Boolean(GUESTBOOK_ID),
    staleTime: 5_000,
    refetchInterval: GUESTBOOK_REFRESH_MS,
    refetchOnWindowFocus: true,
  });

export const usePostMessageMutation = () => {
  const queryClient = useQueryClient();
  const signAndExecute = useSignAndExecuteTransaction();
  const signTransaction = useSignTransaction();
  const account = useCurrentAccount();
  const client = useSuiClient();
  const encoder = new TextEncoder();

  return useMutation({
    mutationFn: async (textInput: string) => {
      if (!PACKAGE_ID || !GUESTBOOK_ID) {
        throw new Error('Package ID or guestbook ID missing');
      }
      const text = textInput.trim();
      const bytes = encoder.encode(text);
      if (!text.length) {
        throw new Error('Message cannot be empty');
      }
      if (bytes.length > MAX_MESSAGE_BYTES) {
        throw new Error(`Message too long (${bytes.length} bytes). Max is ${MAX_MESSAGE_BYTES}.`);
      }

      const sponsorEnabled = USE_SPONSORED_TRANSACTIONS && Boolean(BACKEND_URL);

      if (sponsorEnabled) {
        if (!account?.address) {
          throw new Error('Connect a wallet before posting.');
        }

        const sponsored = await requestSponsoredMessage(BACKEND_URL, {
          sender: account.address,
          packageId: PACKAGE_ID,
          guestbookId: GUESTBOOK_ID,
          text,
        });

        const { signature } = await signTransaction.mutateAsync({
          transaction: sponsored.bytes,
          chain: `sui:${NETWORK}`,
        });

        if (!signature) {
          throw new Error('Failed to sign sponsored transaction.');
        }

        await executeSponsoredTransaction(BACKEND_URL, {
          digest: sponsored.digest,
          signature,
        });

        await client.waitForTransaction({ digest: sponsored.digest });
        return { digest: sponsored.digest };
      }

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::guestbook::post_message`,
        arguments: [tx.object(GUESTBOOK_ID), tx.pure.vector('u8', Array.from(bytes)), tx.object('0x6')],
      });

      return signAndExecute.mutateAsync({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestbookKey });
    },
  });
};
