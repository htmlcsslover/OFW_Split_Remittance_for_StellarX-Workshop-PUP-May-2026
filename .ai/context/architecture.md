# Architecture: BayanFund-StellarX

## High-Level Stack
- **Frontend**: Next.js / React (TypeScript)
- **Blockchain**: Stellar Network / Soroban Smart Contracts
- **Wallet**: Freighter / Albedo integration
- **Index/Backend**: Soroban RPC / Horizon API (Minimal custom backend)
- **Styling**: Vanilla CSS / Tailwind (if applicable)

## System Components
1. **Soroban Contracts**:
   - `CampaignContract`: Manages individual campaign state, milestones, and fund logic.
   - `FactoryContract`: Deploys new campaign contracts.
2. **Frontend App**:
   - `StellarProvider`: Context provider for wallet and network interactions.
   - `CampaignHooks`: Custom hooks for interacting with Soroban contracts.
   - `Dashboard`: Real-time view of campaign progress.
3. **Stellar Network Interaction**:
   - Uses `stellar-sdk` for transaction building and XDR parsing.
   - Connects to Testnet for development.

## Data Flow
1. User connects wallet (Freighter).
2. Frontend fetches campaign data from Soroban RPC.
3. User signs transaction for donation or milestone approval.
4. Transaction is submitted to Stellar; contract state updates.
5. Frontend reflects updated state immediately.

## Security Considerations
- All financial logic resides in Soroban contracts.
- Frontend values are for display only; the contract is the source of truth.
- Private keys never touch the application (handled by wallet extensions).
