# Database Architecture: BayanFund-StellarX

## Overview
The application has transitioned from a temporary in-memory store to a persistent relational database using **SQLite** (for local development) managed by the **Prisma ORM**. This enables robust schema definitions, relationship management, and data persistence across server restarts.

## Technology Stack
- **Database Engine**: SQLite (`dev.db`). (Easily swappable to PostgreSQL for production by changing the Prisma provider).
- **ORM**: Prisma Client.
- **Migration Engine**: Prisma Migrate.

## Core Entities (Schema)

### 1. User
- Stores both authenticated actors (Admins) and wallet-connected participants (Donors, NGOs, Schools).
- **Fields**: `id`, `walletAddress` (unique), `role`, `reputationScore`, `verificationStatus`.

### 2. Fund
- The central object tracking the life cycle of a crowdfunding campaign.
- **Fields**: `id`, `name`, `category` (mental_health, solar_school, etc.), `targetAmount`, `currentBalance`, `asset` (USDC/XLM).
- **Relations**: Connected to Contributions, PayoutRequests, and Activities.

### 3. Contribution
- Represents an on-chain or off-chain donation to a specific fund.
- **Fields**: `amount`, `asset`, `txHash` (to verify against the Stellar network), `status`.

### 4. PayoutRequest & Approval
- Manages the milestone-based fund disbursement process.
- **Fields**: `amount`, `requesterRole`, `status`, `publicMemo`, `evidenceUri`.
- **Approval**: Records an admin's signature/approval for releasing funds.

### 5. Activity
- A transparent event log for the public dashboard. Every critical action (contribution, payout request, approval) generates an immutable Activity record.

## Service Layer (`store.ts` via Prisma)
The repository pattern has been implemented in `web/src/lib/db/store.ts`. It wraps Prisma Client operations to ensure consistent data manipulation.
- Uses **Prisma Transactions** for atomic operations (e.g., updating a fund's balance and logging an Activity record simultaneously during a contribution).

## Next Steps
- Implement data seeding to ensure a rich testing environment.
- When migrating to Production, change the Prisma provider to `postgresql` and apply migrations to a cloud database (e.g., Supabase or AWS RDS).
