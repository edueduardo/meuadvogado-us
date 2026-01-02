// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Áreas de atuação
  const practiceAreas = [
    { name: "Imigração", nameEn: "Immigration", slug: "imigracao", icon: "Plane", order: 1 },
    { name: "Acidentes Pessoais", nameEn: "Personal Injury", slug: "acidentes", icon: "AlertTriangle", order: 2 },
    { name: "Direito de Família", nameEn: "Family Law", slug: "familia", icon: "Users", order: 3 },
    { name: "Direito Trabalhista", nameEn: "Employment Law", slug: "trabalho", icon: "Briefcase", order: 4 },
    { name: "Direito Criminal", nameEn: "Criminal Defense", slug: "criminal", icon: "Shield", order: 5 },
    { name: "Direito Empresarial", nameEn: "Business Law", slug: "empresarial", icon: "Building", order: 6 },
    { name: "Direito Imobiliário", nameEn: "Real Estate", slug: "imobiliario", icon: "Home", order: 7 },
    { name: "Planejamento Patrimonial", nameEn: "Estate Planning", slug: "patrimonio", icon: "FileText", order: 8 },
    { name: "Falência", nameEn: "Bankruptcy", slug: "falencia", icon: "DollarSign", order: 9 },
    { name: "Outros", nameEn: "Other", slug: "outros", icon: "MoreHorizontal", order: 10 },
  ];

  console.log("📋 Creating practice areas...");
  for (const area of practiceAreas) {
    await prisma.practiceArea.upsert({
      where: { slug: area.slug },
      update: area,
      create: area,
    });
  }
  console.log(`✅ Created ${practiceAreas.length} practice areas`);

  // Cidades com maior população brasileira
  const cities = [
    { name: "Miami", state: "FL", stateFullName: "Florida", slug: "miami-fl", brazilianPopulation: 300000, featured: true },
    { name: "Orlando", state: "FL", stateFullName: "Florida", slug: "orlando-fl", brazilianPopulation: 100000, featured: true },
    { name: "New York", state: "NY", stateFullName: "New York", slug: "new-york-ny", brazilianPopulation: 250000, featured: true },
    { name: "Newark", state: "NJ", stateFullName: "New Jersey", slug: "newark-nj", brazilianPopulation: 150000, featured: true },
    { name: "Boston", state: "MA", stateFullName: "Massachusetts", slug: "boston-ma", brazilianPopulation: 200000, featured: true },
    { name: "Los Angeles", state: "CA", stateFullName: "California", slug: "los-angeles-ca", brazilianPopulation: 100000, featured: true },
    { name: "Houston", state: "TX", stateFullName: "Texas", slug: "houston-tx", brazilianPopulation: 80000, featured: false },
    { name: "Atlanta", state: "GA", stateFullName: "Georgia", slug: "atlanta-ga", brazilianPopulation: 50000, featured: false },
    { name: "Fort Lauderdale", state: "FL", stateFullName: "Florida", slug: "fort-lauderdale-fl", brazilianPopulation: 60000, featured: false },
    { name: "Pompano Beach", state: "FL", stateFullName: "Florida", slug: "pompano-beach-fl", brazilianPopulation: 40000, featured: false },
    { name: "Deerfield Beach", state: "FL", stateFullName: "Florida", slug: "deerfield-beach-fl", brazilianPopulation: 30000, featured: false },
    { name: "Framingham", state: "MA", stateFullName: "Massachusetts", slug: "framingham-ma", brazilianPopulation: 25000, featured: false },
    { name: "San Francisco", state: "CA", stateFullName: "California", slug: "san-francisco-ca", brazilianPopulation: 30000, featured: false },
    { name: "Washington", state: "DC", stateFullName: "District of Columbia", slug: "washington-dc", brazilianPopulation: 25000, featured: false },
    { name: "Philadelphia", state: "PA", stateFullName: "Pennsylvania", slug: "philadelphia-pa", brazilianPopulation: 20000, featured: false },
  ];

  console.log("🏙️ Creating cities...");
  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city,
    });
  }
  console.log(`✅ Created ${cities.length} cities`);

  // Settings padrão
  console.log("⚙️ Creating settings...");
  await prisma.settings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      pricePremium: 14900,
      priceFeatured: 29900,
      pricePerLead: 2000,
      priceAnalysis: 4900,
    },
  });
  console.log("✅ Created settings");

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
