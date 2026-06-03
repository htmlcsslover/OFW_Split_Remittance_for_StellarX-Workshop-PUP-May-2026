# CareFund Stellar Web

Next.js 16 frontend for CareFund Stellar.

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Key Routes

- `/` landing page
- `/dashboard` fund and impact dashboard
- `/funds` fund marketplace
- `/create-fund` fund creation
- `/mental-health` therapy and counseling payout requests
- `/solar` school solar investment flow
- `/senior-stipends` recurring stipend scheduler
- `/lunch-invoices` supplier invoice flow
- `/admin` payout and verification dashboard

## API Routes

- `GET /api/funds`
- `POST /api/funds`
- `POST /api/contributions`
- `GET /api/payout-requests`
- `POST /api/payout-requests`
- `POST /api/approvals`
- `GET /api/activity`
