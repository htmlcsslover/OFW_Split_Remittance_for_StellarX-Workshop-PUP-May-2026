-- CareFund Stellar MVP schema.
-- SQLite compatible. PostgreSQL migration notes:
-- - replace TEXT CHECK enums with native enum types if desired
-- - replace DATETIME defaults with TIMESTAMPTZ DEFAULT now()
-- - replace INTEGER boolean flags with BOOLEAN

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('donor', 'beneficiary', 'provider', 'school', 'ngo', 'investor', 'admin')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'flagged')),
  reputation_score INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS funds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mental_health', 'solar_school', 'senior_stipend', 'school_lunch')),
  location TEXT NOT NULL,
  sponsor TEXT NOT NULL,
  description TEXT NOT NULL,
  asset TEXT NOT NULL DEFAULT 'USDC' CHECK (asset IN ('USDC', 'XLM')),
  target_amount INTEGER NOT NULL,
  current_balance INTEGER NOT NULL DEFAULT 0,
  monthly_flow INTEGER NOT NULL DEFAULT 0,
  privacy_level TEXT NOT NULL DEFAULT 'limited',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  contract_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_by_user_id TEXT REFERENCES users(id),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  fund_id TEXT NOT NULL REFERENCES funds(id),
  contributor_user_id TEXT REFERENCES users(id),
  contributor_wallet TEXT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  asset TEXT NOT NULL DEFAULT 'USDC',
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payout_requests (
  id TEXT PRIMARY KEY,
  fund_id TEXT NOT NULL REFERENCES funds(id),
  requester_user_id TEXT REFERENCES users(id),
  requester_role TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  asset TEXT NOT NULL DEFAULT 'USDC',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  public_memo TEXT NOT NULL,
  private_memo_ciphertext TEXT,
  evidence_uri TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  payout_request_id TEXT NOT NULL REFERENCES payout_requests(id),
  approver_user_id TEXT REFERENCES users(id),
  approver_role TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_schedules (
  id TEXT PRIMARY KEY,
  fund_id TEXT NOT NULL REFERENCES funds(id),
  beneficiary_alias TEXT NOT NULL,
  beneficiary_wallet TEXT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  cadence TEXT NOT NULL CHECK (cadence IN ('weekly', 'monthly')),
  next_run_at DATETIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solar_shares (
  id TEXT PRIMARY KEY,
  fund_id TEXT NOT NULL REFERENCES funds(id),
  investor_user_id TEXT REFERENCES users(id),
  investor_wallet TEXT,
  shares INTEGER NOT NULL CHECK (shares > 0),
  principal_amount INTEGER NOT NULL CHECK (principal_amount > 0),
  projected_return_bps INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_invoices (
  id TEXT PRIMARY KEY,
  fund_id TEXT NOT NULL REFERENCES funds(id),
  supplier_user_id TEXT REFERENCES users(id),
  invoice_number TEXT NOT NULL,
  meal_count INTEGER NOT NULL CHECK (meal_count > 0),
  amount INTEGER NOT NULL CHECK (amount > 0),
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'verified', 'disputed')),
  payout_request_id TEXT REFERENCES payout_requests(id),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  fund_id TEXT NOT NULL REFERENCES funds(id),
  actor_label TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  asset TEXT NOT NULL DEFAULT 'USDC',
  public_note TEXT NOT NULL,
  tx_hash TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
