// lib/constants.ts

export const PRACTICE_AREAS = [
  { value: "imigracao", label: "Imigração (Vistos, Green Card, Cidadania)", icon: "Plane" },
  { value: "acidentes", label: "Acidentes Pessoais", icon: "AlertTriangle" },
  { value: "familia", label: "Direito de Família (Divórcio, Custódia)", icon: "Users" },
  { value: "trabalho", label: "Direito Trabalhista", icon: "Briefcase" },
  { value: "criminal", label: "Direito Criminal", icon: "Shield" },
  { value: "empresarial", label: "Direito Empresarial", icon: "Building" },
  { value: "imobiliario", label: "Direito Imobiliário", icon: "Home" },
  { value: "patrimonio", label: "Planejamento Patrimonial", icon: "FileText" },
  { value: "falencia", label: "Falência", icon: "DollarSign" },
  { value: "outros", label: "Outros", icon: "MoreHorizontal" },
];

export const US_STATES = [
  { value: "FL", label: "Florida" },
  { value: "CA", label: "California" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "MA", label: "Massachusetts" },
  { value: "NJ", label: "New Jersey" },
  { value: "GA", label: "Georgia" },
  { value: "IL", label: "Illinois" },
  { value: "PA", label: "Pennsylvania" },
  { value: "DC", label: "District of Columbia" },
];

export const LANGUAGES = [
  { value: "pt", label: "Português" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

export const CASE_URGENCY_LABELS = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export const CASE_STATUS_LABELS = {
  NEW: "Novo",
  ANALYZING: "Analisando",
  ANALYZED: "Analisado",
  MATCHED: "Match Encontrado",
  CONTACTED: "Advogado Contatou",
  CONVERTED: "Contratado",
  CLOSED: "Fechado",
};

export const SITE_CONFIG = {
  name: "Advogados Brasileiros USA",
  description: "Conectamos brasileiros a advogados brasileiros nos EUA",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
