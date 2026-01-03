-- =============================================================================
-- LEGALAI - POPULAR DADOS INICIAIS NO SUPABASE
-- Execute este SQL no Supabase Studio: SQL Editor (APÓS criar as tabelas)
-- =============================================================================

-- Practice Areas
INSERT INTO "PracticeArea" ("id", "name", "nameEn", "slug", "icon", "order", "active") VALUES
('pa1', 'Imigração', 'Immigration', 'imigracao', 'Plane', 1, true),
('pa2', 'Acidentes Pessoais', 'Personal Injury', 'acidentes', 'AlertTriangle', 2, true),
('pa3', 'Direito de Família', 'Family Law', 'familia', 'Users', 3, true),
('pa4', 'Direito Trabalhista', 'Employment Law', 'trabalho', 'Briefcase', 4, true),
('pa5', 'Direito Criminal', 'Criminal Defense', 'criminal', 'Shield', 5, true),
('pa6', 'Direito Empresarial', 'Business Law', 'empresarial', 'Building', 6, true),
('pa7', 'Direito Imobiliário', 'Real Estate', 'imobiliario', 'Home', 7, true),
('pa8', 'Planejamento Patrimonial', 'Estate Planning', 'patrimonio', 'FileText', 8, true),
('pa9', 'Falência', 'Bankruptcy', 'falencia', 'DollarSign', 9, true),
('pa10', 'Outros', 'Other', 'outros', 'MoreHorizontal', 10, true)
ON CONFLICT ("slug") DO NOTHING;

-- Cities
INSERT INTO "City" ("id", "name", "state", "stateFullName", "slug", "brazilianPopulation", "featured", "active") VALUES
('c1', 'Miami', 'FL', 'Florida', 'miami-fl', 300000, true, true),
('c2', 'Orlando', 'FL', 'Florida', 'orlando-fl', 100000, true, true),
('c3', 'New York', 'NY', 'New York', 'new-york-ny', 250000, true, true),
('c4', 'Newark', 'NJ', 'New Jersey', 'newark-nj', 150000, true, true),
('c5', 'Boston', 'MA', 'Massachusetts', 'boston-ma', 200000, true, true),
('c6', 'Los Angeles', 'CA', 'California', 'los-angeles-ca', 100000, true, true),
('c7', 'Houston', 'TX', 'Texas', 'houston-tx', 80000, false, true),
('c8', 'Atlanta', 'GA', 'Georgia', 'atlanta-ga', 50000, false, true),
('c9', 'Fort Lauderdale', 'FL', 'Florida', 'fort-lauderdale-fl', 60000, false, true),
('c10', 'Pompano Beach', 'FL', 'Florida', 'pompano-beach-fl', 40000, false, true),
('c11', 'Deerfield Beach', 'FL', 'Florida', 'deerfield-beach-fl', 30000, false, true),
('c12', 'Framingham', 'MA', 'Massachusetts', 'framingham-ma', 25000, false, true),
('c13', 'San Francisco', 'CA', 'California', 'san-francisco-ca', 30000, false, true),
('c14', 'Washington', 'DC', 'District of Columbia', 'washington-dc', 25000, false, true),
('c15', 'Philadelphia', 'PA', 'Pennsylvania', 'philadelphia-pa', 20000, false, true)
ON CONFLICT ("slug") DO NOTHING;

-- Settings
INSERT INTO "Settings" ("id", "pricePremium", "priceFeatured", "pricePerLead", "priceAnalysis", "updatedAt") VALUES
('global', 14900, 29900, 2000, 4900, NOW())
ON CONFLICT ("id") DO UPDATE SET
    "pricePremium" = EXCLUDED."pricePremium",
    "priceFeatured" = EXCLUDED."priceFeatured",
    "pricePerLead" = EXCLUDED."pricePerLead",
    "priceAnalysis" = EXCLUDED."priceAnalysis",
    "updatedAt" = NOW();
