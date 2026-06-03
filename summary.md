# Project Summary: BayanFund-StellarX

BayanFund-StellarX (also referred to as **CareFund Stellar**) is a community-driven crowdfunding and social impact platform built on the Stellar network. It ensures transparency, security, and automated fund distribution through Soroban smart contracts and an immutable audit trail.

## 🚀 Tech Stack

### Frontend & Backend (Web)
- **Framework:** [Next.js 16](https://nextjs.org/) (React 19, TypeScript)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Wallet Integration:** [@stellar/freighter-api](https://github.com/stellar/freighter) & [@stellar/stellar-sdk](https://github.com/stellar/js-stellar-sdk)
- **ORM:** [Prisma 5](https://www.prisma.io/) (SQLite for local development, PostgreSQL ready)

### Blockchain (Smart Contracts)
- **Language:** [Rust](https://www.rust-lang.org/)
- **SDK:** [Soroban SDK v22](https://soroban.stellar.org/)
- **Network:** Stellar (Testnet)
- **Asset Handling:** Native Stellar Asset Contract (SAC) integration for XLM/USDC.

---

## 📂 Folder Structure

```text
/workspaces/BayanFund-StellarX
├── contracts/          # Soroban Smart Contracts (Rust)
│   └── fund-pool/      # Core logic for escrow, payouts, and contribution tracking
├── web/                # Next.js Application
│   ├── prisma/         # Schema definitions, migrations, and seeding scripts
│   ├── src/app/        # App Router pages (Dashboard, Admin, Funds marketplace)
│   ├── src/components/ # Reusable UI (Activity feeds, Contribution forms)
│   ├── src/lib/        # Stellar SDK helpers, Prisma client, and API services
│   └── src/data/       # Static metadata and category definitions
├── docs/               # System architecture and task-specific reports
└── scripts/            # Deployment and management scripts
```

---

## ✨ Key Features & Functionality

- **Modular Social Impact Funds:** Supports specialized modules for Mental Health, Community Solar, Senior Stipends, and Free School Lunches.
- **End-to-End Stellar Contributions:** Real testnet flow where users sign `Payment` operations via Freighter, and the resulting `txHash` is persisted and verifiable.
- **On-Chain Escrow (Soroban):** Updated smart contracts that physically hold and dispense tokens (`soroban_sdk::token`) upon approval.
- **Transparency Dashboard:** A live activity feed pulling from Prisma, displaying real-time contributions and linking directly to [Stellar Expert](https://stellar.expert).
- **Admin Approval Workflow:** A dedicated `/admin` interface to review, approve, and finalize payout requests, triggering database and (planned) contract updates.
- **Impact Tracking System:** A structured schema and documentation for organizations to upload "Proof of Impact" (photos/receipts) following fund disbursement.

---

## 🛠️ Improvements over Hackathon MVP

- **Persistent Data:** Replaced the fragile in-memory store with a robust Prisma/SQLite relational database.
- **Type-Safe Architecture:** Eliminated all build errors and mock-data dependencies, enforcing strict TypeScript interfaces across the stack.
- **Realistic Seed Data:** A comprehensive seeding system to populate the platform with diverse, realistic community projects for demo readiness.
- **Security Hardening:** Implemented API rate limiting, strict input validation, and `require_auth()` enforcement in smart contracts.
- **Turbopack Optimized:** Configured `next.config.ts` and Prisma engines to ensure 100% compatibility with the latest Next.js 16 build environment.

---

## ⚠️ Current Limitations

- **Client-Side txHash Trust:** The backend currently accepts the `txHash` provided by the frontend. Production readiness requires an automated verification step via Horizon RPC to mathematically confirm the transaction's validity on the ledger.
- **Singleton Contract:** The `FundPoolContract` currently manages all funds as a single deployment. A "Factory" pattern is recommended for Mainnet to isolate each campaign's storage and risk.
- **Multi-Sig Governance:** Admin approvals are currently tied to a single address. Transitioning to a multi-signature threshold is required for true decentralization.
- **Off-Chain Encryption:** While the schema supports `privateMemoCiphertext`, the actual PGP/AES encryption layer for sensitive beneficiary data is still in the architectural phase.
