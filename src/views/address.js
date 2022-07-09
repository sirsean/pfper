import React from 'react';
import { useSelector } from 'react-redux';
import {
    Link,
    useParams,
} from 'react-router-dom';
import { store, actions, selectors } from '../database.js';
import { isCorrectChainAsync, loadContract, fetchToken } from '../wallet.js';
import { retryOperation } from '../util.js';
import { wrapIpfs } from '../ipfs.js';
import { Header, NoWallet, SwitchChain } from './layout.js';

const {
    setHasWallet,
    setIsCorrectChain,
    setAddressTokens,
} = actions;

const {
    selectHasWallet,
    selectIsCorrectChain,
    selectAddressTokens,
} = selectors;

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

export default function Address() {
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
