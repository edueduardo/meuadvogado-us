#!/bin/bash

echo "🔧 Configuring SQLite for local testing..."

# Backup original schema
cp prisma/schema.prisma prisma/schema-postgresql.prisma

# Copy SQLite schema
cp prisma/schema-sqlite.prisma prisma/schema.prisma

# Backup original .env.local
cp .env.local .env.local.postgresql

# Copy SQLite env
cp .env.local.sqlite .env.local

echo "✅ SQLite configured!"
echo "🚀 Running: npx prisma db push"

npx prisma db push

echo "🎉 SQLite database ready!"
