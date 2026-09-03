import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHmac, randomUUID } from "crypto";

const prisma = new PrismaClient();
const HMAC_SECRET = process.env.HMAC_SECRET || "pulse8-secret-key-production-2026";

function generateQr(guestId: string, eventId: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const dataToSign = `${guestId}:${eventId}:${timestamp}`;
  const signature = createHmac("sha256", HMAC_SECRET)
    .update(dataToSign)
    .digest("hex")
    .slice(0, 16);
  return `P8:${guestId}:${eventId}:${timestamp}:${signature}`;
}

async function main() {
  console.log("🌱 Iniciando o Seed de dados realistas do Pulse8...");

  // 1. Limpeza prévia segura (em ordem reversa de dependências)
  try {
    await prisma.auditLog.deleteMany();
    await prisma.promoSale.deleteMany();
    await prisma.promoLink.deleteMany();
    await prisma.promoCampaign.deleteMany();
    await prisma.promoter.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.guestList.deleteMany();
    await prisma.postQueue.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.people.deleteMany();
    await prisma.role.deleteMany();
    await prisma.costItem.deleteMany();
    await prisma.costAccount.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.revenue.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.area.deleteMany();
    await prisma.event.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  } catch (e) {
    console.log("Aviso durante limpeza de tabelas:", e);
  }

  // 2. Criar Organização
  const org = await prisma.organization.create({
    data: {
      name: "Pulse8 Entretenimento & Festivais",
      cnpj: "12.345.678/0001-90",
      address: "Av. Brigadeiro Faria Lima, 3477 - São Paulo, SP",
    },
  });

  // 3. Criar Usuários
  const passwordHash = await bcrypt.hash("Pulse8@2026!", 12);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@pulse8.app",
      name: "Rodrigo Alencar (Diretor Geral)",
      passwordHash,
      phone: "(11) 99999-8888",
    },
  });

  const producerUser = await prisma.user.create({
    data: {
      email: "produtor@pulse8.app",
      name: "Camila Guimarães (Head de Produção)",
      passwordHash,
      phone: "(11) 97777-5555",
    },
  });

  await prisma.membership.createMany({
    data: [
      { userId: adminUser.id, organizationId: org.id, role: "ADMIN" },
      { userId: producerUser.id, organizationId: org.id, role: "PRODUCER" },
    ],
  });

  // 4. Criar Fornecedores
  const supSom = await prisma.supplier.create({
    data: {
      orgId: org.id,
      name: "Stage Master Som & Luz Ltda",
      cnpjCpf: "11222333000181",
      category: "Som & Iluminação",
      contact: "Marcos Som",
      phone: "(11) 98888-1111",
      email: "contato@stagemaster.com.br",
      pix: "11222333000181",
      rating: 5,
    },
  });

  const supArena = await prisma.supplier.create({
    data: {
      orgId: org.id,
      name: "Arena Festival São Paulo S/A",
      cnpjCpf: "00000000000191",
      category: "Locação de Espaço",
      contact: "Renata Comercial",
      phone: "(11) 97777-2222",
      email: "eventos@arenafestival.com.br",
      pix: "eventos@arenafestival.com.br",
      rating: 5,
    },
  });

  const supSeguranca = await prisma.supplier.create({
    data: {
      orgId: org.id,
      name: "Guarda Real Segurança Privada",
      cnpjCpf: "33444555000166",
      category: "Segurança & Brigada",
      contact: "Capitão Mendes",
      phone: "(11) 96666-3333",
      email: "operacoes@guardareal.com.br",
      pix: "(11) 96666-3333",
      rating: 4,
    },
  });

  // 5. Criar Plano de Contas
  const accInfra = await prisma.costAccount.create({
    data: { orgId: org.id, name: "Infraestrutura & Palco" },
  });
  const accOps = await prisma.costAccount.create({
    data: { orgId: org.id, name: "Operações & Staff" },
  });

  // 6. Criar Eventos
  const evtFestival = await prisma.event.create({
    data: {
      orgId: org.id,
      name: "Festival Pulsar 2026",
      theme: "Música Eletrônica & Experiências Imersivas",
      venue: "Arena Festival São Paulo",
      city: "São Paulo",
      state: "SP",
      capacity: 5000,
      startAt: new Date("2026-11-14T18:00:00Z"),
      endAt: new Date("2026-11-15T06:00:00Z"),
      status: "in_sales",
      coverUrl: "https://assets.pulse8.app/covers/festival-pulsar.jpg",
    },
  });

  const evtSunset = await prisma.event.create({
    data: {
      orgId: org.id,
      name: "Sunset Club Edition",
      theme: "Deep House & Open Bar Premium",
      venue: "Rooftop 011",
      city: "São Paulo",
      state: "SP",
      capacity: 1500,
      startAt: new Date("2026-12-05T16:00:00Z"),
      endAt: new Date("2026-12-06T02:00:00Z"),
      status: "planning",
    },
  });

  const evtBaile = await prisma.event.create({
    data: {
      orgId: org.id,
      name: "Baile da Favorita 2026",
      theme: "Funk & Hip Hop Festival",
      venue: "Pavilhão Anhembi",
      city: "São Paulo",
      state: "SP",
      capacity: 3500,
      startAt: new Date("2026-08-20T22:00:00Z"),
      endAt: new Date("2026-08-21T06:00:00Z"),
      status: "closed",
    },
  });

  // 7. Criar Áreas e Lotes de Ingressos
  const areaPista = await prisma.area.create({
    data: { eventId: evtFestival.id, name: "Pista Premium", capacity: 3500, accessLevel: "pista" },
  });
  const areaVip = await prisma.area.create({
    data: { eventId: evtFestival.id, name: "Camarote VIP Open Bar", capacity: 1200, accessLevel: "vip" },
  });
  const areaBackstage = await prisma.area.create({
    data: { eventId: evtFestival.id, name: "Backstage Experience", capacity: 300, accessLevel: "backstage" },
  });

  await prisma.ticket.createMany({
    data: [
      { eventId: evtFestival.id, areaId: areaPista.id, lot: "1º Lote", price: 150.0, qtyTotal: 1500, qtySold: 1500 },
      { eventId: evtFestival.id, areaId: areaPista.id, lot: "2º Lote", price: 200.0, qtyTotal: 2000, qtySold: 1650 },
      { eventId: evtFestival.id, areaId: areaVip.id, lot: "1º Lote", price: 350.0, qtyTotal: 600, qtySold: 600 },
      { eventId: evtFestival.id, areaId: areaVip.id, lot: "2º Lote", price: 450.0, qtyTotal: 600, qtySold: 420 },
      { eventId: evtFestival.id, areaId: areaBackstage.id, lot: "Lote Único", price: 900.0, qtyTotal: 300, qtySold: 280 },
    ],
  });

  // 8. Criar Custos e Receitas
  await prisma.revenue.createMany({
    data: [
      { eventId: evtFestival.id, source: "Sympla Ingressos", amount: 1050000.0, receivedAt: new Date(), reference: "Repasse Sympla Lote 1 e 2" },
      { eventId: evtFestival.id, source: "Bar & Alimentos", amount: 130000.0, receivedAt: new Date(), reference: "Adiantamento Concessão Bar" },
    ],
  });

  await prisma.costItem.createMany({
    data: [
      { eventId: evtFestival.id, accountId: accInfra.id, supplierId: supSom.id, title: "Palco Principal & Som Line Array", qty: 1, unitCost: 120000.0, totalCost: 120000.0, status: "paid" },
      { eventId: evtFestival.id, supplierId: supArena.id, title: "Locação da Arena Festival (Diária)", qty: 1, unitCost: 80000.0, totalCost: 80000.0, status: "paid" },
      { eventId: evtFestival.id, accountId: accOps.id, supplierId: supSeguranca.id, title: "Efetivo de 30 Seguranças Noturnos", qty: 30, unitCost: 350.0, totalCost: 10500.0, status: "paid" },
      { eventId: evtFestival.id, title: "Taxas ECAD & Alvará de Funcionamento", qty: 1, unitCost: 25000.0, totalCost: 25000.0, status: "paid" },
      { eventId: evtFestival.id, title: "Mídia Paga & Performance Meta Ads", qty: 1, unitCost: 35000.0, totalCost: 35000.0, status: "paid" },
    ],
  });

  // 9. Criar Pessoas, Cargos e Equipe
  const roleCoord = await prisma.role.create({
    data: { orgId: org.id, name: "Coordenador de Palco", department: "Produção", accessLevel: "leader" },
  });
  const roleBar = await prisma.role.create({
    data: { orgId: org.id, name: "Chefe de Bar", department: "Alimentos & Bebidas", accessLevel: "staff" },
  });

  const person1 = await prisma.people.create({
    data: { orgId: org.id, fullName: "Gabriel Siqueira", email: "gabriel@equipe.com", phone: "(11) 99111-2222", pix: "gabriel@equipe.com" },
  });
  const person2 = await prisma.people.create({
    data: { orgId: org.id, fullName: "Bruna Vasconcelos", email: "bruna@equipe.com", phone: "(11) 99333-4444", pix: "99333444400" },
  });

  await prisma.assignment.createMany({
    data: [
      { eventId: evtFestival.id, personId: person1.id, roleId: roleCoord.id, payRate: 600.0, payType: "daily", status: "confirmed" },
      { eventId: evtFestival.id, personId: person2.id, roleId: roleBar.id, payRate: 400.0, payType: "daily", status: "confirmed" },
    ],
  });

  // 10. Criar Promoters & Campanhas
  const promPerson1 = await prisma.people.create({
    data: { orgId: org.id, fullName: "Lucas Dj & Promoter", email: "lucas@promoters.com", phone: "(11) 98123-4567", pix: "lucas@promoters.com" },
  });
  const promPerson2 = await prisma.people.create({
    data: { orgId: org.id, fullName: "Juliana Clubber", email: "juliana@promoters.com", phone: "(11) 98765-4321", pix: "12345678900" },
  });

  const prom1 = await prisma.promoter.create({
    data: { orgId: org.id, personId: promPerson1.id, team: "Zona Sul", level: "elite", status: "active" },
  });
  const prom2 = await prisma.promoter.create({
    data: { orgId: org.id, personId: promPerson2.id, team: "Zona Oeste", level: "pro", status: "active" },
  });

  const campFestival = await prisma.promoCampaign.create({
    data: { eventId: evtFestival.id, name: "Embaixadores Pulsar 2026", commissionType: "percent", commissionValue: 10.0 },
  });

  const link1 = await prisma.promoLink.create({
    data: { campaignId: campFestival.id, promoterId: prom1.id, code: "LUCAS10", url: "https://pulse8.app/r/LUCAS10" },
  });
  const link2 = await prisma.promoLink.create({
    data: { campaignId: campFestival.id, promoterId: prom2.id, code: "JULIANA10", url: "https://pulse8.app/r/JULIANA10" },
  });

  await prisma.promoSale.createMany({
    data: [
      { campaignId: campFestival.id, promoterId: prom1.id, code: link1.code, buyerName: "Arthur Zanetti", buyerEmail: "arthur@email.com", qty: 2, amount: 400.0, channel: "sympla" },
      { campaignId: campFestival.id, promoterId: prom1.id, code: link1.code, buyerName: "Fernanda Lima", buyerEmail: "fernanda@email.com", qty: 4, amount: 1400.0, channel: "sympla" },
      { campaignId: campFestival.id, promoterId: prom2.id, code: link2.code, buyerName: "Carlos Eduardo", buyerEmail: "carlos@email.com", qty: 1, amount: 200.0, channel: "sympla" },
    ],
  });

  // 11. Criar Listas de Convidados e Convidados com QR Code HMAC
  const listVip = await prisma.guestList.create({
    data: { eventId: evtFestival.id, name: "Lista VIP Influenciadores & DJs", type: "VIP" },
  });
  const listPress = await prisma.guestList.create({
    data: { eventId: evtFestival.id, name: "Imprensa & Mídia", type: "Imprensa" },
  });

  const guestsData = [
    { name: "Alok Petrillo", email: "alok@specialguest.com", listId: listVip.id, isVip: true },
    { name: "Vintage Culture (Lukas)", email: "lukas@specialguest.com", listId: listVip.id, isVip: true },
    { name: "Mariana Rios", email: "mariana.rios@influencer.com", listId: listVip.id, isVip: true },
    { name: "Bruno Gagliasso", email: "bruno@influencer.com", listId: listVip.id, isVip: true },
    { name: "Giovanna Ewbank", email: "gio@influencer.com", listId: listVip.id, isVip: true },
    { name: "Enzo Celulari", email: "enzo@influencer.com", listId: listVip.id, isVip: true },
    { name: "Pedro Sampaio", email: "pedro@djpress.com", listId: listVip.id, isVip: true },
    { name: "Maya Gabeira", email: "maya@athlete.com", listId: listVip.id, isVip: true },
    { name: "Gabriel Medina", email: "medina@athlete.com", listId: listVip.id, isVip: true },
    { name: "Anitta Machado", email: "anitta@press.com", listId: listVip.id, isVip: true },
    { name: "Editor House Mag", email: "redacao@housemag.com.br", listId: listPress.id, isVip: false },
    { name: "Repórter Rolling Stone", email: "imprensa@rollingstone.com.br", listId: listPress.id, isVip: false },
    { name: "Fotógrafo Oficial SP", email: "foto@cobertura.com.br", listId: listPress.id, isVip: false },
  ];

  for (const g of guestsData) {
    const guestId = randomUUID();
    const qrCode = generateQr(guestId, evtFestival.id);
    await prisma.guest.create({
      data: {
        id: guestId,
        guestlistId: g.listId,
        fullName: g.name,
        email: g.email,
        qrCode,
        status: "issued",
        notes: g.isVip ? "Acesso Livre ao Backstage e Palco" : "Acesso à Sala de Imprensa",
      },
    });
  }

  // 12. Criar Cronograma & Marketing
  await prisma.schedule.createMany({
    data: [
      { eventId: evtFestival.id, type: "setup", title: "Início da Montagem do Palco", startAt: new Date("2026-11-13T08:00:00Z"), endAt: new Date("2026-11-13T18:00:00Z"), ownerName: "Marcos Som", status: "completed" },
      { eventId: evtFestival.id, type: "setup", title: "Passagem de Som & Luz", startAt: new Date("2026-11-14T14:00:00Z"), endAt: new Date("2026-11-14T17:00:00Z"), ownerName: "Gabriel Siqueira", status: "in_progress" },
      { eventId: evtFestival.id, type: "run", title: "Abertura Oficial dos Portões", startAt: new Date("2026-11-14T18:00:00Z"), endAt: new Date("2026-11-14T19:00:00Z"), ownerName: "Capitão Mendes", status: "pending" },
    ],
  });

  await prisma.postQueue.createMany({
    data: [
      { eventId: evtFestival.id, platform: "instagram", title: "Line-up Completo Liberado", copy: "Line-up completo liberado! Garanta seu ingresso com lote promocional.", status: "published" },
      { eventId: evtFestival.id, platform: "tiktok", title: "Bastidores do Palco", copy: "Bastidores da montagem do palco gigante do Festival Pulsar!", status: "scheduled" },
    ],
  });

  // 13. Registrar Auditoria
  await prisma.auditLog.create({
    data: {
      orgId: org.id,
      actorId: adminUser.id,
      action: "SEED_DATABASE_INITIALIZED",
      entity: "Organization",
      entityId: org.id,
      payload: JSON.stringify({ note: "Dados de demonstração gerados com sucesso para o Festival Pulsar 2026" }),
      ipAddress: "127.0.0.1",
    },
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log(`👤 Admin: admin@pulse8.app | Senha: Pulse8@2026!`);
  console.log(`👤 Produtor: produtor@pulse8.app | Senha: Pulse8@2026!`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
