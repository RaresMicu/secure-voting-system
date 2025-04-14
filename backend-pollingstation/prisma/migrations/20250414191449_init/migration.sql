-- CreateTable
CREATE TABLE "SecuredStoringBox" (
    "vote_id" TEXT NOT NULL PRIMARY KEY,
    "candidate" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VoteResults" (
    "candidate" TEXT NOT NULL PRIMARY KEY,
    "votes" INTEGER NOT NULL DEFAULT 0
);
