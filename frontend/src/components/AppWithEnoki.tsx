import { useCurrentAccount } from '@mysten/dapp-kit';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { PACKAGE_ID, GUESTBOOK_ID } from '../config';
import { useGuestbookQuery, usePostMessageMutation } from '../features/guestbook/hooks';
import { NetworkCard } from './NetworkCard';
import '../App.css';
import Login from './Login';

const MAX_MESSAGE_CHARS = 100;

const shorten = (addr: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');
const formatTime = (ms: number) => new Date(ms).toLocaleString();

export function AppWithEnoki() {
  const account = useCurrentAccount();
  const { data: guestbook, isLoading, error } = useGuestbookQuery();
  const postMessage = usePostMessageMutation();
  const [message, setMessage] = useState('');

  const charCount = useMemo(() => new TextEncoder().encode(message).length, [message]);
  const disabled = postMessage.isPending || !account;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    postMessage.mutate(message, {
      onSuccess: () => setMessage(''),
    });
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">On-Chain Guestbook</p>
          <h1 className="title">Leave a note that lives on Sui</h1>
          <p className="subtitle">
            Connect, drop a short message (100 chars max), and see the feed update live from the shared guestbook
            object.
          </p>
        </div>
        <Login />
      </header>

      <NetworkCard />

      {!PACKAGE_ID || !GUESTBOOK_ID ? (
        <div className="card warning">
          <h2>Missing configuration</h2>
          <p>Set VITE_PACKAGE_ID and VITE_GUESTBOOK_ID in .env.local after deploying the Move package.</p>
        </div>
      ) : null}

      {isLoading && <div className="card muted">Loading guestbook from chain...</div>}
      {error && (
        <div className="card warning">
          <h2>Unable to load guestbook</h2>
          <p>{String((error as Error).message)}</p>
        </div>
      )}

      <div className="card">
        <div className="proposal-header">
          <div>
            <p className="label">Guestbook</p>
            <h2>Say hello to everyone visiting</h2>
            <p className="meta">
              Guestbook ID: <code>{GUESTBOOK_ID || 'not set'}</code>
            </p>
          </div>
          <div className="badge">100 bytes max per message</div>
        </div>

        <form className="options" onSubmit={handleSubmit}>
          <label className="option" style={{ cursor: 'default' }}>
            <div className="option-main">
              <span className="option-label">Your message</span>
              <span className="option-meta">
                {charCount}/{MAX_MESSAGE_CHARS} bytes
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE_CHARS * 2}
              className="message-input"
              placeholder="Drop a note for future visitors..."
              disabled={!GUESTBOOK_ID || disabled}
              rows={3}
            />
            <div className="option-count">{account ? shorten(account.address) : 'Not connected'}</div>
          </label>
          <button type="submit" className="primary" disabled={!GUESTBOOK_ID || disabled}>
            {postMessage.isPending ? 'Posting...' : 'Post message'}
          </button>
        </form>

        <div className="status">
          {!account && <p>Sign in to post a message.</p>}
          {account && <p>Signed in as {account.address}.</p>}
          {postMessage.isSuccess && (
            <p>
              Message posted! Digest: <code>{postMessage.data?.digest}</code>
            </p>
          )}
          {postMessage.error && <p className="error">Error: {String(postMessage.error as Error)}</p>}
        </div>
      </div>

      {guestbook && (
        <div className="card">
          <div className="proposal-header">
            <div>
              <p className="label">Feed</p>
              <h2>Latest messages</h2>
              <p className="meta">{guestbook.messages.length} total</p>
            </div>
            <div className="badge">Live from chain</div>
          </div>
          <div className="options">
            {guestbook.messages.length === 0 && <p className="muted">No messages yet. Be the first!</p>}
            {guestbook.messages.map((msg) => (
              <div key={`${msg.author}-${msg.timestampMs}-${msg.text}`} className="option" style={{ cursor: 'default' }}>
                <div className="option-main">
                  <span className="option-label">{msg.text || '(empty message)'}</span>
                  <span className="option-meta">{formatTime(msg.timestampMs)}</span>
                </div>
                <div className="option-count">From {shorten(msg.author)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AppWithEnoki;
