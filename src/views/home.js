import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { NETWORK_PARAMS } from '../network.js';
import { selectAddress } from '../database.js';
import { connectWalletOnClick } from '../wallet.js';

export default function Home() {
    const address = useSelector(selectAddress);
    return (
        <div className="Home">
            <h1>pfper</h1>
            <p>Draw your own pixelart!</p>
            <p>Upload it to IPFS, mint it as an ERC-721 to {NETWORK_PARAMS.chainName}.</p>
            <p>Keep it, use it as your PFP, sell it, give it away. Whatever you wanna do, it's yours.</p>
            <p>The point is that it will exist forever and you don't have to rely on me or this dumb website. You draw your pixelart and store it on the internet, and it'll always be there.</p>
            <p>Note that this is not some hype project. You draw a pfper, and you pay to have it recorded and saved and available. I have no idea if someone will value your effort higher than what it cost for you to mint it.</p>
            <p>The only restriction is that you cannot mint something that has already been minted, either by you or anyone else. Every one of these is guaranteed to be unique.</p>
            <p className="editor-link"><Link to="/editor">Enter the Editor!</Link></p>
            {window.ethereum && address && <p>You have connected your wallet: <Link to={`/address/${address}`}>{address}</Link>.</p>}
            {window.ethereum && !address && <p>If you want to be able to mint it, <button onClick={connectWalletOnClick}>connect your wallet</button>.</p>}
            {!window.ethereum && <p>In you want to be able to mint it, you will need to install a wallet.</p>}
            <p>You may feel more confident if you can read what the code is going to do, so here's some links:</p>
            <ul>
                <li><a href="https://github.com/sirsean/pfper" target="_blank" rel="noreferrer">Github: App</a></li>
                <li><a href="https://github.com/sirsean/pfper-contract" target="_blank" rel="noreferrer">Github: Contract</a></li>
                <li><a href="https://arbiscan.io/address/0xcf4fd95771aeb088c50aec7ea8df8c11c034ffb3" target="_blank" rel="noreferrer">Arbiscan: Contract</a></li>
                <li><a href="https://stratosnft.io/collection/pfper" target="_blank" rel="noreferrer">Stratos NFT Marketplace</a></li>
            </ul>
        </div>
    );
}
