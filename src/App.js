import React from 'react';
import { Provider, useSelector } from 'react-redux';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from 'react-router-dom';
import { NFTStorage, Blob } from 'nft.storage';
import './App.css';
import { GRID_SIZE, CELL_SIZE, COLORS } from './constants.js';
import { store, actions, selectors } from './database.js';
import { connectWalletOnClick, loadContract } from './wallet.js';
import Home from './views/home.js';
import Address from './views/address.js';
import Token from './views/token.js';

const NFT_STORAGE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQxMjQyODZDQzQ1OTE0YmE4QjBiNkM2MUQxMGQ4YzVkODNlM2RlMzciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1Njc2NDEyODgzMywibmFtZSI6InBmcGVyIn0.p_p2aIpWY5i3ez_s5YYdP-4mUm0BgM-fK3VS_pI3Nkg';
const nftStorageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });

const {
    setColor,
    setColorIndex,
    clearColorMatrix,
} = actions;

const {
    selectAddress,
    selectCost,
    selectColorMatrix,
    selectColorIndex,
    selectRenderedSvg,
} = selectors;

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
