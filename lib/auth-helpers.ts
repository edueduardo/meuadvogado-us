import crypto from 'crypto'

/**
 * Gera um token seguro para verificação de email
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Define a data de expiração do token
 * @param hours Horas até expirar (padrão: 24)
 */
export function getTokenExpirationDate(hours: number = 24): Date {
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + hours)
  return expiration
}

/**
 * Verifica se um token está expirado
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Gera um hash seguro para senhas
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs')
  return await bcrypt.hash(password, 12)
}

/**
 * Verifica uma senha contra seu hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  return await bcrypt.compare(password, hashedPassword)
}
