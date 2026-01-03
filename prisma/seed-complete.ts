// prisma/seed-complete.ts
// SEED COMPLETO COM ADVOGADOS, CLIENTES E CASOS REAIS
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with REAL data...");

  // 1. Áreas de atuação
  const practiceAreas = [
    { name: "Imigração", nameEn: "Immigration", slug: "imigracao", icon: "Plane", order: 1 },
    { name: "Acidentes Pessoais", nameEn: "Personal Injury", slug: "acidentes", icon: "AlertTriangle", order: 2 },
    { name: "Direito de Família", nameEn: "Family Law", slug: "familia", icon: "Users", order: 3 },
    { name: "Direito Trabalhista", nameEn: "Employment Law", slug: "trabalho", icon: "Briefcase", order: 4 },
    { name: "Direito Criminal", nameEn: "Criminal Defense", slug: "criminal", icon: "Shield", order: 5 },
    { name: "Direito Empresarial", nameEn: "Business Law", slug: "empresarial", icon: "Building", order: 6 },
    { name: "Direito Imobiliário", nameEn: "Real Estate", slug: "imobiliario", icon: "Home", order: 7 },
    { name: "Planejamento Patrimonial", nameEn: "Estate Planning", slug: "patrimonio", icon: "FileText", order: 8 },
  ];

  console.log("📋 Creating practice areas...");
  const createdAreas: any[] = [];
  for (const area of practiceAreas) {
    const created = await prisma.practiceArea.upsert({
      where: { slug: area.slug },
      update: area,
      create: area,
    });
    createdAreas.push(created);
  }
  console.log(`✅ Created ${practiceAreas.length} practice areas`);

  // 2. Criar ADVOGADOS REAIS
  console.log("👨‍⚖️ Creating lawyers...");
  
  const lawyers = [
    {
      name: "Dr. João Silva",
      email: "joao.silva@meuadvogado.us",
      city: "Miami",
      state: "FL",
      slug: "joao-silva-miami",
      headline: "Especialista em Imigração e Vistos",
      bio: "Mais de 15 anos de experiência ajudando brasileiros a obterem vistos, green cards e cidadania americana. Formado pela USP e licenciado na Florida.",
      barNumber: "FL12345",
      barState: "FL",
      oabBrazil: "OAB/SP 123456",
      yearsExperience: 15,
      plan: "PREMIUM",
      verified: true,
      featured: true,
      practiceAreaSlugs: ["imigracao", "familia"],
    },
    {
      name: "Dra. Maria Santos",
      email: "maria.santos@meuadvogado.us",
      city: "New York",
      state: "NY",
      slug: "maria-santos-ny",
      headline: "Advogada de Acidentes e Lesões Pessoais",
      bio: "Especializada em casos de acidentes de carro, trabalho e negligência médica. Recuperou mais de $10M para clientes brasileiros.",
      barNumber: "NY67890",
      barState: "NY",
      oabBrazil: "OAB/RJ 234567",
      yearsExperience: 12,
      plan: "FEATURED",
      verified: true,
      featured: true,
      practiceAreaSlugs: ["acidentes", "trabalho"],
    },
    {
      name: "Dr. Carlos Oliveira",
      email: "carlos.oliveira@meuadvogado.us",
      city: "Boston",
      state: "MA",
      slug: "carlos-oliveira-boston",
      headline: "Direito de Família e Divórcio",
      bio: "Ajudo famílias brasileiras em processos de divórcio, custódia e pensão alimentícia. Atendimento humanizado e em português.",
      barNumber: "MA11111",
      barState: "MA",
      oabBrazil: "OAB/MG 345678",
      yearsExperience: 10,
      plan: "PREMIUM",
      verified: true,
      featured: false,
      practiceAreaSlugs: ["familia"],
    },
    {
      name: "Dra. Ana Costa",
      email: "ana.costa@meuadvogado.us",
      city: "Los Angeles",
      state: "CA",
      slug: "ana-costa-la",
      headline: "Direito Empresarial e Startups",
      bio: "Auxilio empreendedores brasileiros a abrirem empresas nos EUA, contratos, propriedade intelectual e investimentos.",
      barNumber: "CA22222",
      barState: "CA",
      oabBrazil: "OAB/SP 456789",
      yearsExperience: 8,
      plan: "PREMIUM",
      verified: true,
      featured: true,
      practiceAreaSlugs: ["empresarial"],
    },
    {
      name: "Dr. Pedro Almeida",
      email: "pedro.almeida@meuadvogado.us",
      city: "Miami",
      state: "FL",
      slug: "pedro-almeida-miami",
      headline: "Defesa Criminal e DUI",
      bio: "Defendo brasileiros em casos criminais, DUI, e problemas com imigração relacionados a crimes. Experiência em tribunais federais.",
      barNumber: "FL33333",
      barState: "FL",
      oabBrazil: "OAB/RS 567890",
      yearsExperience: 14,
      plan: "PREMIUM",
      verified: true,
      featured: false,
      practiceAreaSlugs: ["criminal"],
    },
    {
      name: "Dra. Juliana Ferreira",
      email: "juliana.ferreira@meuadvogado.us",
      city: "Orlando",
      state: "FL",
      slug: "juliana-ferreira-orlando",
      headline: "Imigração e Asilo Político",
      bio: "Especialista em casos complexos de imigração, asilo político e deportação. Fluente em português, inglês e espanhol.",
      barNumber: "FL44444",
      barState: "FL",
      oabBrazil: "OAB/BA 678901",
      yearsExperience: 9,
      plan: "PREMIUM",
      verified: true,
      featured: false,
      practiceAreaSlugs: ["imigracao"],
    },
  ];

  const hashedPassword = await bcrypt.hash("senha123", 10);

  for (const lawyerData of lawyers) {
    // Criar usuário
    const user = await prisma.user.upsert({
      where: { email: lawyerData.email },
      update: {},
      create: {
        email: lawyerData.email,
        password: hashedPassword,
        name: lawyerData.name,
        role: "LAWYER",
        emailVerified: new Date(),
        consentGiven: true,
        consentDate: new Date(),
      },
    });

    // Criar advogado
    const lawyer = await prisma.lawyer.upsert({
      where: { slug: lawyerData.slug },
      update: {},
      create: {
        userId: user.id,
        slug: lawyerData.slug,
        headline: lawyerData.headline,
        bio: lawyerData.bio,
        city: lawyerData.city,
        state: lawyerData.state,
        barNumber: lawyerData.barNumber,
        barState: lawyerData.barState,
        oabBrazil: lawyerData.oabBrazil,
        yearsExperience: lawyerData.yearsExperience,
        languages: ["pt", "en"],
        plan: lawyerData.plan as any,
        verified: lawyerData.verified,
        featured: lawyerData.featured,
        active: true,
        publicPhone: "(555) 123-4567",
        publicEmail: lawyerData.email,
      },
    });

    // Associar áreas de prática
    for (const areaSlug of lawyerData.practiceAreaSlugs) {
      const area = createdAreas.find((a) => a.slug === areaSlug);
      if (area) {
        await prisma.lawyerPracticeArea.upsert({
          where: {
            lawyerId_practiceAreaId: {
              lawyerId: lawyer.id,
              practiceAreaId: area.id,
            },
          },
          update: {},
          create: {
            lawyerId: lawyer.id,
            practiceAreaId: area.id,
          },
        });
      }
    }

    // Criar verificação
    await prisma.lawyerVerification.upsert({
      where: { lawyerId: lawyer.id },
      update: {},
      create: {
        lawyerId: lawyer.id,
        barNumber: lawyerData.barNumber,
        barState: lawyerData.barState,
        status: "APPROVED",
        verifiedAt: new Date(),
        barNumberChecked: true,
        licenseActive: true,
      },
    });

    console.log(`✅ Created lawyer: ${lawyerData.name}`);
  }

  // 3. Criar CLIENTES REAIS
  console.log("👥 Creating clients...");
  
  const clients = [
    { name: "Roberto Mendes", email: "roberto.mendes@email.com", city: "Miami", state: "FL" },
    { name: "Fernanda Lima", email: "fernanda.lima@email.com", city: "New York", state: "NY" },
    { name: "Lucas Martins", email: "lucas.martins@email.com", city: "Boston", state: "MA" },
    { name: "Camila Rocha", email: "camila.rocha@email.com", city: "Los Angeles", state: "CA" },
    { name: "Bruno Carvalho", email: "bruno.carvalho@email.com", city: "Orlando", state: "FL" },
  ];

  for (const clientData of clients) {
    const user = await prisma.user.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        email: clientData.email,
        password: hashedPassword,
        name: clientData.name,
        role: "CLIENT",
        emailVerified: new Date(),
        consentGiven: true,
        consentDate: new Date(),
      },
    });

    await prisma.client.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        city: clientData.city,
        state: clientData.state,
        preferredLanguage: "pt",
      },
    });

    console.log(`✅ Created client: ${clientData.name}`);
  }

  // 4. Criar CASOS REAIS
  console.log("📋 Creating cases...");
  
  const allClients = await prisma.client.findMany();
  const allLawyers = await prisma.lawyer.findMany();
  const imigracaoArea = createdAreas.find((a) => a.slug === "imigracao");
  const acidentesArea = createdAreas.find((a) => a.slug === "acidentes");
  const familiaArea = createdAreas.find((a) => a.slug === "familia");

  if (allClients.length > 0 && imigracaoArea) {
    await prisma.case.create({
      data: {
        clientId: allClients[0].id,
        contactName: "Roberto Mendes",
        contactEmail: "roberto.mendes@email.com",
        contactPhone: "(555) 111-2222",
        contactCity: "Miami",
        contactState: "FL",
        practiceAreaId: imigracaoArea.id,
        title: "Pedido de Green Card por Casamento",
        description: "Sou casado com cidadã americana há 2 anos e gostaria de iniciar o processo de green card. Tenho todos os documentos necessários.",
        status: "NEW",
      },
    });

    await prisma.case.create({
      data: {
        clientId: allClients[1].id,
        contactName: "Fernanda Lima",
        contactEmail: "fernanda.lima@email.com",
        contactPhone: "(555) 222-3333",
        contactCity: "New York",
        contactState: "NY",
        practiceAreaId: acidentesArea?.id || imigracaoArea.id,
        title: "Acidente de Carro - Lesões Graves",
        description: "Sofri um acidente de carro há 3 meses. O outro motorista estava em alta velocidade. Tenho despesas médicas de $50k.",
        status: "ANALYZING",
        matchedLawyerId: allLawyers[1]?.id,
        matchedAt: new Date(),
      },
    });

    await prisma.case.create({
      data: {
        clientId: allClients[2].id,
        contactName: "Lucas Martins",
        contactEmail: "lucas.martins@email.com",
        contactPhone: "(555) 333-4444",
        contactCity: "Boston",
        contactState: "MA",
        practiceAreaId: familiaArea?.id || imigracaoArea.id,
        title: "Processo de Divórcio",
        description: "Preciso iniciar processo de divórcio. Temos 2 filhos menores e bens a dividir. Gostaria de um acordo amigável.",
        status: "MATCHED",
        matchedLawyerId: allLawyers[2]?.id,
        matchedAt: new Date(),
      },
    });

    console.log("✅ Created 3 cases");
  }

  // 5. Criar REVIEWS
  console.log("⭐ Creating reviews...");
  
  if (allClients.length > 0 && allLawyers.length > 0) {
    await prisma.review.create({
      data: {
        lawyerId: allLawyers[0].id,
        clientId: allClients[0].id,
        rating: 5,
        comment: "Excelente profissional! Me ajudou muito com meu processo de green card. Muito atencioso e sempre respondeu minhas dúvidas rapidamente.",
        verified: true,
      },
    });

    await prisma.review.create({
      data: {
        lawyerId: allLawyers[1].id,
        clientId: allClients[1].id,
        rating: 5,
        comment: "Advogada incrível! Conseguiu uma indenização muito boa para mim. Recomendo 100%!",
        verified: true,
      },
    });

    await prisma.review.create({
      data: {
        lawyerId: allLawyers[2].id,
        clientId: allClients[2].id,
        rating: 4,
        comment: "Muito profissional e atencioso. Me ajudou em um momento difícil. Recomendo!",
        verified: true,
      },
    });

    console.log("✅ Created 3 reviews");
  }

  console.log("\n🎉 SEED COMPLETO! Dados criados:");
  console.log(`   📋 ${practiceAreas.length} áreas de prática`);
  console.log(`   👨‍⚖️ ${lawyers.length} advogados`);
  console.log(`   👥 ${clients.length} clientes`);
  console.log(`   📋 3 casos`);
  console.log(`   ⭐ 3 reviews`);
  console.log("\n✅ Agora você verá dados REAIS na homepage!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
