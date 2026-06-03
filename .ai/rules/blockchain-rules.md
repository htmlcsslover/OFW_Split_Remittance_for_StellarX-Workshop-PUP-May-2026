# Blockchain Rules: BayanFund-StellarX

## Core Principles
1. **Trustless by Design**: The contract must enforce the rules, not the frontend.
2. **Deterministic Behavior**: Ensure contract results are predictable.
3. **User Empowerment**: Users must always have control over their funds until committed to a contract.

## Stellar Network Usage
- **Network**: Stellar Testnet (Current).
- **Assets**: XLM (Native) and potentially Stellar Assets (SAC).
- **Fees**: Use dynamic fee estimation where possible, or sensible defaults for the hackathon.

## Wallet & Signing
- **Safety**: Never prompt for a private key. Always use browser-based wallets (Freighter, etc.).
- **Feedback**: Provide clear UI feedback during the "Wait for Signature" and "Wait for Network" phases.
- **XDR**: Always validate XDR content before presenting it for signing if possible.

## Soroban Contract Interaction
- **Authorization**: Use `env.authorizers().require_auth()` for sensitive actions.
- **Events**: Emit events for every significant state change to aid frontend indexing.
- **Limits**: Be mindful of Soroban resource limits (CPU, RAM).
