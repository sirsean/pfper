import { ethers } from 'ethers';

export const PFPER_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const NETWORK_PARAMS = {
    chainId: ethers.BigNumber.from(31337).toHexString(),
    chainName: 'Hardhat',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: ['http://localhost:8545'],
};

