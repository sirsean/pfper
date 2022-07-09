import { NETWORK_PARAMS } from '../network.js';
import { switchChain } from '../wallet.js';
import { Link } from 'react-router-dom';

export function Header() {
    return (
        <header>
            <h1><Link to="/">pfper</Link></h1>
        </header>
    );
}

export function NoWallet() {
    return (
        <div className="NoWallet">
            <p><em>you need to install a wallet to view this page.</em></p>
        </div>
    );
}

export function SwitchChain() {
    const onClick = async (e) => {
        switchChain().then(r => window.location.reload());
    }
    return (
        <div className="SwitchChain">
            <p>to read this data from the blockchain, you need to switch your wallet to {NETWORK_PARAMS.chainName}</p>
            <p><button onClick={onClick}>Switch to {NETWORK_PARAMS.chainName}</button></p>
        </div>
    );
}
