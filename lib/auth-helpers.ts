import { randomBytes } from 'crypto';

/**
 * Gera um token seguro para email verification ou password reset
 * @returns Token hexadecimal de 32 caracteres
 */
export function generateSecureToken(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Calcula a data de expiração do token (24 horas por padrão)
 * @param hours Número de horas até expiração (default: 24)
 * @returns Data de expiração
 */
export function getTokenExpirationDate(hours: number = 24): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Valida se um token expirou
 * @param expiresAt Data de expiração do token
 * @returns true se ainda é válido, false se expirou
 */
export function isTokenValid(expiresAt: Date): boolean {
  return new Date() < expiresAt;
}
