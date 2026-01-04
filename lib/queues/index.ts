// lib/queues/index.ts
// Ponto de entrada para Background Jobs

import { initializeQueues, backgroundJobs } from './background-jobs';

// Inicializar filas quando o módulo for carregado
let initialized = false;

export function ensureQueuesInitialized() {
  if (!initialized) {
    initializeQueues();
    initialized = true;
  }
}

// Exportar tudo
export { backgroundJobs };
export * from './background-jobs';

// Auto-inicialização em ambiente de desenvolvimento
if (process.env.NODE_ENV === 'development') {
  ensureQueuesInitialized();
}
