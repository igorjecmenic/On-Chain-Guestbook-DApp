import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { FULLNODE_URL, NETWORK, PACKAGE_ID } from '../config';

export const client = new SuiClient({
  url: FULLNODE_URL || getFullnodeUrl(NETWORK),
});

export const messagePostedEventType = PACKAGE_ID
  ? `${PACKAGE_ID}::guestbook::MessagePosted`
  : 'guestbook::guestbook::MessagePosted';
