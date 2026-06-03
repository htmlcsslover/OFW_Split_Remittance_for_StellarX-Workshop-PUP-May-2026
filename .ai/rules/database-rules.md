# Database Rules: BayanFund-StellarX

## Blockchain as the Primary Database
In BayanFund-StellarX, the **Stellar Network** (and Soroban storage) is the primary source of truth for all campaign and financial data.

## Off-Chain Storage (If needed)
If any off-chain database (e.g., Supabase, PostgreSQL) is introduced for caching or metadata:
1. **Never store private keys** or sensitive financial credentials.
2. **Metadata only**: Store data that doesn't fit on-chain (e.g., long campaign descriptions, high-res images).
3. **Synchronization**: Ensure off-chain data is always validated against the on-chain state.
4. **Read-Only Cache**: Treat the database as a fast read-cache for blockchain data.

## Storage Strategies (Soroban)
1. **Instance Storage**: For frequently accessed campaign state.
2. **Persistent Storage**: For long-term data like campaign parameters.
3. **Temporary Storage**: Avoid if possible, or use only for transient data.
