// lib/server-init.ts
// Inicialização de serviços do servidor

import { ensureQueuesInitialized, backgroundJobs } from './queues';

export function initializeServer() {
  console.log('🚀 Initializing server services...');
  
  // Inicializar filas de background jobs
  ensureQueuesInitialized();
  
  // Agendar jobs recorrentes
  backgroundJobs.scheduleRecurringJobs();
  
  console.log('✅ Server services initialized');
}

// Exportar para uso em _app.tsx ou server components
export { backgroundJobs };
