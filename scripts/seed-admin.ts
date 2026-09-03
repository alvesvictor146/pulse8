/**
 * Script de seed — cria usuário admin inicial para desenvolvimento.
 *
 * Uso:
 *   npx tsx scripts/seed-admin.ts
 *
 * Credenciais criadas:
 *   Email:  admin@pulse8.app
 *   Senha:  Pulse8@2026!
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados Pulse8...\n");

  // 1. Criar organização principal
  const org = await db.organization.upsert({
    where: { id: "org_pulse8_default" },
    create: {
      id: "org_pulse8_default",
      name: "Pulse8 Produções",
    },
    update: { name: "Pulse8 Produções" },
  });
  console.log(`✅ Organização: ${org.name} (id: ${org.id})`);

  // 2. Criar usuário admin
  const passwordHash = await bcrypt.hash("Pulse8@2026!", 12);
  const user = await db.user.upsert({
    where: { email: "admin@pulse8.app" },
    create: {
      email: "admin@pulse8.app",
      name: "Admin Pulse8",
      passwordHash,
    },
    update: { passwordHash },
  });
  console.log(`✅ Usuário: ${user.email} (id: ${user.id})`);

  // 3. Criar membership admin
  await db.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    create: {
      userId: user.id,
      organizationId: org.id,
      role: "admin",
    },
    update: { role: "admin" },
  });
  console.log(`✅ Membership: ${user.email} → ${org.name} [admin]`);

  console.log("\n🎉 Seed concluído com sucesso!\n");
  console.log("Credenciais de acesso:");
  console.log("  E-mail: admin@pulse8.app");
  console.log("  Senha:  Pulse8@2026!");
  console.log("\nAcesse: http://localhost:3000\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
