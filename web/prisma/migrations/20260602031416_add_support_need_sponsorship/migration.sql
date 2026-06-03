-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fundId" TEXT NOT NULL,
    "donorId" TEXT,
    "supportRequestId" TEXT,
    "walletAddress" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "asset" TEXT NOT NULL DEFAULT 'USDC',
    "txHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contribution_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contribution_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Contribution_supportRequestId_fkey" FOREIGN KEY ("supportRequestId") REFERENCES "SupportRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Contribution" ("amount", "asset", "createdAt", "donorId", "fundId", "id", "txHash", "walletAddress") SELECT "amount", "asset", "createdAt", "donorId", "fundId", "id", "txHash", "walletAddress" FROM "Contribution";
DROP TABLE "Contribution";
ALTER TABLE "new_Contribution" RENAME TO "Contribution";
CREATE UNIQUE INDEX "Contribution_txHash_key" ON "Contribution"("txHash");
CREATE TABLE "new_SupportRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fundId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "amountRaised" DECIMAL NOT NULL DEFAULT 0,
    "donorCount" INTEGER NOT NULL DEFAULT 0,
    "purpose" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportRequest_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupportRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SupportRequest" ("amount", "createdAt", "description", "fundId", "id", "purpose", "requesterId", "status") SELECT "amount", "createdAt", "description", "fundId", "id", "purpose", "requesterId", "status" FROM "SupportRequest";
DROP TABLE "SupportRequest";
ALTER TABLE "new_SupportRequest" RENAME TO "SupportRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
