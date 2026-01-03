// lib/auth/password-reset.ts
// Password Reset Service COMPLETO com tokens seguros

import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/resend-service';
import { backgroundJobs } from '@/lib/queues';
import * as bcrypt from 'bcryptjs';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export class PasswordResetService {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_EXPIRY_HOURS = 2;
  private static readonly MAX_ATTEMPTS = 3;

  /**
   * Solicita reset de senha
   * 1. Valida se email existe
   * 2. Gera token seguro
   * 3. Salva no banco
   * 4. Envia email
   */
  static async requestReset({ email }: PasswordResetRequest): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Buscar usuário pelo email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          lawyer: true,
          client: true
        }
      });

      // Sempre retornar sucesso por segurança
      if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return { 
          success: true, 
          message: "Se o email existir, você receberá instruções em instantes." 
        };
      }

      // 2. Verificar se já existe um token válido
      const existingToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          used: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (existingToken) {
        return { 
          success: true, 
          message: "Um email de reset já foi enviado. Verifique sua caixa de entrada." 
        };
      }

      // 3. Gerar token seguro
      const token = nanoid(this.TOKEN_LENGTH);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

      // 4. Salvar token no banco
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          attempts: 0
        }
      });

      // 5. Enviar email via background job
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      
      await backgroundJobs.addEmailJob({
        to: user.email,
        subject: "Reset de Senha - Meu Advogado",
        template: 'password-reset',
        data: {
          name: user.name,
          resetUrl,
          expiresHours: this.TOKEN_EXPIRY_HOURS
        }
      });

      return { 
        success: true, 
        message: "Email de reset enviado com sucesso!" 
      };

    } catch (error) {
      console.error('Password reset request error:', error);
      return { 
        success: false, 
        message: "Erro ao solicitar reset de senha. Tente novamente." 
      };
    }
  }

  /**
   * Confirma reset de senha
   * 1. Valida token
   * 2. Verifica expiração e tentativas
   * 3. Atualiza senha
   * 4. Invalida token
   */
  static async confirmReset({ token, newPassword }: PasswordResetConfirm): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Buscar token válido
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token,
          used: false,
          expiresAt: { gt: new Date() }
        },
        include: {
          user: true
        }
      });

      if (!resetToken) {
        return { 
          success: false, 
          message: "Token inválido ou expirado. Solicite um novo reset." 
        };
      }

      // 2. Verificar tentativas
      if (resetToken.attempts >= this.MAX_ATTEMPTS) {
        await prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true }
        });
        return { 
          success: false, 
          message: "Máximo de tentativas excedido. Solicite um novo token." 
        };
      }

      // 3. Validar nova senha
      if (newPassword.length < 8) {
        // Incrementar tentativas
        await prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { attempts: resetToken.attempts + 1 }
        });
        return { 
          success: false, 
          message: "A senha deve ter pelo menos 8 caracteres." 
        };
      }

      // 4. Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 5. Atualizar senha do usuário
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // 6. Invalidar token
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { 
          used: true,
          usedAt: new Date()
        }
      });

      // 7. Enviar confirmação via background job
      await backgroundJobs.addEmailJob({
        to: resetToken.user.email,
        subject: "Senha Alterada com Sucesso - Meu Advogado",
        template: 'password-reset-confirmation',
        data: {
          name: resetToken.user.name
        }
      });

      return { 
        success: true, 
        message: "Senha alterada com sucesso! Você já pode fazer login." 
      };

    } catch (error) {
      console.error('Password reset confirm error:', error);
      return { 
        success: false, 
        message: "Erro ao resetar senha. Tente novamente." 
      };
    }
  }

  /**
   * Limpa tokens expirados
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.passwordResetToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true }
          ]
        }
      });
      console.log('Cleaned up expired password reset tokens');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Valida força da senha
   */
  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("A senha deve ter pelo menos 8 caracteres");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra minúscula");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("A senha deve conter pelo menos um número");
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("A senha deve conter pelo menos um caractere especial (!@#$%^&*)");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
