// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
