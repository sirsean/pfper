import { createSlice, configureStore } from '@reduxjs/toolkit';
import { GRID_SIZE } from './constants.js';

const initialColorMatrix = (size, color) => {
    let rows = new Array(size);
    for (let x=0; x < size; x++) {
        rows[x] = new Array(size);
        for (let y=0; y < size; y++) {
            rows[x][y] = color;
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
        colorMatrix: initialColorMatrix(GRID_SIZE, '#FCFBED'),
        colorIndex: 0,
        palette: [
            '#FCFBED', // navajo cream
            '#1F170C', // not black
            '#802E36', // apple blossom
            '#2E79BF', // wells beach
            '#26A38E', // northern lights
            '#A85516', // caramel square
            '#FACF32', // jacks pot
            '#4C379E', // blackened periwinkle
        ],
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
        setColorPoint: (state, action) => {
            const { x, y } = action.payload;
            state.colorMatrix[x][y] = state.palette[state.colorIndex];
        },
        setColorIndex: (state, action) => {
            state.colorIndex = action.payload;
        },
        clearColorMatrix: (state, action) => {
            state.colorMatrix = initialColorMatrix(GRID_SIZE, state.palette[0]);
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
        updatePalette: (state, action) => {
            const { colorIndex, color } = action.payload;
            state.palette[colorIndex] = color;
        },
    },
});

export const setHasWallet = slice.actions.setHasWallet;
export const setIsCorrectChain = slice.actions.setIsCorrectChain;
export const setAddress = slice.actions.setAddress;
export const setCost = slice.actions.setCost;
export const setColorPoint = slice.actions.setColorPoint;
export const setColorIndex = slice.actions.setColorIndex;
export const clearColorMatrix = slice.actions.clearColorMatrix;
export const setAddressTokens = slice.actions.setAddressTokens;
export const setToken = slice.actions.setToken;
export const updatePalette = slice.actions.updatePalette;

export const store = configureStore({
    reducer: slice.reducer,
});

export const selectHasWallet = state => state.hasWallet;
export const selectIsCorrectChain = state => state.isCorrectChain;
export const selectAddress = state => state.address;
export const selectCost = state => state.cost;
export const selectColorMatrix = state => state.colorMatrix;
export const selectColorIndex = state => state.colorIndex;
export const selectRenderedSvg = state => {
    const cm = state.colorMatrix;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_SIZE} ${GRID_SIZE}">`;
    for (let x=0; x < cm.length; x++) {
        for (let y=0; y < cm[x].length; y++) {
            svg += `<rect width="1" height="1" x="${x}" y="${y}" fill="${cm[x][y]}" />`;
        }
    }
    svg += `</svg>`;
    return svg;
};
export const selectAddressTokens = address => state => {
    return (state.addressTokens[address] || []);
};
export const selectToken = tokenId => state => {
    return state.tokens[tokenId];
};

export const selectPalette = state => state.palette;
