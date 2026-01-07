// lib/email/templates/base-template.ts
// Template base para todos os emails

export const baseTemplate = (content: string, previewText?: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  ${previewText ? `<meta name="x-apple-disable-message-reformatting">` : ''}
  <title>Meu Advogado</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f3f4f6;
      -webkit-font-smoothing: antialiased;
    }
    
    .wrapper {
      width: 100%;
      background-color: #f3f4f6;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 32px;
      text-align: center;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      text-decoration: none;
    }
    
    .logo-icon {
      font-size: 32px;
      margin-right: 8px;
    }
    
    .content {
      padding: 40px 32px;
    }
    
    h1 {
      color: #111827;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px 0;
    }
    
    h2 {
      color: #111827;
      font-size: 20px;
      font-weight: 600;
      margin: 24px 0 12px 0;
    }
    
    p {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 16px 0;
      transition: transform 0.2s;
    }
    
    .button:hover {
      transform: scale(1.02);
    }
    
    .button-green {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
    
    .highlight-box {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 24px 0;
    }
    
    .highlight-box p {
      margin: 0;
      color: #1e40af;
    }
    
    .stats-row {
      display: flex;
      justify-content: space-around;
      margin: 24px 0;
      text-align: center;
    }
    
    .stat-item {
      padding: 16px;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #2563eb;
    }
    
    .stat-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }
    
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 32px 0;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 24px 32px;
      text-align: center;
    }
    
    .footer p {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 8px 0;
    }
    
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    
    .social-links {
      margin-top: 16px;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #6b7280;
      text-decoration: none;
    }
    
    @media only screen and (max-width: 600px) {
      .content {
        padding: 24px 20px;
      }
      
      h1 {
        font-size: 22px;
      }
      
      .stats-row {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
  
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="https://meuadvogado-us.vercel.app" class="logo">
          <span class="logo-icon">⚖️</span>Meu Advogado
        </a>
      </div>
      
      <div class="content">
        ${content}
      </div>
      
      <div class="footer">
        <p>© 2026 Meu Advogado. Todos os direitos reservados.</p>
        <p>
          <a href="https://meuadvogado-us.vercel.app/privacidade">Privacidade</a> · 
          <a href="https://meuadvogado-us.vercel.app/termos">Termos</a> · 
          <a href="https://meuadvogado-us.vercel.app">Site</a>
        </p>
        <p style="margin-top: 16px; font-size: 12px;">
          Você está recebendo este email porque se cadastrou no Meu Advogado.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
