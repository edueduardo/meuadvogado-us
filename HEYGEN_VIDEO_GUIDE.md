# 📹 HeyGen Video Component - Guia Completo de Páginas e Textos

## 🎬 ESTRUTURA GERAL DO COMPONENTE

```typescript
<HeyGenVideo
  videoId="seu_video_id"           // ID do vídeo no HeyGen
  title="Título do vídeo"
  autoplay={true/false}            // Autoplay ao carregar?
  muted={true/false}               // Som ligado/desligado?
  loop={true/false}                // Repetir video?
  className="rounded-2xl shadow-lg" // Classes Tailwind
  width="100%"                     // Largura
  height={400}                     // Altura em pixels
  abTestVariant="treatment"        // Variante A/B: 'control', 'treatment', 'treatment2'
/>
```

---

## 📄 PÁGINA 1: HOMEPAGE (/)

### Video #1: HERO TESTIMONIAL
```
LOCALIZAÇÃO: Logo após a headline principal
POSIÇÃO NO CÓDIGO: app/page.tsx linha ~62

EXEMPLO DE USO:
──────────────────────────────────────────────────────────────
<div className="w-full max-w-3xl mb-12">
  <HeyGenVideo
    videoId="homepage_hero_testimonial"
    title="Cliente Real - Resultado Real"
    autoplay={true}
    muted={true}
    loop={true}
    className="rounded-2xl shadow-2xl shadow-blue-500/30"
    width="100%"
    height={400}
    abTestVariant="homepage_hero_video"
  />
</div>
──────────────────────────────────────────────────────────────

DIMENSÕES:
  Desktop:  100% width, max-width 800px, height 400px
  Tablet:   90% width, height 350px
  Mobile:   100% width, height 250px

SCRIPT DO VÍDEO:
──────────────────────────────────────────────────────────────
"Olá, meu nome é Marina Silva e minha história poderia ser sua.

Há um ano, enfrentava deportação após uma decisão judicial inadequada.
Estava desesperada, sem saber para onde correr.

Encontrei o MeuAdvogado em 24 horas.
Um advogado experiente, brasileiro, com licença nos EUA, começou meu caso.

Resultado? 8 meses depois, meu Green Card foi aprovado.

Não estou sozinha nessa jornada agora.
E você também não precisa estar.

Se está enfrentando um problema imigratório, trabalhista ou pessoal nos EUA,
o MeuAdvogado conecta você com o advogado certo em 24 horas.

Brasileiros ajudando brasileiros.
Licenciados nos EUA.

Comece agora. É grátis."
──────────────────────────────────────────────────────────────

DURAÇÃO: 30 segundos
AVATAR: Wayne_20220816 (padrão)
VOICE: pt-BR (Português Brasil)
AUTOPLAY: Sim, muted, looping
A/B TEST: 50/50 (video vs sem video)
```

---

### Video #2: EXPLAINER "COMO FUNCIONA"
```
LOCALIZAÇÃO: Centro da seção "Como Funciona?"
POSIÇÃO NO CÓDIGO: app/page.tsx linha ~197

EXEMPLO DE USO:
──────────────────────────────────────────────────────────────
<div className="mb-8">
  <HeyGenVideo
    videoId="homepage_explainer_process"
    title="Como Funciona em 30 segundos"
    autoplay={false}
    muted={false}
    loop={false}
    className="rounded-2xl shadow-xl shadow-blue-500/20"
    width="100%"
    height={400}
    abTestVariant="homepage_explainer_video"
  />
</div>
──────────────────────────────────────────────────────────────

DIMENSÕES:
  Desktop:  600px width, height 400px, centered
  Tablet:   90% width, height 300px
  Mobile:   100% width, height 200px

SCRIPT DO VÍDEO:
──────────────────────────────────────────────────────────────
"Como funciona? Super simples. Apenas 3 passos.

PASSO 1: Você conta seu caso.
Responde algumas perguntas sobre seu problema legal.
Demora 5 minutos.

PASSO 2: Nossa IA encontra o advogado.
Nosso algoritmo bate com seu caso com o melhor advogado disponível.
Brasileiros, experientes, com licença nos EUA.

PASSO 3: Você conversa via chat.
Mensagens, WhatsApp, ou vídeo chamada.
Sem surpresas, sem troca de advogados.

Tudo transparente. Tudo rápido.

Começar agora é grátis.
Você só paga se contratar o advogado.

Meuadvogado.us - Advogados para brasileiros, em 24 horas."
──────────────────────────────────────────────────────────────

DURAÇÃO: 30 segundos
AVATAR: Wayne_20220816
VOICE: pt-BR
AUTOPLAY: Não (user clica para play)
A/B TEST: 50/50 (video vs sem video)
```

---

## 📄 PÁGINA 2: CLIENTE (/cliente)

### Video #3-6: TESTIMONIALS (ROTATING)
```
LOCALIZAÇÃO: Seção "Histórias Reais de Sucesso"
POSIÇÃO NO CÓDIGO: app/cliente/page.tsx linha ~484

EXEMPLO DE USO:
──────────────────────────────────────────────────────────────
{showVideoTestimonials ? (
  <div className="bg-white rounded-2xl shadow-xl p-8">
    <div className="mb-6">
      <HeyGenVideo
        videoId={videoTestimonials[currentTestimonial].id}
        title={`Depoimento - ${testimonials[currentTestimonial].name}`}
        autoplay={false}
        muted={false}
        loop={false}
        className="rounded-xl"
        width="100%"
        height={400}
        abTestVariant="cliente_testimonial_video"
      />
    </div>
    {/* Info abaixo do vídeo */}
  </div>
) : (
  /* Fallback para texto */
)}
──────────────────────────────────────────────────────────────

DIMENSÕES:
  Desktop:  600px width, height 500px
  Tablet:   95% width, height 400px
  Mobile:   100% width, height 300px

VÍDEOS NECESSÁRIOS (4 diferentes):
────────────────────────────────────────────────────────────

1️⃣ MARIA SANTOS - Imigração (Green Card)
   SCRIPT:
   "Oi, meu nome é Maria Santos, sou de São Paulo.

   Estava desesperada com meu caso de imigração.
   Tinha sido negado uma vez e achava que não tinha chance.

   Encontrei o MeuAdvogado em 24 horas.
   Eles me conectaram com um advogado especialista em Green Card.

   Em 8 meses, consegui a aprovação!

   Se você está enfrentando imigração, procure o MeuAdvogado.
   Mudou minha vida!"

   DURAÇÃO: 30-45 segundos
   VARIANTE: treatment

────────────────────────────────────────────────────────────

2️⃣ JOÃO SILVA - Acidente de Trabalho
   SCRIPT:
   "Meu nome é João Silva, de Newark, New Jersey.

   Sofri um acidente grave no trabalho.
   Não sabia meus direitos, não sabia o que fazer.

   Procurei o MeuAdvogado e em 24 horas tinha um advogado.

   Ele negociou tudo por mim.
   Consegui $45 mil de indenização!

   Sem ele, tinha perdido tudo.
   Recomendo demais o MeuAdvogado."

   DURAÇÃO: 30-45 segundos
   VARIANTE: treatment

────────────────────────────────────────────────────────────

3️⃣ ANA OLIVEIRA - Divórcio
   SCRIPT:
   "Oi, sou Ana Oliveira de Boston.

   Processo de divórcio nos EUA é super complicado.
   Especialmente se você não entende bem inglês.

   Encontrei um advogado brasileiro no MeuAdvogado.
   Ele entendia minha cultura, minha situação.

   Em 3 meses resolveu tudo.
   Consegui a custódia dos meus filhos.

   Foi a melhor decisão que fiz.
   Muito obrigada MeuAdvogado!"

   DURAÇÃO: 30-45 segundos
   VARIANTE: treatment

────────────────────────────────────────────────────────────

4️⃣ CARLOS MENDES - Criminal/DUI
   SCRIPT:
   "Fui parado pela polícia em Orlando.
   Achei que ia ser deportado.
   Estava assustado demais.

   Liguei pro MeuAdvogado na hora.
   Eles me conectaram com um advogado criminal.

   Ele me orientou pelo WhatsApp na hora.
   Disse exatamente o que fazer.

   No final, resolveu tudo.
   Meu caso foi arquivado.

   Literal, salvaram minha vida.
   Obrigado MeuAdvogado!"

   DURAÇÃO: 30-45 segundos
   VARIANTE: treatment

────────────────────────────────────────────────────────────

SISTEMA DE ROTAÇÃO:
  • Cada vídeo dura 30-45 segundos
  • Muda automaticamente a cada 5 segundos (ou user clica)
  • Dots de navegação embaixo
  • Continua rotacionando enquanto user na página
```

---

## 📄 PÁGINA 3: ADVOGADO (/advogado)

### Video #7: DAY IN LIFE
```
LOCALIZAÇÃO: Topo da seção "Como Funciona para Advogados"
POSIÇÃO NO CÓDIGO: app/advogado/page.tsx linha ~224

EXEMPLO DE USO:
──────────────────────────────────────────────────────────────
<div className="max-w-4xl mx-auto mb-12">
  <HeyGenVideo
    videoId="advogado_day_in_life"
    title="Um Dia na Vida de um Advogado"
    autoplay={true}
    muted={true}
    loop={true}
    className="rounded-2xl shadow-2xl shadow-green-500/30"
    width="100%"
    height={500}
    abTestVariant="advogado_day_in_life_video"
  />
</div>
──────────────────────────────────────────────────────────────

DIMENSÕES:
  Desktop:  100% width, max-width 900px, height 500px
  Tablet:   95% width, height 400px
  Mobile:   100% width, height 280px

SCRIPT DO VÍDEO (3-5 minutos):
────────────────────────────────────────────────────────────

"[INTRO - 15 segundos]
Oi, eu sou Dr. Ricardo Almeida, advogado de imigração em Miami.
E vou mostrar como meu dia fica completamente diferente
desde que comecei usar MeuAdvogado.

[MORNING - 45 segundos]
7:45 da manhã. Acordo, tomo café, e entro na plataforma MeuAdvogado.

Tenho 4 novos leads que chegaram durante a noite.
Já pré-qualificados pela IA da plataforma.

Um é caso de Green Card (minha especialidade).
Outro é deportação urgente.
Um terceiro é reunificação familiar.

Cada lead tem perfil completo, situação financeira, urgência.
A IA já sabia exatamente qual era meu match.

Tudo que eu precisava fazer era revisar.

[FIRST CLIENT - 1 min]
8:15. Abro o chat do primeiro cliente - João, de São Paulo.

Ele já tinha conversado comigo via mensagem enquanto dormia.
Explicou que foi acusado injustamente de fraude de visto.

Nós nos conectamos pelo WhatsApp da plataforma.
Sem número pessoal.
Sem emails confusos.
Sem perder context.

Em 15 minutos, eu já tinha:
- Documentação completa dele
- Histórico financeiro
- Carta de emprego
- Tudo organizado pela plataforma

15 minutos. Não 15 dias.

[OFFER & SIGNATURE - 30 segundos]
Enviei meu contrato.
Ele assinou digitalmente.
Pagamento: automático pela plataforma.

Sem burocracia. Sem atraso.

Novo cliente: adquirido.

[MULTIPLE CLIENTS - 1 min]
10 da manhã.

Enquanto isso, estou gerenciando 6 outros casos em andamento.

Cada cliente tem sua thread.
Cada thread tem documentação.
Cada pagamento é rastreável.

Minha assistente está respondendo perguntas básicas com a IA.
Só me chama quando é algo crítico.

1 cliente teve sua entrevista aprovada.
Outro está esperando notícias do USCIS.
Um terceiro precisa de documentação adicional.

Tudo em um lugar. Tudo sincronizado.

[REVENUE & GROWTH - 45 segundos]
Antes do MeuAdvogado:
Gastava $5.000/mês em Google Ads.
Conseguia 2-3 leads por mês.
50% não voltava com mensagens.
Conversão final: 15%.

Agora com MeuAdvogado:
Pago $199/mês.
Recebo 15-20 leads qualificados por mês.
95% responde.
Conversão: 70%.

Meu ROI foi de -100% para +450%.

Literalmente multiplicou meu negócio por 5.

[OUTRO - CALL TO ACTION - 30 segundos]
Antes, eu passava 60% do tempo procurando clientes.
Agora, eu passo 90% do tempo resolvendo casos.

E fazendo dinheiro de verdade.

Se você é advogado e está cansado de gastar em publicidade que não funciona,
MeuAdvogado é para você.

Clientes pré-qualificados.
Tecnologia que funciona.
Suporte que responde.

Crie seu perfil agora em MeuAdvogado.us

Vem comigo. Vem ganhar dinheiro resolvendo casos."

────────────────────────────────────────────────────────────

DURAÇÃO: 3-5 minutos
AVATAR: Wayne_20220816 (ou outro profissional)
VOICE: pt-BR
AUTOPLAY: Sim, muted, looping
A/B TEST: 50/50 (video vs sem video)
```

---

### Video #8-10: LAWYER TESTIMONIALS (3x ROTATING)
```
LOCALIZAÇÃO: Seção "Advogados que Cresceram Conosco"
POSIÇÃO NO CÓDIGO: app/advogado/page.tsx linha ~280

EXEMPLO DE USO:
──────────────────────────────────────────────────────────────
{showVideoTestimonials ? (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
    <HeyGenVideo
      videoId={lawyerTestimonials[currentTestimonial].videoId}
      title={`Depoimento - ${lawyerTestimonials[currentTestimonial].name}`}
      autoplay={false}
      muted={false}
      loop={false}
      className="rounded-xl"
      width="100%"
      height={400}
      abTestVariant="advogado_testimonial_video"
    />
  </div>
)}
──────────────────────────────────────────────────────────────

VÍDEOS NECESSÁRIOS (3 diferentes):
────────────────────────────────────────────────────────────

1️⃣ DR. RICARDO ALMEIDA - Imigração (+$85K)
   SCRIPT:
   "Meu nome é Dr. Ricardo Almeida.
   Sou advogado de imigração em Miami há 15 anos.

   Em 3 meses na plataforma MeuAdvogado, recebi mais de 40 leads qualificados.
   Já fechei 12 casos.

   Ganho $85 mil em honorários.

   O ROI é absolutamente absurdo.

   Antes gastava $5 mil por mês em Google Ads.
   Agora pago $199 na plataforma.

   Os leads são pré-qualificados.
   Os clientes já sabem que falo português.

   Conversão é muito maior.

   Recomendo muito o MeuAdvogado para qualquer advogado sério."

   DURAÇÃO: 30-45 segundos
   VARIANTE: treatment

────────────────────────────────────────────────────────────

2️⃣ DRA. FERNANDA COSTA - Acidentes (1200% ROI)
   SCRIPT:
   "Oi, sou Dra. Fernanda Costa.
   Advogada de acidentes de trabalho e carro em Newark.

   Antes de MeuAdvogado:
   Gastava $3.000 por mês em Google Ads.
   Os resultados eram péssimos.
   Leads frios que nunca respondiam.

   Comecei no MeuAdvogado.
   Pago $199 por mês.
   E recebo leads que REALMENTE fecham.

   Meu ROI foi de negativo para 1.200%.

   Os clientes chegam já qualificados.
   Já sabem que preciso falar com eles.
   Já sabem que falo português.

   A plataforma é excelente.
   Super recomendo!"

   DURAÇÃO: 30-45 segundos
   VARIANTE: treatment

────────────────────────────────────────────────────────────

3️⃣ DR. MARCOS SILVA - Criminal (8 casos/mês)
   SCRIPT:
   "Eu sou Dr. Marcos Silva, advogado criminal em Boston.

   O que eu mais gosto do MeuAdvogado é que os clientes já vêm
   pré-qualificados e sabendo que falo português.

   Não preciso perder tempo explicando.
   A conversão é muito maior.

   Estou recebendo 8 casos novos por mês.

   A plataforma é muito bem feita.
   O suporte responde rápido.
   Os clientes são sérios.

   Se você é advogado criminal e quer crescer,
   MeuAdvogado é o lugar certo."

   DURAÇÃO: 30-45 segundos
   VARIANTE: treatment

────────────────────────────────────────────────────────────

SISTEMA DE ROTAÇÃO:
  • Muda automaticamente a cada 5 segundos
  • Dots de navegação embaixo
  • User pode clicar para navegar
  • Continua rotacionando
```

---

### Video #11: ROI EXPLAINER
```
LOCALIZAÇÃO: Acima do ROI Calculator
POSIÇÃO NO CÓDIGO: app/advogado/page.tsx linha ~416

EXEMPLO DE USO:
──────────────────────────────────────────────────────────────
<div className="mb-8 max-w-2xl mx-auto">
  <HeyGenVideo
    videoId="advogado_roi_explainer"
    title="Como Funciona seu ROI"
    autoplay={false}
    muted={false}
    loop={false}
    className="rounded-xl"
    width="100%"
    height={300}
    abTestVariant="advogado_roi_explainer_video"
  />
</div>
──────────────────────────────────────────────────────────────

DIMENSÕES:
  Desktop:  600px width, height 400px
  Tablet:   80% width, height 300px
  Mobile:   100% width, height 200px

SCRIPT DO VÍDEO (45 segundos):
────────────────────────────────────────────────────────────

"Vamos calcular seu ROI.

Você investe $199 por mês na plataforma MeuAdvogado.

Se você fechar apenas 1 caso de imigração por mês,
esse caso vale em média $3.000 em honorários.

Sua receita: $3.000
Seu custo: $199
Seu lucro: $2.801

Seu ROI: 1.400% ao mês.

Agora imagina se você fechar 2 casos? 3 casos?

Com MeuAdvogado, você recebe leads pré-qualificados.
A conversão é alta.
Você consegue fechar mais casos.

Isso é o verdadeiro ROI.

Comece agora. Crie sua conta grátis no MeuAdvogado.us"

────────────────────────────────────────────────────────────

DURAÇÃO: 45 segundos
AVATAR: Wayne_20220816
VOICE: pt-BR
AUTOPLAY: Não (user clica para play)
A/B TEST: 40/60 (static calculator vs video + calculator)
```

---

## 📊 TABELA RESUMIDA

| # | Página | Video | Local | Duração | Autoplay | A/B Split |
|---|--------|-------|-------|---------|----------|-----------|
| 1 | Homepage | Hero Testimonial | After headline | 30s | Sim | 50/50 |
| 2 | Homepage | Explainer | "Como Funciona" | 30s | Não | 50/50 |
| 3-6 | Cliente | Testimonials (4x) | Success stories | 30-45s | Não | 40/60 |
| 7 | Advogado | Day in Life | Top section | 3-5min | Sim | 50/50 |
| 8-10 | Advogado | Lawyer Testimonials (3x) | Growth section | 30-45s | Não | 40/60 |
| 11 | Advogado | ROI Explainer | Above calculator | 45s | Não | 40/60 |

---

## 🔧 COMO GERAR OS VÍDEOS

1. Copiar cada SCRIPT acima
2. Ir para HeyGen.com
3. Criar novo vídeo com:
   - Script: Cole o texto
   - Avatar: Wayne_20220816 (ou escolha outro)
   - Voz: pt-BR Neural2-C
   - Duração: conforme especificado
4. Depois de renderizado, copiar o **Video ID**
5. Colar o Video ID nos componentes (videoId="...")

---

## 💡 DICAS DE IMPLEMENTAÇÃO

✅ **Responsive Design:**
- Sempre use max-width containers
- Adjust height por breakpoint (Tailwind)
- Mobile: 60-70% da altura desktop

✅ **Performance:**
- Lazy load videos (useEffect com mounted check)
- Fallback images para erro
- Loading state com spinner

✅ **A/B Testing:**
- Use `abTestVariant` para tracking
- Control vs Treatment split conforme tabela
- Mixpanel rastreia automaticamente

✅ **Acessibilidade:**
- Sempre tenha title descritivo
- Subtitle em português
- Closed captions quando possível
