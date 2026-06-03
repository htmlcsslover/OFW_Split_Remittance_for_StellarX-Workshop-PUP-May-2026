# Smart Contract Architecture

## Overview
The Soroban smart contract logic resides in `contracts/fund-pool`. It has been upgraded from a basic MVP state store to a fully functional asset-handling contract capable of escrowing and dispensing Stellar native/SAC tokens (e.g., USDC, XLM).

## Core Enhancements

### 1. `contribute`
- **Before**: Only incremented an internal ledger variable.
- **After**: Implements `token::Client::new(&env, &asset_addr).transfer(...)`. The contract actively pulls the specified token amount from the contributor into its own balance, physically escrowing the funds.
- **Validation**: Enforces strict authorization (`require_auth()`) and asserts the fund is `active`.

### 2. `request_payout`
- Initiates a withdrawal process. 
- Allows providers/NGOs to formally request funds from an active contract. Validates sufficient total fund balance isn't required until the approval phase.

### 3. `approve_payout`
- **Before**: Modified a boolean flag.
- **After**: Validates sufficient on-chain contract balance, deducts the internal ledger, and then triggers `token::Client::transfer(...)` to move the tokens from the contract's treasury to the requester's `Address`.
- **Authorization**: Restricts this function to the Admin (or a designated multi-sig quorum in future iterations).

### 4. `close_fund`
- A newly added administrative function to halt further contributions or payout requests for completed campaigns.
- Emits an `active: false` state change.

## State Management (`DataKey` Strategy)
- **`Admin` & `Asset`**: Stored as `Instance` variables since they apply to the entire deployed contract configuration.
- **`Fund` & `Contribution`**: Stored as `Persistent` variables linked to `u32` IDs, ensuring they are not evicted if TTL expires, giving users long-term guarantees.
- **`Verification`**: A registry mapping `Address` to an authorization tier.

## Future Optimization
- **Multi-Contract Ecosystem**: The `FundPoolContract` currently acts as a singleton managing all modules. The next iteration should use a Factory pattern where each `create_fund` invocation deploys a dedicated Wasm instance, isolating state per campaign.
