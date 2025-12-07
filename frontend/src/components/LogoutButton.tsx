// import React from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const currentAccount = useCurrentAccount();
    const disconnectWallet = useDisconnectWallet();
    const navigate = useNavigate();

    const handleLogout = () => {
        disconnectWallet.mutate();
        navigate('/');
    }

    if (!currentAccount) return null;
    return (
        <button className="auth-button auth-button--ghost" onClick={handleLogout}>Logout</button>
    );
}

export default LogoutButton;
