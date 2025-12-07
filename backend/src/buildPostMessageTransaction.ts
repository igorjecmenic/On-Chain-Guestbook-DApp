import { Transaction } from '@mysten/sui/transactions';

const CLOCK_OBJECT_ID = '0x6';
export const MAX_MESSAGE_BYTES = 100;

function toBytes(text: string): number[] {
    return Array.from(new TextEncoder().encode(text));
}

export function buildPostMessageTransaction(packageId: string, guestbookId: string, text: string) {
    const byteLength = new TextEncoder().encode(text).length;
    if (byteLength > MAX_MESSAGE_BYTES) {
        throw new Error(`Message too long (${byteLength} bytes). Max is ${MAX_MESSAGE_BYTES}.`);
    }

    const tx = new Transaction();
    tx.moveCall({
        target: `${packageId}::guestbook::post_message`,
        arguments: [tx.object(guestbookId), tx.pure.vector('u8', toBytes(text)), tx.object(CLOCK_OBJECT_ID)],
    });
    return tx;
}
