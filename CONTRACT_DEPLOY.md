# DateGame Contract Deployment

## Contract Information
- **Contract Name:** DateGame
- **Network:** Coti Testnet
- **Contract Address:** `0xBd54B68007706e6182DbBED88B147bDF53C31955`
- **Transaction Hash:** `0xbda15a8362fba78df01cfe87cae28a006ac5f0977ac41ca7bd1cd1a8de32b792`
- **Deployer Address:** `0xe45FC1a7D84e73C8c71EdF2814E7467F7C86a8A2`
- **Deployment Date:** October 29, 2025

## Network Configuration
- **RPC URL:** https://testnet.coti.io/rpc
- **Chain ID:** 7082400
- **Gas Limit:** 3,000,000
- **Gas Price:** 10 gwei

## Dependencies Installed
- `@coti-io/coti-contracts` - Required for MPC functionality
- `@nomicfoundation/hardhat-ethers` - Hardhat Ethers plugin
- `hardhat` - Development framework
- `ethers` - Ethereum library
- `dotenv` - Environment variables

## Deployment Process
1. Installed required dependencies including `@coti-io/coti-contracts`
2. Created deployment script with proper ES module imports
3. Configured network settings for Coti Testnet
4. Successfully deployed with explicit gas settings

## Usage Commands
```bash
# Compile contracts
npm run compile

# Deploy to Coti Testnet
npm run deploy:coti
```

## Environment Variables Required
```
DEPLOYER_PRIVATE_KEY=your_private_key_here
VITE_APP_NODE_HTTPS_ADDRESS=https://testnet.coti.io/rpc
```

## Contract Features
- MPC-based encrypted date storage and comparison
- Encrypted addition operations
- Date comparison functions (greaterThan, lessThan)
- User-specific ciphertext handling