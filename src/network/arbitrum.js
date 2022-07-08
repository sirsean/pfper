import { ethers } from 'ethers';

export const PFPER_CONTRACT_ADDRESS = '0xCF4fD95771aeB088c50Aec7Ea8Df8C11c034ffB3';

export const NETWORK_PARAMS = {
    chainId: ethers.BigNumber.from(42161).toHexString(),
    chainName: 'Arbitrum',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io/'],
};

