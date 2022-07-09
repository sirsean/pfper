import { createSlice, configureStore } from '@reduxjs/toolkit';
import { GRID_SIZE, COLORS } from './constants.js';

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
        hasWallet: false,
        isCorrectChain: false,
        address: null,
        cost: null,
        addressTokens: {},
        tokens: {},
        colorMatrix: initialColorMatrix(GRID_SIZE),
        colorIndex: 0,
    },
    reducers: {
        setHasWallet: (state, action) => {
            state.hasWallet = action.payload;
        },
        setIsCorrectChain: (state, action) => {
            state.isCorrectChain = action.payload;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        setCost: (state, action) => {
            state.cost = action.payload;
        },
        setColor: (state, action) => {
            const { x, y } = action.payload;
            state.colorMatrix[x][y] = state.colorIndex;
        },
        setColorIndex: (state, action) => {
            state.colorIndex = action.payload;
        },
        clearColorMatrix: (state, action) => {
            state.colorMatrix = initialColorMatrix(GRID_SIZE);
        },
        setAddressTokens: (state, action) => {
            const { address, tokens } = action.payload;
            if (!state.addressTokens[address] || state.addressTokens[address].length !== tokens.length) {
                state.addressTokens[address] = tokens;
            }
        },
        setToken: (state, action) => {
            const token = action.payload;
            if (!state.tokens[token.tokenId]) {
                state.tokens[token.tokenId] = token;
            }
        },
    },
});

export const setHasWallet = slice.actions.setHasWallet;
export const setIsCorrectChain = slice.actions.setIsCorrectChain;
export const setAddress = slice.actions.setAddress;
export const setCost = slice.actions.setCost;
export const setColor = slice.actions.setColor;
export const setColorIndex = slice.actions.setColorIndex;
export const clearColorMatrix = slice.actions.clearColorMatrix;
export const setAddressTokens = slice.actions.setAddressTokens;
export const setToken = slice.actions.setToken;

export const store = configureStore({
    reducer: slice.reducer,
});

export const selectors = {
    selectHasWallet: state => state.hasWallet,
    selectIsCorrectChain: state => state.isCorrectChain,
    selectAddress: state => state.address,
    selectCost: state => state.cost,
    selectColorMatrix: state => state.colorMatrix,
    selectColorIndex: state => state.colorIndex,
    selectRenderedSvg: state => {
        const cm = state.colorMatrix;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_SIZE} ${GRID_SIZE}">`;
        for (let x=0; x < cm.length; x++) {
            for (let y=0; y < cm[x].length; y++) {
                svg += `<rect width="1" height="1" x="${x}" y="${y}" fill="${COLORS[cm[x][y]]}" />`;
            }
        }
        svg += `</svg>`;
        return svg;
    },
    selectAddressTokens: address => state => {
        return (state.addressTokens[address] || []);
    },
    selectToken: tokenId => state => {
        return state.tokens[tokenId];
    },
};
