import React from 'react';
import { Provider, useSelector } from 'react-redux';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useParams,
    useNavigate,
} from 'react-router-dom';
import { NFTStorage, Blob } from 'nft.storage';
import { ethers } from 'ethers';
import PfperABI from './Pfper.js';
import './App.css';
import { GRID_SIZE, CELL_SIZE, COLORS } from './constants.js';
import { store, actions, selectors } from './database.js';

// MAKE SURE TO ONLY INCLUDE THE RIGHT NETWORK
import { PFPER_CONTRACT_ADDRESS, NETWORK_PARAMS } from './network/arbitrum.js';
//import { PFPER_CONTRACT_ADDRESS, NETWORK_PARAMS } from './network/hardhat.js';

const Buffer = require('buffer/').Buffer;

const NFT_STORAGE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQxMjQyODZDQzQ1OTE0YmE4QjBiNkM2MUQxMGQ4YzVkODNlM2RlMzciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1Njc2NDEyODgzMywibmFtZSI6InBmcGVyIn0.p_p2aIpWY5i3ez_s5YYdP-4mUm0BgM-fK3VS_pI3Nkg';
const nftStorageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });

function loadContract(isSigner) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let p = provider;
    if (isSigner) {
        p = provider.getSigner();
    }
    return new ethers.Contract(PFPER_CONTRACT_ADDRESS, PfperABI, p);
}

function wrapIpfs(url) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
}

const {
    setHasWallet,
    setIsCorrectChain,
    setAddress,
    setCost,
    setColor,
    setColorIndex,
    clearColorMatrix,
    setAddressTokens,
    setToken,
} = actions;

const {
    selectHasWallet,
    selectIsCorrectChain,
    selectAddress,
    selectCost,
    selectColorMatrix,
    selectColorIndex,
    selectRenderedSvg,
    selectAddressTokens,
    selectToken,
} = selectors;

const wait = ms => new Promise(r => setTimeout(r, ms));

const retryOperation = (operation, delay, retries) => new Promise((resolve, reject) => {
    return operation()
        .then(resolve)
        .catch(reason => {
            if (retries > 0) {
                return wait(delay)
                    .then(retryOperation.bind(null, operation, delay, retries-1))
                    .then(resolve)
                    .catch(reject);
            }
            return reject(reason);
        });
});

function isCorrectChain() {
    if (window.ethereum) {
        const currentChainId = ethers.BigNumber.from(window.ethereum.networkVersion);
        return (currentChainId.toHexString() === NETWORK_PARAMS.chainId);
    } else {
        return false;
    }
}

async function isCorrectChainAsync() {
    return isCorrectChain();
}

async function switchChain() {
    return window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_PARAMS.chainId }],
    }).catch(error => {
        if (error.code === 4902) {
            return window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [NETWORK_PARAMS],
            });
        }
    });
}

async function connectWalletOnClick(e) {
    if (!isCorrectChain()) {
        await switchChain();
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.send('eth_requestAccounts', [])
        .then(([address]) => {
            store.dispatch(setAddress(address));
            return loadContract().getCost();
        }).then(cost => {
            store.dispatch(setCost(ethers.utils.formatEther(cost)));
        });
}

function svgPaint(p, elem) {
    const rect = elem.getBoundingClientRect();
    const x = Math.floor((p.x - rect.left) / CELL_SIZE);
    const y = Math.floor((p.y - rect.top) / CELL_SIZE);
    store.dispatch(setColor({ x, y }));
}

function svgOnClick(e) {
    const point = {
        x: e.clientX,
        y: e.clientY,
    };
    svgPaint(point, e.target.parentElement);
}

function svgOnMouseMove(e) {
    if (e.buttons > 0) {
        const point = {
            x: e.clientX,
            y: e.clientY,
        };
        svgPaint(point, e.target.parentElement);
    }
}

function svgOnTouchMove(e) {
    const touch = e.touches[0];
    const point = {
        x: touch.clientX,
        y: touch.clientY,
    }
    svgPaint(point, e.target.parentElement);
}

function PfpSvg() {
    const cm = useSelector(selectColorMatrix);
    const viewBox = `0 0 ${GRID_SIZE} ${GRID_SIZE}`;
    const k = (x, y) => (`${x},${y}`);
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}
                onClick={svgOnClick}
                onMouseMove={svgOnMouseMove}
                onTouchMove={svgOnTouchMove}>
            {cm.map((row, x) => row.map((colorIndex, y) => <rect key={k(x,y)} width="1" height="1" x={x} y={y} fill={COLORS[colorIndex]} />)).flat()}
        </svg>
    );
}

function Pfp() {
    return (
        <div className="pfp" style={{width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE}}>
            <PfpSvg />
        </div>
    );
}

function ColorPicker() {
    const currentColorIndex = useSelector(selectColorIndex);
    const viewBox = `0 0 ${COLORS.length} 1`;
    const onClick = (e) => {
        const elem = e.target.parentElement.getBoundingClientRect();
        store.dispatch(setColorIndex(Math.floor(COLORS.length * ((e.clientX - elem.left) / elem.width))));
    }
    return (
        <div className="ColorPicker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} onClick={onClick}>
                {COLORS.map((color, index) => {
                    const current = (index === currentColorIndex);
                    return (
                        <rect key={index}
                        width="1" height="1"
                        x={index}
                        fill={color}
                        stroke="orange"
                        strokeWidth={current ? '0.1' : '0'}
                        />
                    );
                })}
            </svg>
        </div>
    );
}

function MintBar() {
    const address = useSelector(selectAddress);
    const cost = useSelector(selectCost);
    const navigate = useNavigate();
    const onClick = React.useCallback(
        async (e) => {
            const state = store.getState();
            const svg = selectRenderedSvg(state);
            if (svg && address) {
                const contract = loadContract(true);
                await Promise.all([
                    contract.getCost(),
                    NFTStorage.encodeBlob(new Blob([svg])),
                ]).then(([cost, { cid, car }]) => {
                    return contract.mintPfp(cid.toString(), { value: cost })
                        .then(tx => tx.wait())
                        .then(receipt => {
                            return nftStorageClient.storeCar(car);
                        });
                }).then(r => {
                    store.dispatch(clearColorMatrix());
                    navigate(`/address/${address}`);
                });
            }
        }, [address, navigate]);
    if (window.ethereum) {
        const mintable = (address && cost);
        return (
            <div className="MintBar">
                {!mintable && <button onClick={connectWalletOnClick}>Connect</button>}
                {mintable && <button onClick={onClick}>Mint for {cost} ETH</button>}
            </div>
        );
    }
}

function Editor() {
    const block = (e) => {
        e.preventDefault();
        return false;
    }
    return (
        <div className="Editor" onContextMenu={block}>
            <MintBar />
            <ColorPicker />
            <Pfp />
        </div>
    );
}

function Home() {
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
            </ul>
        </div>
    );
}

function Header() {
    return (
        <header>
            <h1><Link to="/">pfper</Link></h1>
        </header>
    );
}

function NoWallet() {
    return (
        <div className="NoWallet">
            <p><em>you need to install a wallet to view this page.</em></p>
        </div>
    );
}

function SwitchChain() {
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

function Token() {
    const { tokenId } = useParams();
    const token = useSelector(selectToken(tokenId));
    const hasWallet = useSelector(selectHasWallet);
    const correctChain = useSelector(selectIsCorrectChain);
    const load = React.useCallback(async () => {
        const contract = loadContract();
        return fetchToken(contract, tokenId).then(token => {
            store.dispatch(setToken(token));
        });
    }, [tokenId]);
    React.useEffect(() => {
        store.dispatch(setHasWallet(!!window.ethereum));
        const checkChain = async () => {
            store.dispatch(setIsCorrectChain(await retryOperation(isCorrectChainAsync, 100, 5)));
        };
        checkChain();
    }, []);
    if (!hasWallet) {
        return <NoWallet />;
    } else if (!correctChain) {
        return <SwitchChain />;
    } else {
        load();
        if (token) {
            const url = wrapIpfs(token.data.image);
            const ownerHref = `/address/${token.owner}`;
            const authorHref = `/address/${token.author}`;
            return (
                <div className="Token">
                    <Header />
                    <div className="pfp" style={{width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE}}>
                        <h1>pfper #{tokenId}</h1>
                        <object data={url} type="image/svg+xml">{token.data.image}</object>
                        <table>
                            <tbody>
                                <tr><th>Owner</th><td><Link to={ownerHref}>{token.owner}</Link></td></tr>
                                <tr><th>Author</th><td><Link to={authorHref}>{token.author}</Link></td></tr>
                                <tr><th>Download</th><td><a href={url} target="_blank" rel="noreferrer">SVG</a></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    }
}

async function fetchToken(contract, tokenId) {
    return Promise.all([
        contract.ownerOf(tokenId),
        contract.authorOf(tokenId),
        contract.tokenURI(tokenId),
    ]).then(([owner, author, uri]) => {
        const data = JSON.parse(Buffer.from(uri.replace('data:application/json;base64,', ''), 'base64').toString('ascii'));
        return { owner, author, data,
            tokenId: ethers.BigNumber.from(tokenId).toNumber(),
        };
    });
}

function PfperGridItem({ pfper }) {
    const href = `/token/${pfper.tokenId}`;
    const url = wrapIpfs(pfper.data.image);
    return (
        <div className="pfp">
            <h3><Link to={href}>{pfper.data.name}</Link></h3>
            <object data={url} type="image/svg+xml">{pfper.data.image}</object>
        </div>
    );
}

function Address() {
    const { address } = useParams();
    const tokens = useSelector(selectAddressTokens(address));
    const hasWallet = useSelector(selectHasWallet);
    const correctChain = useSelector(selectIsCorrectChain);
    const load = React.useCallback(async () => {
        const contract = loadContract();
        return contract.balanceOf(address).then(total => {
            return Promise.all([...Array(total.toNumber()).keys()].reverse().map(i => contract.tokenOfOwnerByIndex(address, i)));
        }).then(tokenIds => {
            return Promise.all(tokenIds.map(tokenId => fetchToken(contract, tokenId)));
        }).then(tokens => {
            store.dispatch(setAddressTokens({ address, tokens }));
        });
    }, [address]);
    React.useEffect(() => {
        store.dispatch(setHasWallet(!!window.ethereum));
        const checkChain = async () => {
            store.dispatch(setIsCorrectChain(await retryOperation(isCorrectChainAsync, 100, 5)));
        };
        checkChain();
    }, []);
    if (!hasWallet) {
        return <NoWallet />;
    } else if (!correctChain) {
        return <SwitchChain />;
    } else {
        load();
        return (
            <div className="Address">
                <Header />
                <h1>{address}</h1>
            {tokens.length === 0 &&
                <p><em>this address owns no pfpers</em></p>}
            {tokens.length > 0 &&
                <div className="pfpers">
                    {tokens.map(t => <PfperGridItem key={t.tokenId} pfper={t} />)}
                </div>}
            </div>
        );
    }
}

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/token/:tokenId" element={<Token />} />
                    <Route path="/address/:address" element={<Address />} />
                </Routes>
            </Router>
        </Provider>
    );
}

export default App;
