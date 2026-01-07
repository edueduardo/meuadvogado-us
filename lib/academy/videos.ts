// lib/academy/videos.ts
// Conteúdo educativo para Advogados (Academy)

export interface AcademyVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'START' | 'GROWTH' | 'SALES' | 'PLATFORM';
  thumbnailColor: string;
  script: string; // Roteiro para o advogado/produção gravar
}

export const ACADEMY_VIDEOS: AcademyVideo[] = [
  {
    id: 'welcome-start',
    title: 'Comece Aqui: O Segredo do Perfil Campeão',
    description: 'Como configurar seu perfil para atrair 3x mais clientes qualificados.',
    duration: '3:45',
    category: 'START',
    thumbnailColor: 'from-blue-600 to-blue-800',
    script: `
[CENA 1: Apresentador no escritório ou Captura de Tela do Perfil]
"Olá, Dr(a)! Bem-vindo ao Meu Advogado. Se você quer receber leads qualificados e não apenas curiosos, o segredo está no seu perfil."

[CENA 2: Mostrando a tela de edição de perfil]
"O algoritmo do Claude AI prioriza perfis completos. Não pule a biografia! Escreva sobre como você resolve problemas, não apenas onde se formou."

[CENA 3: Destaque para a foto e áreas de atuação]
"Use uma foto profissional. E nas áreas de atuação, seja específico. Se você faz Imigração, marque os sub-nichos como 'Vistos de Trabalho' ou 'Green Card'. Isso ajuda o matching a ser preciso."

[CENA 4: Encerramento]
"Invista 10 minutos agora para economizar horas de triagem depois. Clique em 'Editar Perfil' e vamos começar!"
    `
  },
  {
    id: 'convert-leads',
    title: 'A Arte de Converter Leads em Clientes',
    description: 'Técnicas de resposta rápida que aumentam a conversão em 50%.',
    duration: '5:20',
    category: 'SALES',
    thumbnailColor: 'from-green-600 to-green-800',
    script: `
[CENA 1: Gráfico de tempo de resposta x conversão]
"Você sabia que responder um lead nos primeiros 5 minutos aumenta a chance de conversão em 400%? Pois é."

[CENA 2: Mostrando o Chat da plataforma]
"Quando receber um lead, não mande apenas 'Olá, estou à disposição'. O cliente quer ser ouvido. Use nossa IA para ler o resumo do caso antes de responder."

[CENA 3: Exemplo de mensagem ideal]
"Diga: 'Olá, li sobre seu caso de visto negado. Já resolvi situações similares. Podemos agendar uma chamada rápida de 10 min?'"

[CENA 4: Call to Action]
"A velocidade vence. Ative as notificações do WhatsApp no seu painel agora mesmo."
    `
  },
  {
    id: 'matching-system',
    title: 'Entendendo o Matching com IA',
    description: 'Como o Claude AI escolhe você para os casos certos.',
    duration: '4:10',
    category: 'PLATFORM',
    thumbnailColor: 'from-purple-600 to-purple-800',
    script: `
[CENA 1: Animação de cérebro digital conectando pontos]
"Nosso sistema não é uma lista telefônica. É um matchmaker inteligente."

[CENA 2: Explicando os critérios]
"Analisamos 3 pilares: Especialidade (se o caso bate com sua expertise), Localização (se o cliente precisa de alguém local) e Avaliação."

[CENA 3: Dica Pro]
"Advogados com o selo 'Verificado' e plano Professional ganham um boost de 20% no ranking de relevância. Mantenha suas credenciais em dia."
    `
  },
  {
    id: 'premium-features',
    title: 'Features do Plano Enterprise',
    description: 'Desbloqueie API, White-label e Account Manager.',
    duration: '2:30',
    category: 'GROWTH',
    thumbnailColor: 'from-amber-500 to-orange-700',
    script: `
[CENA 1: Imagens de escritórios grandes/sofisticados]
"Para escritórios em expansão, o plano Enterprise é o motor de crescimento."

[CENA 2: Mostrando Integrações]
"Conecte o Meu Advogado direto no seu CRM (Salesforce, HubSpot) via API. Receba os leads onde sua equipe já trabalha."

[CENA 3: Account Manager]
"E o melhor: você terá um estrategista dedicado para otimizar suas campanhas dentro da plataforma."
    `
  }
];

export const CATEGORIES = {
  START: 'Primeiros Passos',
  SALES: 'Vendas e Conversão',
  PLATFORM: 'Plataforma e IA',
  GROWTH: 'Crescimento',
};
