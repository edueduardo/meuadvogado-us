-- =============================================================================
-- CADASTRAR ADVOGADO DE TESTE
-- Execute no Supabase SQL Editor
-- =============================================================================

-- 1. Criar usuário
INSERT INTO "User" (
    "id", 
    "email", 
    "password", 
    "name", 
    "phone", 
    "role",
    "consentGiven",
    "updatedAt"
) VALUES (
    'user_test_1',
    'advogado@test.com',
    '$2a$10$YourHashedPasswordHere', -- Senha: test123 (você pode mudar depois)
    'Dr. João Silva',
    '(305) 555-1234',
    'LAWYER',
    true,
    NOW()
);

-- 2. Criar perfil de advogado
INSERT INTO "Lawyer" (
    "id",
    "userId",
    "slug",
    "headline",
    "bio",
    "city",
    "state",
    "publicPhone",
    "publicEmail",
    "barNumber",
    "barState",
    "yearsExperience",
    "languages",
    "plan",
    "verified",
    "featured",
    "active",
    "updatedAt"
) VALUES (
    'lawyer_test_1',
    'user_test_1',
    'dr-joao-silva-miami',
    'Especialista em Imigração e Vistos',
    'Advogado brasileiro com 15 anos de experiência em casos de imigração nos EUA. Especializado em vistos H1B, Green Card e cidadania americana. Atendo em português e inglês.',
    'Miami',
    'FL',
    '(305) 555-1234',
    'advogado@test.com',
    'FL12345',
    'FL',
    15,
    ARRAY['pt', 'en']::TEXT[],
    'FEATURED',
    true,
    true,
    true,
    NOW()
);

-- 3. Adicionar áreas de atuação (Imigração)
INSERT INTO "LawyerPracticeArea" (
    "id",
    "lawyerId",
    "practiceAreaId",
    "specialization"
) VALUES (
    'lpa_test_1',
    'lawyer_test_1',
    'pa1', -- Imigração
    'Vistos H1B, L1, Green Card, Cidadania'
);

-- 4. Adicionar mais uma área (Empresarial)
INSERT INTO "LawyerPracticeArea" (
    "id",
    "lawyerId",
    "practiceAreaId",
    "specialization"
) VALUES (
    'lpa_test_2',
    'lawyer_test_1',
    'pa6', -- Empresarial
    'Abertura de empresas, contratos'
);

-- Verificar se foi criado
SELECT 
    u."name",
    u."email",
    l."slug",
    l."city",
    l."state",
    l."plan",
    l."verified"
FROM "Lawyer" l
JOIN "User" u ON l."userId" = u."id"
WHERE l."id" = 'lawyer_test_1';
