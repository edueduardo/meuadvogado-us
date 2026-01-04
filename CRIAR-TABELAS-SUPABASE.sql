-- =============================================================================
-- LEGALAI - CRIAR TABELAS NO SUPABASE
-- Execute este SQL no Supabase Studio: SQL Editor
-- =============================================================================

-- Enums
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'LAWYER', 'ADMIN');
CREATE TYPE "LawyerPlan" AS ENUM ('FREE', 'PREMIUM', 'FEATURED');
CREATE TYPE "CaseStatus" AS ENUM ('NEW', 'ANALYZING', 'ANALYZED', 'MATCHED', 'CONTACTED', 'CONVERTED', 'CLOSED');
CREATE TYPE "CaseUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "photo" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "emailVerified" TIMESTAMP(3),
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "dataRetentionUntil" TIMESTAMP(3),
    "deletionRequested" BOOLEAN NOT NULL DEFAULT false,
    "deletionRequestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- Lawyer
CREATE TABLE "Lawyer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT,
    "zipcode" TEXT,
    "publicPhone" TEXT,
    "publicEmail" TEXT,
    "website" TEXT,
    "whatsapp" TEXT,
    "barNumber" TEXT,
    "barState" TEXT,
    "oabBrazil" TEXT,
    "yearsExperience" INTEGER,
    "languages" TEXT[] DEFAULT ARRAY['pt', 'en']::TEXT[],
    "plan" "LawyerPlan" NOT NULL DEFAULT 'FREE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "responseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lawyer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lawyer_userId_key" ON "Lawyer"("userId");
CREATE UNIQUE INDEX "Lawyer_slug_key" ON "Lawyer"("slug");
CREATE INDEX "Lawyer_city_state_verified_active_idx" ON "Lawyer"("city", "state", "verified", "active");
CREATE INDEX "Lawyer_state_verified_active_idx" ON "Lawyer"("state", "verified", "active");
CREATE INDEX "Lawyer_plan_featured_verified_idx" ON "Lawyer"("plan", "featured", "verified");
CREATE INDEX "Lawyer_slug_idx" ON "Lawyer"("slug");

-- PracticeArea
CREATE TABLE "PracticeArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PracticeArea_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PracticeArea_slug_key" ON "PracticeArea"("slug");
CREATE INDEX "PracticeArea_slug_idx" ON "PracticeArea"("slug");
CREATE INDEX "PracticeArea_active_order_idx" ON "PracticeArea"("active", "order");

-- LawyerPracticeArea
CREATE TABLE "LawyerPracticeArea" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "practiceAreaId" TEXT NOT NULL,
    "specialization" TEXT,
    CONSTRAINT "LawyerPracticeArea_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LawyerPracticeArea_lawyerId_practiceAreaId_key" ON "LawyerPracticeArea"("lawyerId", "practiceAreaId");
CREATE INDEX "LawyerPracticeArea_practiceAreaId_lawyerId_idx" ON "LawyerPracticeArea"("practiceAreaId", "lawyerId");

-- Client
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'pt',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- Case
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT NOT NULL,
    "contactCity" TEXT,
    "contactState" TEXT,
    "practiceAreaId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "additionalInfo" JSONB,
    "status" "CaseStatus" NOT NULL DEFAULT 'NEW',
    "matchedLawyerId" TEXT,
    "matchedAt" TIMESTAMP(3),
    "matchScore" INTEGER,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "retentionPeriod" INTEGER NOT NULL DEFAULT 365,
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Case_status_practiceAreaId_createdAt_idx" ON "Case"("status", "practiceAreaId", "createdAt");
CREATE INDEX "Case_matchedLawyerId_status_idx" ON "Case"("matchedLawyerId", "status");
CREATE INDEX "Case_qualityScore_idx" ON "Case"("qualityScore");
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt");

-- CaseAnalysis
CREATE TABLE "CaseAnalysis" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "suggestedArea" TEXT NOT NULL,
    "urgency" "CaseUrgency" NOT NULL DEFAULT 'MEDIUM',
    "complexity" TEXT NOT NULL DEFAULT 'medium',
    "keyIssues" JSONB NOT NULL DEFAULT '[]',
    "potentialChallenges" JSONB NOT NULL DEFAULT '[]',
    "recommendedActions" JSONB NOT NULL DEFAULT '[]',
    "estimatedCostMin" INTEGER,
    "estimatedCostMax" INTEGER,
    "estimatedTimeline" TEXT,
    "successProbability" INTEGER,
    "aiModel" TEXT NOT NULL DEFAULT 'claude-3-5-sonnet',
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "rawResponse" TEXT,
    "disclaimer" TEXT NOT NULL DEFAULT 'AVISO: Esta análise é apenas informativa e NÃO constitui aconselhamento jurídico. Consulte um advogado licenciado.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CaseAnalysis_caseId_key" ON "CaseAnalysis"("caseId");
CREATE INDEX "CaseAnalysis_urgency_idx" ON "CaseAnalysis"("urgency");
CREATE INDEX "CaseAnalysis_caseId_idx" ON "CaseAnalysis"("caseId");

-- LawyerVerification
CREATE TABLE "LawyerVerification" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "barLicenseUrl" TEXT,
    "barNumber" TEXT NOT NULL,
    "barState" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "barNumberChecked" BOOLEAN NOT NULL DEFAULT false,
    "licenseActive" BOOLEAN NOT NULL DEFAULT false,
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LawyerVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LawyerVerification_lawyerId_key" ON "LawyerVerification"("lawyerId");
CREATE INDEX "LawyerVerification_status_idx" ON "LawyerVerification"("status");

-- Review
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_clientId_lawyerId_key" ON "Review"("clientId", "lawyerId");
CREATE INDEX "Review_lawyerId_verified_idx" ON "Review"("lawyerId", "verified");
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- City
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateFullName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brazilianPopulation" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");
CREATE INDEX "City_state_idx" ON "City"("state");
CREATE INDEX "City_featured_idx" ON "City"("featured");
CREATE INDEX "City_slug_idx" ON "City"("slug");

-- Settings
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "pricePremium" INTEGER NOT NULL DEFAULT 14900,
    "priceFeatured" INTEGER NOT NULL DEFAULT 29900,
    "pricePerLead" INTEGER NOT NULL DEFAULT 2000,
    "priceAnalysis" INTEGER NOT NULL DEFAULT 4900,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "Lawyer" ADD CONSTRAINT "Lawyer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LawyerPracticeArea" ADD CONSTRAINT "LawyerPracticeArea_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LawyerPracticeArea" ADD CONSTRAINT "LawyerPracticeArea_practiceAreaId_fkey" FOREIGN KEY ("practiceAreaId") REFERENCES "PracticeArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Case" ADD CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Case" ADD CONSTRAINT "Case_practiceAreaId_fkey" FOREIGN KEY ("practiceAreaId") REFERENCES "PracticeArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Case" ADD CONSTRAINT "Case_matchedLawyerId_fkey" FOREIGN KEY ("matchedLawyerId") REFERENCES "Lawyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseAnalysis" ADD CONSTRAINT "CaseAnalysis_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LawyerVerification" ADD CONSTRAINT "LawyerVerification_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
