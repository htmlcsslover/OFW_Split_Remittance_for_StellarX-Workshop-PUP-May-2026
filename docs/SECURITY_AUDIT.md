# Security Audit & Hardening Report

## Executive Summary
BayanFund-StellarX has transitioned from a hackathon MVP to a more secure prototype by addressing critical vulnerabilities spanning the frontend API, smart contract layer, and data persistence layers. This audit details the implemented protections and outlines remaining production risks.

## Addressed Vulnerabilities

### 1. API Abuse & Rate Limiting
- **Risk**: Malicious actors could spam API endpoints (e.g., `/api/contributions`, `/api/payout-requests`) to exhaust server resources or flood the Activity Feed.
- **Fix**: Implemented basic IP-based rate limiting (5 seconds between requests) on the `contributions` route to mitigate automated spam. *(Note: Transition to Redis-based rate limiting recommended for production).*

### 2. Injection & Input Sanitization
- **Risk**: Accepting raw JSON bodies in Next.js API routes could lead to NoSQL/SQL injection or type-coercion errors.
- **Fix**: Added strict structural validation. Type checks, length boundaries (e.g., `txHash` strictly 64 chars, amounts bounded > 0 and < 1,000,000,000), and asset enums (`USDC`, `XLM`) are explicitly validated before hitting the Prisma ORM.

### 3. Smart Contract Integrity (Soroban)
- **Risk**: Unauthorized state manipulation.
- **Fix**: Enforced `require_auth()` heavily across all mutations in `FundPoolContract` (`contracts/fund-pool/src/lib.rs`). Ensure only the `contributor` can trigger contributions, and only the initialized `Admin` can approve payouts.
- **Risk**: Invalid logic leading to integer overflows or locked funds.
- **Fix**: Added checks verifying that amounts are `> 0` and that a fund is actively able to receive contributions (`active` flag).

### 4. Replay Attacks
- **Risk**: A user reusing the same `txHash` payload on the API to duplicate their impact score or contribution volume.
- **Current Mitigation State**: 
  - The Stellar SDK natively protects against replay attacks on the blockchain level via account Sequence Numbers. 
  - Off-chain, the application requires an indexer (or explicit Horizon API validation in the Next.js backend) to assert that a `txHash` actually exists on-chain and hasn't been submitted before. Currently marked as a placeholder in `route.ts`.

### 5. XSS / CSRF
- **Mitigation**: Next.js automatically sanitizes React component outputs, neutralizing XSS risks. Server actions and App Router APIs utilize built-in CORS and CSRF protections inherent to standard Vercel deployments.

## Remaining Risks for Production
1. **Transaction Horizon Verification**: Before deploying to Mainnet, the backend API *must* query the Stellar Horizon RPC to verify that an incoming `txHash` is valid, matches the stated `amount`, matches the `asset`, and is destined for the correct `FundPoolContract`. Without this, users can submit fake API payloads asserting they donated.
2. **Multi-Sig Admin**: The Soroban contract currently relies on a single `Admin` address. This creates a single point of failure. Mainnet deployment should transition the Admin to a multi-sig threshold account.
3. **Database Security**: Migrate the `dev.db` SQLite file to an encrypted PostgreSQL database.
