import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from '@mysten/dapp-kit';
import App from './App.tsx';
import { FULLNODE_URL, NETWORK } from './config.ts';
import './index.css';
import '@mysten/dapp-kit/dist/index.css';
import RegisterEnokiWallets from './components/RegisterEnokiWallets.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient();
const { networkConfig } = createNetworkConfig({
  [NETWORK]: { url: FULLNODE_URL },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={NETWORK}>
        <RegisterEnokiWallets />
        <WalletProvider autoConnect>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
