// lib/academy/client-videos.ts
// Conteúdo educativo para CLIENTES (Jornada da Confiança)

export interface ClientVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'SEGURANCA' | 'PREPARACAO' | 'DIREITOS';
  thumbnailColor: string;
  script: string;
}

export const CLIENT_VIDEOS: ClientVideo[] = [
  {
    id: 'voce-nao-esta-sozinho',
    title: 'Não Entre em Pânico: Você Tem Direitos',
    description: 'Entenda por que o sistema jurídico americano protege você, independente do seu status.',
    duration: '2:45',
    category: 'DIREITOS',
    thumbnailColor: 'from-blue-500 to-cyan-600',
    script: `
[CENA 1: Apresentador empático, fundo neutro e calmo]
"Olá! Se você está aqui, provavelmente está passando por um momento delicado. Respira. A primeira coisa que você precisa saber é: você não está sozinho."

[CENA 2: Imagens ilustrativas de justiça/bandeira EUA, mas suaves]
"Nos Estados Unidos, a Constituição garante direitos fundamentais a todas as pessoas que estão em solo americano. Não importa se você chegou ontem ou há 10 anos."

[CENA 3: Close no apresentador]
"O medo paralisa. A informação liberta. Aqui no 'Meu Advogado', nós conectamos você a profissionais que juraram defender esses direitos. O primeiro passo para resolver seu problema é sair da sombra e buscar orientação profissional."
    `
  },
  {
    id: 'segredo-advogado',
    title: 'O Sigilo é Sagrado (Attorney-Client Privilege)',
    description: 'Por que você pode contar TUDO para seu advogado sem medo da imigração.',
    duration: '3:10',
    category: 'SEGURANCA',
    thumbnailColor: 'from-emerald-500 to-teal-700',
    script: `
[CENA 1: Ícone de cadeado ou silêncio]
"Muitos brasileiros têm medo de procurar um advogado e acabar se expondo. Mas existe uma lei poderosa aqui chamada 'Attorney-Client Privilege'."

[CENA 2: Gráfico explicativo]
"Isso significa que TUDO o que você fala para o seu advogado é confidencial. É proibido por lei ele revelar seus segredos para a polícia ou imigração."

[CENA 3: Exemplo prático]
"Para o advogado te defender, ele precisa saber a verdade. Não minta, não omita. Ele é seu escudo, não seu juiz. Fale com segurança."
    `
  },
  {
    id: 'verificacao-bar',
    title: 'Cuidado com Golpes: O Que é o BAR?',
    description: 'Como garantimos que você está falando com um advogado de verdade.',
    duration: '4:00',
    category: 'SEGURANCA',
    thumbnailColor: 'from-amber-500 to-orange-600',
    script: `
[CENA 1: Alerta visual suave]
"Cuidado com 'notários' ou consultores que prometem milagres. Nos EUA, apenas advogados licenciados pelo BAR podem te representar na corte."

[CENA 2: Mostrando o perfil de um advogado na plataforma]
"Vê este selo 'Verificado'? Isso significa que nossa equipe checou o número da licença desse advogado no banco de dados oficial do governo americano."

[CENA 3: Comparativo]
"Um erro no seu processo pode custar seu futuro. Não arrisque. Use nossa plataforma para garantir que está falando com um profissional licenciado e fiscalizado."
    `
  },
  {
    id: 'preparar-consulta',
    title: 'Como Se Preparar para a Consulta',
    description: 'Economize tempo e dinheiro organizando seu caso antes de falar.',
    duration: '3:30',
    category: 'PREPARACAO',
    thumbnailColor: 'from-indigo-500 to-purple-600',
    script: `
[CENA 1: Mesa com documentos organizados]
"Tempo de advogado custa caro. Para aproveitar ao máximo sua consulta, preparação é tudo."

[CENA 2: Checklist na tela]
"1. Faça uma linha do tempo dos eventos (datas são cruciais).
2. Junte todos os documentos: passaporte, vistos, cartas, multas.
3. Anote suas dúvidas antes da chamada."

[CENA 3: Conclusão]
"Quanto mais organizado você estiver, mais rápido o advogado entende seu caso e traça a estratégia. Ajude-o a te ajudar!"
    `
  }
];

export const CLIENT_CATEGORIES = {
  DIREITOS: 'Seus Direitos',
  SEGURANCA: 'Sua Segurança',
  PREPARACAO: 'Passo a Passo',
};
