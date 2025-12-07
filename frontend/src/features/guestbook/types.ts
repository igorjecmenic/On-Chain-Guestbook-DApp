export type GuestbookMessage = {
  author: string;
  text: string;
  timestampMs: number;
};

export type GuestbookData = {
  id: string;
  messages: GuestbookMessage[];
};

export type PostMessageResult = {
  digest: string;
};
