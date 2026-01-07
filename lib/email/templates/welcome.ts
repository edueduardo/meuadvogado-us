// lib/email/templates/welcome.ts
import { baseTemplate } from './base-template';

export const welcomeClientTemplate = (name: string) => baseTemplate(`
  <h1>Bem-vindo ao Meu Advogado, ${name}! 🎉</h1>
  
  <p>Estamos muito felizes em ter você conosco. Agora você tem acesso a mais de 150 advogados brasileiros nos Estados Unidos, prontos para ajudar com seu caso.</p>
  
  <div class="highlight-box">
    <p><strong>Próximo passo:</strong> Conte seu caso e receba contato de advogados qualificados em até 24 horas.</p>
  </div>
  
  <div style="text-align: center;">
    <a href="https://meuadvogado-us.vercel.app/caso" class="button">
      📝 Contar meu Caso
    </a>
  </div>
  
  <div class="divider"></div>
  
  <h2>Como funciona?</h2>
  
  <p><strong>1. Descreva seu problema</strong><br>
  Conte o que está acontecendo. Nossa IA identifica a área jurídica automaticamente.</p>
  
  <p><strong>2. Receba contatos</strong><br>
  Advogados especializados entrarão em contato em até 24 horas.</p>
  
  <p><strong>3. Consulta gratuita</strong><br>
  Converse pelo WhatsApp, chat ou vídeo antes de decidir.</p>
  
  <div class="divider"></div>
  
  <p style="text-align: center; color: #6b7280;">
    Precisa de ajuda? Responda este email ou acesse nosso <a href="https://meuadvogado-us.vercel.app/suporte">suporte</a>.
  </p>
`, `Bem-vindo ao Meu Advogado! Encontre advogados brasileiros nos EUA.`);

export const welcomeLawyerTemplate = (name: string, planName: string) => baseTemplate(`
  <h1>Bem-vindo ao Meu Advogado, Dr(a). ${name}! ⚖️</h1>
  
  <p>Parabéns! Seu cadastro foi aprovado e você agora faz parte da maior rede de advogados brasileiros nos Estados Unidos.</p>
  
  <div class="highlight-box">
    <p><strong>Seu plano:</strong> ${planName}</p>
  </div>
  
  <div style="text-align: center;">
    <a href="https://meuadvogado-us.vercel.app/advogado/dashboard" class="button button-green">
      📊 Acessar Dashboard
    </a>
  </div>
  
  <div class="divider"></div>
  
  <h2>Próximos passos importantes:</h2>
  
  <p><strong>✅ Complete seu perfil</strong><br>
  Perfis completos recebem 3x mais contatos de clientes.</p>
  
  <p><strong>✅ Verifique sua licença</strong><br>
  Advogados verificados aparecem em destaque nas buscas.</p>
  
  <p><strong>✅ Configure notificações</strong><br>
  Receba alertas de novos casos por email e WhatsApp.</p>
  
  <div class="divider"></div>
  
  <p style="text-align: center; color: #6b7280;">
    Dúvidas sobre como receber mais clientes? <a href="https://meuadvogado-us.vercel.app/advogado/ajuda">Acesse nossa central de ajuda</a>.
  </p>
`, `Bem-vindo ao Meu Advogado! Comece a receber clientes brasileiros.`);
