import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useParams,
} from 'react-router-dom';
import { NFTStorage, Blob } from 'nft.storage';
import './App.css';

const NFT_STORAGE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQxMjQyODZDQzQ1OTE0YmE4QjBiNkM2MUQxMGQ4YzVkODNlM2RlMzciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1Njc2NDEyODgzMywibmFtZSI6InBmcGVyIn0.p_p2aIpWY5i3ez_s5YYdP-4mUm0BgM-fK3VS_pI3Nkg';
const nftStorageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });

const GRID_SIZE = 32;
const CELL_SIZE = 25;

const colors = [
    '#FCFBED', // navajo cream
    '#1F170C', // not black
    '#802E36', // apple blossom
    '#2E79BF', // wells beach
    '#26A38E', // northern lights
    '#A85516', // caramel square
    '#FACF32', // jacks pot
    '#4C379E', // blackened periwinkle
];

const initialColorMatrix = (size) => {
    let rows = new Array(size);
    for (let x=0; x < size; x++) {
        rows[x] = new Array(size);
        for (let y=0; y < size; y++) {
            rows[x][y] = 0;
        }
    }
    return rows;
}

const slice = createSlice({
    name: 'pfper',
    initialState: {
        colorMatrix: initialColorMatrix(GRID_SIZE),
        colorIndex: 0,
    },
    reducers: {
        setColor: (state, action) => {
            const { x, y } = action.payload;
            state.colorMatrix[x][y] = state.colorIndex;
        },
        setColorIndex: (state, action) => {
            state.colorIndex = action.payload;
        }
    },
});

const {
    setColor,
    setColorIndex,
} = slice.actions;
const store = configureStore({
    reducer: slice.reducer,
});

const selectColorMatrix = state => state.colorMatrix;
const selectColorIndex = state => state.colorIndex;
const selectRenderedSvg = state => {
    const cm = selectColorMatrix(state);
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_SIZE} ${GRID_SIZE}">`;
    for (let x=0; x < cm.length; x++) {
        for (let y=0; y < cm[x].length; y++) {
            svg += `<rect width="1" height="1" x="${x}" y="${y}" fill="${colors[cm[x][y]]}" />`;
        }
    }
    svg += `</svg>`;
    return svg;
};

function svgPaint(p, elem) {
    const rect = elem.getBoundingClientRect();
    const x = Math.floor((p.screenX - rect.left) / CELL_SIZE);
    const y = Math.floor((p.screenY - rect.top) / CELL_SIZE);
    store.dispatch(setColor({ x, y }));
}

function svgOnClick(e) {
    const point = {
        screenX: e.screenX,
        screenY: e.screenY,
    };
    svgPaint(point, e.target.parentElement);
}

function svgOnMouseMove(e) {
    if (e.buttons > 0) {
        const point = {
            screenX: e.screenX,
            screenY: e.screenY,
        };
        svgPaint(point, e.target.parentElement);
    }
}

function svgOnTouchMove(e) {
    const touch = e.touches[0];
    const point = {
        screenX: touch.screenX,
        screenY: touch.screenY,
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
            {cm.map((row, x) => row.map((colorIndex, y) => <rect key={k(x,y)} width="1" height="1" x={x} y={y} fill={colors[colorIndex]} />)).flat()}
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
    const viewBox = `0 0 ${colors.length} 1`;
    const onClick = (e) => {
        const elem = e.target.parentElement.getBoundingClientRect();
        store.dispatch(setColorIndex(Math.floor(colors.length * ((e.screenX - elem.left) / elem.width))));
    }
    return (
        <div className="ColorPicker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} onClick={onClick}>
                {colors.map((color, index) => {
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

async function mintOnClick(e) {
    const svg = selectRenderedSvg(store.getState());
    console.log(svg);
    const { cid, car } = await NFTStorage.encodeBlob(new Blob([svg]));
    console.log(cid.toString());
    // UPLOADING WORKS!
    // await nftStorageClient.storeCar(car);
    // we can generate the CID, mint the NFT, and then upload the CAR, and show a link to the transaction
}

function MintBar() {
    return (
        <div className="MintBar">
            <button onClick={mintOnClick}>mint</button>
        </div>
    );
}

function Editor() {
    return (
        <div className="Editor">
            <MintBar />
            <ColorPicker />
            <Pfp />
        </div>
    );
}

function Home() {
    return (
        <div className="Home">
            <h1>pfper</h1>
            <p>Draw your own pixelart!</p>
            <p>Upload it to IPFS, mint it as an ERC-721 to Arbitrum.</p>
            <p>Keep it, use it as your PFP, sell it, give it away. Whatever you wanna do, it's yours.</p>
            <p>The only restriction is that you cannot mint something that has already been minted, either by you or anyone else. Every one of these is guaranteed to be unique.</p>
            <p><Link to="/editor">Enter the Editor!</Link></p>
            <p>If you want to be able to mint it, <a href="#">connect your wallet</a>.</p>
            <p>It's all open source, too, so...</p>
            <ul>
                <li><a href="#">Github: App</a></li>
                <li><a href="#">Github: Contract</a></li>
                <li><a href="#">Arbiscan: Contract</a></li>
            </ul>
        </div>
    );
}

function Token() {
    const { tokenId } = useParams();
    const cid = 'bafkreicqlf73rwli63jtlh4g64lj63esgoi4ddssewaazz62crst3s7tya';
    const tokenCid = `ipfs://${cid}`;
    const url = tokenCid.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
    return (
        <div className="Token">
            <div className="pfp" style={{width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE}}>
                <h1>pfper #{tokenId}</h1>
                <object data={url} type="image/svg+xml">{tokenCid}</object>
            </div>
        </div>
    );
}

function Address() {
    const { address } = useParams();
    return (
        <div className="Address">
            <h1>{address}</h1>
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
