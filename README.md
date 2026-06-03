# CareFund Stellar

**Unified Social Impact Funding on the Stellar Network**

CareFund Stellar is a community-driven transparency platform designed to manage and track social impact funds in the Philippines. By leveraging the Stellar blockchain, the platform ensures that every contribution and disbursement is immutable, traceable, and publicly verifiable.

## 🚀 Impact Modules

The platform manages four specialized impact categories:
- **Mental Health Access Fund:** Subsidizing counseling and therapy for underserved communities.
- **Community Solar for Schools:** Funding sustainable energy infrastructure for public schools.
- **Senior Care Stipend:** Automated, transparent distribution of aid to elderly citizens.
- **Free School Lunch Fund:** Supporting nutritional programs for children in local municipalities.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS.
- **Wallet:** Freighter Extension integration for secure on-chain interactions.
- **Ledger:** Stellar Testnet for immutable activity logging and disbursements.
- **Backend:** Next.js API Routes with Prisma ORM and SQLite (MVP) / PostgreSQL.
- **Contracts:** Soroban-ready `FundPool` contract architecture.

## 💎 Key Features

- **Public Audit Trail:** A real-time, on-chain transparency ledger.
- **Role-Based Workflows:** Tailored dashboards for Donors, Beneficiaries, Organizations, and Admins.
- **Multi-Asset Support:** native support for XLM and USDC (Testnet).
- **Verification Engine:** Admin-led approval queue for fund disbursements.
- **Impact Metrics:** Real-time tracking of total funds raised and funding requests supported.

## 🗺 Demo "Golden Path"

To experience the full transparency flow:
1. **Organization:** Manage funds and review incoming funding requests.
2. **Donor:** Connect Freighter and contribute Testnet XLM/USDC to an active fund.
3. **Beneficiary:** Submit a funding request for a specific need.
4. **Admin:** Audit and verify the request, then approve it for disbursement.
5. **Public:** View the "Transparency" ledger to see the transaction hash on Stellar Expert.

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- [Freighter Wallet](https://www.freighter.app/) (set to Testnet)

### Local Development

1. **Clone and Install:**
   ```bash
   npm install
   ```

2. **Setup Environment:**
   Create a `web/.env.local` file:
   ```env
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_STELLAR_TREASURY_ADDRESS=GA... (Your Testnet G-address)
   NEXT_PUBLIC_STELLAR_EXPERT_BASE_URL=https://stellar.expert/explorer/testnet/tx
   DATABASE_URL="file:./dev.db"
   ```

3. **Run the App:**
   ```bash
   cd web
   npm run dev
   ```

4. **Seed Database (Optional):**
   ```bash
   npx prisma db seed
   ```

## 📜 Smart Contract Surface

The platform is designed to interface with Soroban smart contracts for trustless governance:
- `contribute`: Record a contribution to a specific fund pool.
- `request_payout`: Beneficiary request for aid authorization.
- `approve_payout`: Admin/Multisig approval for fund movement.
- `set_verification`: Update the status of participants (KYC/KYB).

---
*Built for the Stellar Community. Powering transparency in social impact.*
