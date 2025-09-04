#!/usr/bin/env node

/**
 * Migration Script: Lokales PostgreSQL → Neon Database
 * 
 * Dieses Script hilft beim Umstieg von lokaler PostgreSQL auf Neon
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Migration von lokaler PostgreSQL zu Neon Database\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.log('❌ Fehler: package.json nicht gefunden. Bitte aus dem Projekt-Root ausführen.');
  process.exit(1);
}

// 1. Backup existing .env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const backupPath = path.join(process.cwd(), '.env.backup');
  fs.copyFileSync(envPath, backupPath);
  console.log('✅ Bestehende .env als .env.backup gesichert');
}

// 2. Setup Neon environment
const neonEnv = `# Neon Database Configuration
# Production URLs bereits in Vercel konfiguriert

DATABASE_URL="postgresql://neondb_owner:npg_TYlUPv56CQpZ@ep-calm-hat-ag3ra08i-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_TYlUPv56CQpZ@ep-calm-hat-ag3ra08i.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Development Keys
JWT_SECRET="development-jwt-secret-key-not-for-production-use"
ENCRYPTION_KEY="dev-encryption-key-32-chars-long!!"

# API Keys
TALLY_API_KEY=""
OPENAI_API_KEY=""

NODE_ENV="development"

# WARNUNG: Diese Konfiguration nutzt momentan die Production-Neon-Datenbank!
# Für echte Development-Isolation erstellen Sie eine separate Branch:
# 1. https://console.neon.tech/app/projects → ep-calm-hat-ag3ra08i
# 2. Erstelle Branch "development"
# 3. Ersetze URLs oben mit Development Branch URLs
`;

fs.writeFileSync(envPath, neonEnv);
console.log('✅ .env mit Neon-Konfiguration erstellt');

console.log('\n📦 Regeneriere Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generiert');
} catch (error) {
  console.error('❌ Fehler beim Generieren des Prisma Clients:', error.message);
  process.exit(1);
}

console.log('\n🗄️ Synchronisiere Datenbank-Schema...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Schema mit Neon synchronisiert');
} catch (error) {
  console.error('❌ Fehler bei der Schema-Synchronisation:', error.message);
  process.exit(1);
}

console.log('\n👥 Erstelle Test-User...');
try {
  execSync('node scripts/create-test-users.js', { stdio: 'inherit' });
  console.log('✅ Test-User erstellt');
} catch (error) {
  console.error('❌ Fehler beim Erstellen der Test-User:', error.message);
  process.exit(1);
}

console.log('\n🎉 Migration zu Neon erfolgreich abgeschlossen!');
console.log('\n📋 Nächste Schritte:');
console.log('1. npm run dev                    # Development Server starten');
console.log('2. Login testen: admin@admin.com / admin123');
console.log('3. Für Production-Isolation siehe NEON_SETUP.md\n');

console.log('⚠️  WICHTIGE HINWEISE:');
console.log('- Diese Konfiguration nutzt momentan die gleiche DB wie Production');
console.log('- Für echte Development-Isolation erstelle eine separate Neon Branch');  
console.log('- Die lokale PostgreSQL wird nicht mehr benötigt');
console.log('- Alle Daten sind jetzt in Neon (Cloud) gespeichert\n');

console.log('📚 Dokumentation: NEON_SETUP.md');
console.log('🌐 Neon Console: https://console.neon.tech/app/projects');