import type { SuiEvent } from '@mysten/sui/client';
import { fromB64 } from '@mysten/sui/utils';
import { GUESTBOOK_ID, PACKAGE_ID } from '../../config';
import { client, messagePostedEventType } from '../../lib/sui';
import type { GuestbookData, GuestbookMessage } from './types';

const hexRegex = /^[0-9a-fA-F]+$/;
const decoder = new TextDecoder();

const decodeBytes = (value: unknown): string => {
  if (typeof value === 'string') {
    const trimmed = value.startsWith('0x') ? value.slice(2) : value;
    const bytes = hexRegex.test(trimmed) ? hexToBytes(trimmed) : fromB64(value);
    return decoder.decode(bytes);
  }
  if (Array.isArray(value)) {
    return decoder.decode(Uint8Array.from(value as number[]));
  }
  return '';
};

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const len = clean.length / 2;
  const out = new Uint8Array(len);
  let i = 0;
  while (i < len) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
    i = i + 1;
  }
  return out;
};

const parseMessage = (value: any): GuestbookMessage | null => {
  const fields = value?.fields;
  if (!fields) return null;
  const author = fields.author as string | undefined;
  const text = decodeBytes(fields.text);
  const timestampRaw = fields.timestamp_ms as number | string | undefined;
  const timestampMs = timestampRaw ? Number(timestampRaw) : 0;
  if (!author) return null;
  return { author, text, timestampMs };
};

export async function fetchGuestbook(guestbookId = GUESTBOOK_ID): Promise<GuestbookData> {
  const { data } = await client.getObject({
    id: guestbookId,
    options: { showContent: true },
  });

  const content = (data as any)?.content;
  const fields = (content as any)?.fields as { messages?: unknown } | undefined;
  const rawMessages = (fields?.messages as unknown[]) ?? [];
  const messages: GuestbookMessage[] = (
    rawMessages.map(parseMessage).filter(Boolean) as GuestbookMessage[]
  ).sort((a, b) => b.timestampMs - a.timestampMs);

  return {
    id: guestbookId,
    messages,
  };
}

export async function fetchMessageEvents(guestbookId = GUESTBOOK_ID): Promise<GuestbookMessage[]> {
  if (!PACKAGE_ID) return [];
  const { data } = await client.queryEvents({
    query: { MoveEventType: messagePostedEventType },
    limit: 200,
  });
  return data
    .filter((evt: SuiEvent) => {
      const fields = (evt.parsedJson ?? {}) as { guestbook?: string };
      return fields.guestbook === guestbookId;
    })
    .map((evt) => {
      const fields = (evt.parsedJson ?? {}) as {
        author?: string;
        text?: unknown;
        timestamp_ms?: number | string;
      };
      return {
        author: fields.author ?? '',
        text: decodeBytes(fields.text),
        timestampMs: fields.timestamp_ms ? Number(fields.timestamp_ms) : 0,
      };
    })
    .filter((m) => m.author);
}
