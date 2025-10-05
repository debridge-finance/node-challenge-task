// Seed data for development environment only
export const developmentSeeds = {
  chains: [
    {
      name: 'Ethereum',
      debridgeId: 1,
      isEnabled: true,
    },
    {
      name: 'Bitcoin', 
      debridgeId: 2,
      isEnabled: true,
    },
    {
      name: 'Solana',
      debridgeId: 3,
      isEnabled: true,
    }
  ],
  
  tokens: [
    {
      // Real Ethereum address for WETH
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      isNative: false,
      chainName: 'Ethereum',
    },
    {
      // Real USDC address on Ethereum
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isNative: false,
      chainName: 'Ethereum',
    },
    {
      // Native SOL (use special address or null)
      address: '11111111111111111111111111111111',
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      isNative: true,
      chainName: 'Solana',
    }
  ]
};