import React from 'react';
import { useSelector } from 'react-redux';
import {
    useNavigate,
} from 'react-router-dom';
import { store, actions, selectors } from '../database.js';
import { connectWalletOnClick, loadContract } from '../wallet.js';
import { encodeBlob, storeCar } from '../storage.js';

const {
    clearColorMatrix,
} = actions;

const {
    selectAddress,
    selectCost,
    selectRenderedSvg,
} = selectors;

export default function MintBar() {
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
                    encodeBlob(svg),
                ]).then(([cost, { cid, car }]) => {
                    return contract.mintPfp(cid.toString(), { value: cost })
                        .then(tx => tx.wait())
                        .then(receipt => {
                            return storeCar(car);
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
