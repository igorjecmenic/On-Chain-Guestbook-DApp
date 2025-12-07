// import React from "react";
import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet, type EnokiWallet, type AuthProvider } from '@mysten/enoki';
import LogoutButton from './LogoutButton';

export function Login() {
	const currentAccount = useCurrentAccount();
	const { mutate: connect } = useConnectWallet();
	const wallets = useWallets().filter(isEnokiWallet);
	const walletsByProvider = wallets.reduce(
		(map, wallet) => map.set(wallet.provider, wallet),
		new Map<AuthProvider, EnokiWallet>(),
	);
	const googleWallet = walletsByProvider.get('google');
	// console.log('Available wallets:', wallets);
	if (currentAccount) {
		// return <div>Current address: {currentAccount.address}</div>;
		return <LogoutButton />;

	}
	return (
		<>
			{googleWallet ? (
				<button
					className="auth-button auth-button--google"
					onClick={() => {
						connect({ wallet: googleWallet });
					}}
				>
					Sign in with Google
				</button>
			) : null}
		</>
	);
}

export default Login;
