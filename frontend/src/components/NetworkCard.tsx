import { FULLNODE_URL, NETWORK } from '../config';

export function NetworkCard() {
  return (
    <div className="card muted">
      <p className="label">Network</p>
      <p>
        Active network: <strong>{NETWORK}</strong>
      </p>
      <p>
        Fullnode URL: <code>{FULLNODE_URL}</code>
      </p>
    </div>
  );
}
