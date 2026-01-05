// scripts/check-env.js
// Verificar variáveis de ambiente configuradas

require('dotenv').config({ path: '.env.local' });

const requiredVars = [
  'NEXTAUTH_SECRET',
  'DATABASE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

const optionalVars = [
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'ANTHROPIC_API_KEY'
];

console.log('🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE\n');

console.log('✅ VARIÁVEIS ESSENCIAIS:');
let missingRequired = 0;

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: ${varName.length > 20 ? '***CONFIGURADO***' : process.env[varName]}`);
  } else {
    console.log(`   ❌ ${varName}: NÃO CONFIGURADO`);
    missingRequired++;
  }
});

console.log('\n⚠️  VARIÁVEIS OPCIONAIS:');
let missingOptional = 0;

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: ***CONFIGURADO***`);
  } else {
    console.log(`   ⚠️  ${varName}: não configurado (opcional)`);
    missingOptional++;
  }
});

console.log('\n📊 RESUMO:');
console.log(`   Essenciais faltando: ${missingRequired}/${requiredVars.length}`);
console.log(`   Opcionais faltando: ${missingOptional}/${optionalVars.length}`);

if (missingRequired === 0) {
  console.log('\n🎉 PERFEITO! Todas as variáveis essenciais estão configuradas.');
} else {
  console.log('\n⚠️  ATENÇÃO! Configure as variáveis essenciais faltantes.');
}

if (missingOptional === 0) {
  console.log('🚀 EXCELENTE! Todas as features estarão disponíveis.');
} else {
  console.log(`ℹ️  ${missingOptional} features não funcionarão sem as variáveis opcionais.`);
}

// Score
const totalScore = ((requiredVars.length + optionalVars.length - missingRequired - missingOptional) / (requiredVars.length + optionalVars.length)) * 100;
console.log(`\n📈 Score de Configuração: ${totalScore.toFixed(0)}%`);

if (totalScore >= 80) {
  console.log('✅ Sistema pronto para produção!');
} else if (totalScore >= 60) {
  console.log('⚠️  Sistema funcional, mas com limitações.');
} else {
  console.log('❌ Sistema precisa de mais configurações.');
}
