import React from 'react';
import { useSelector } from 'react-redux';
import {
    Link,
    useParams,
} from 'react-router-dom';
import { isCorrectChainAsync, loadContract, fetchToken } from '../wallet.js';
import { GRID_SIZE, CELL_SIZE } from '../constants.js';
import {
    store,
    selectHasWallet,
    selectIsCorrectChain,
    selectToken,
    setHasWallet,
    setIsCorrectChain,
    setToken
} from '../database.js';
import { retryOperation } from '../util.js';
import { wrapIpfs } from '../ipfs.js';
import { Header, NoWallet, SwitchChain } from './layout.js';

export default function Token() {
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

