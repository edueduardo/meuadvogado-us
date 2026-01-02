import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar áreas de atuação
  const areas = await Promise.all([
    prisma.practiceArea.create({
      data: {
        name: 'Imigração',
        slug: 'imigracao',
        description: 'Vistos, Green Card, cidadania, asilo',
      },
    }),
    prisma.practiceArea.create({
      data: {
        name: 'Direito de Família',
        slug: 'direito-de-familia',
        description: 'Divórcio, guarda, pensão alimentícia',
      },
    }),
    prisma.practiceArea.create({
      data: {
        name: 'Direito Criminal',
        slug: 'direito-criminal',
        description: 'Defesa criminal, DUI, crimes federais',
      },
    }),
    prisma.practiceArea.create({
      data: {
        name: 'Acidentes',
        slug: 'acidentes',
        description: 'Acidentes de trabalho, trânsito, lesões pessoais',
      },
    }),
    prisma.practiceArea.create({
      data: {
        name: 'Negócios',
        slug: 'negocios',
        description: 'Empresas, contratos, incorporação',
      },
    }),
    prisma.practiceArea.create({
      data: {
        name: 'Trabalhista',
        slug: 'trabalhista',
        description: 'Direitos trabalhistas, discriminação, wrongful termination',
      },
    }),
    prisma.practiceArea.create({
      data: {
        name: 'Imobiliário',
        slug: 'imobiliario',
        description: 'Compra, venda, aluguel de imóveis',
      },
    }),
    prisma.practiceArea.create({
      data: {
        name: 'Outros',
        slug: 'outros',
        description: 'Outras áreas do direito',
      },
    }),
  ]);

  // Criar cidades com brasileiros
  const cities = await Promise.all([
    // Florida
    prisma.city.create({
      data: {
        name: 'Miami',
        state: 'FL',
        slug: 'miami-fl',
        brazilianPopulation: 150000,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Orlando',
        state: 'FL',
        slug: 'orlando-fl',
        brazilianPopulation: 50000,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Pompano Beach',
        state: 'FL',
        slug: 'pompano-beach-fl',
        brazilianPopulation: 30000,
      },
    }),
    // Massachusetts
    prisma.city.create({
      data: {
        name: 'Boston',
        state: 'MA',
        slug: 'boston-ma',
        brazilianPopulation: 35000,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Framingham',
        state: 'MA',
        slug: 'framingham-ma',
        brazilianPopulation: 20000,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Marlborough',
        state: 'MA',
        slug: 'marlborough-ma',
        brazilianPopulation: 15000,
      },
    }),
    // New Jersey
    prisma.city.create({
      data: {
        name: 'Newark',
        state: 'NJ',
        slug: 'newark-nj',
        brazilianPopulation: 40000,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Elizabeth',
        state: 'NJ',
        slug: 'elizabeth-nj',
        brazilianPopulation: 25000,
      },
    }),
    // California
    prisma.city.create({
      data: {
        name: 'Los Angeles',
        state: 'CA',
        slug: 'los-angeles-ca',
        brazilianPopulation: 30000,
      },
    }),
    prisma.city.create({
      data: {
        name: 'San Diego',
        state: 'CA',
        slug: 'san-diego-ca',
        brazilianPopulation: 20000,
      },
    }),
  ]);

  console.log('Seed criado com sucesso!');
  console.log(`Áreas de atuação: ${areas.length}`);
  console.log(`Cidades: ${cities.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
