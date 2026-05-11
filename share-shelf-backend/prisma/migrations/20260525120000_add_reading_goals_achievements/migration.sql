CREATE TABLE "reading_goals" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "targetBooks" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reading_achievements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "year" INTEGER,
    "threshold" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_achievements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reading_goals_userId_year_key" ON "reading_goals"("userId", "year");
CREATE INDEX "reading_goals_userId_idx" ON "reading_goals"("userId");

CREATE UNIQUE INDEX "reading_achievements_userId_type_year_key" ON "reading_achievements"("userId", "type", "year");
CREATE INDEX "reading_achievements_userId_createdAt_idx" ON "reading_achievements"("userId", "createdAt");

ALTER TABLE "reading_goals" ADD CONSTRAINT "reading_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reading_achievements" ADD CONSTRAINT "reading_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
