import { z } from "zod";
import { isValidCpfOrCnpj } from "./cpf-cnpj";

// ── Auth Schemas ──
export const RegisterSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  orgName: z.string().min(2, "Nome da produtora deve ter pelo menos 2 caracteres").optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// ── Event Schemas ──
export const EventCreateSchema = z.object({
  name: z.string().min(2, "Nome do evento é obrigatório"),
  theme: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  capacity: z.coerce.number().int().nonnegative().default(0),
  startAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional().nullable(),
  endAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional().nullable(),
  status: z.enum(["draft", "planning", "pre_production", "in_sales", "closed"]).default("draft"),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const EventUpdateSchema = EventCreateSchema.partial();

export const AreaSchema = z.object({
  name: z.string().min(1, "Nome da área é obrigatório"),
  capacity: z.coerce.number().int().nonnegative().default(0),
  accessLevel: z.string().default("geral"),
});

export const TicketSchema = z.object({
  areaId: z.string().uuid("ID da área inválido"),
  lot: z.string().default("1º Lote"),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  qtyTotal: z.coerce.number().int().positive("Quantidade deve ser maior que zero"),
});

// ── Finance Schemas ──
export const CostItemCreateSchema = z.object({
  eventId: z.string().uuid("ID do evento inválido"),
  accountId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  title: z.string().min(2, "Título do custo é obrigatório"),
  qty: z.coerce.number().positive().default(1),
  unitCost: z.coerce.number().nonnegative().default(0),
  totalCost: z.coerce.number().nonnegative().optional(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(["planned", "pending", "approved", "paid", "overdue"]).default("planned"),
  attachmentUrl: z.string().optional().nullable(),
});

export const CostItemUpdateSchema = CostItemCreateSchema.partial().extend({
  paidAt: z.string().optional().nullable(),
});

export const RevenueCreateSchema = z.object({
  eventId: z.string().uuid("ID do evento inválido"),
  source: z.enum(["Sympla", "Promoters", "Bar", "Patrocinio", "Estacionamento", "Outros"]),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  receivedAt: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
});

// ── Guest & Checkin Schemas ──
export const GuestCreateSchema = z.object({
  eventId: z.string().uuid().optional(),
  listName: z.string().default("Lista VIP"),
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  promoterId: z.string().uuid().optional().nullable(),
});

export const CheckinScanSchema = z.object({
  qrCode: z.string().min(5, "Código QR inválido"),
  eventId: z.string().uuid().optional(),
  device: z.string().optional(),
});

// ── Supplier Schema ──
export const SupplierCreateSchema = z.object({
  name: z.string().min(2, "Nome do fornecedor é obrigatório"),
  cnpjCpf: z.string().refine(isValidCpfOrCnpj, "CPF ou CNPJ inválido").optional().nullable().or(z.literal("")),
  contact: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  pix: z.string().optional().nullable(),
  category: z.string().default("Geral"),
  rating: z.coerce.number().min(0).max(5).default(5.0),
});

export const SupplierUpdateSchema = SupplierCreateSchema.partial();

// ── Team & Role Schemas ──
export const PersonCreateSchema = z.object({
  fullName: z.string().min(2, "Nome é obrigatório"),
  doc: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  pix: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const RoleCreateSchema = z.object({
  name: z.string().min(2, "Nome do cargo é obrigatório"),
  department: z.string().optional().nullable(),
  color: z.string().default("bg-brand-500"),
  accessLevel: z.string().default("staff"),
});

export const AssignmentCreateSchema = z.object({
  eventId: z.string().uuid("ID do evento inválido"),
  personId: z.string().uuid("ID da pessoa inválido"),
  roleId: z.string().uuid("ID do cargo inválido"),
  shiftStart: z.string().optional().nullable(),
  shiftEnd: z.string().optional().nullable(),
  payRate: z.coerce.number().nonnegative().optional().nullable(),
  payType: z.enum(["daily", "monthly", "hourly"]).default("daily"),
  status: z.enum(["scheduled", "checked_in", "completed", "cancelled"]).default("scheduled"),
});

// ── Promoter Schemas ──
export const PromoterCreateSchema = z.object({
  fullName: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  pix: z.string().optional().nullable(),
  team: z.string().default("Equipe Alpha"),
  level: z.string().default("junior"),
});

export const CampaignCreateSchema = z.object({
  eventId: z.string().uuid("ID do evento é obrigatório"),
  name: z.string().min(2, "Nome da campanha é obrigatório"),
  startAt: z.string().optional().nullable(),
  endAt: z.string().optional().nullable(),
  commissionType: z.enum(["percent", "fixed"]).default("percent"),
  commissionValue: z.coerce.number().nonnegative(),
});

export const PromoLinkCreateSchema = z.object({
  campaignId: z.string().uuid("ID da campanha inválido"),
  promoterId: z.string().uuid("ID do promoter inválido"),
  code: z.string().min(2, "Código UTM é obrigatório"),
  url: z.string().url("URL de destino inválida"),
  utmSource: z.string().default("promoter"),
  utmMedium: z.string().optional().nullable(),
});

// ── Schedule & Marketing Schemas ──
export const ScheduleCreateSchema = z.object({
  eventId: z.string().uuid("ID do evento inválido"),
  type: z.enum(["setup", "run", "teardown"]).default("run"),
  title: z.string().min(2, "Título é obrigatório"),
  description: z.string().optional().nullable(),
  startAt: z.string().optional().nullable(),
  endAt: z.string().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  status: z.enum(["pending", "in_progress", "done", "delayed"]).default("pending"),
});

export const ScheduleUpdateSchema = ScheduleCreateSchema.partial();

export const PostQueueCreateSchema = z.object({
  eventId: z.string().uuid("ID do evento inválido"),
  platform: z.string().default("instagram"),
  title: z.string().min(2, "Título é obrigatório"),
  copy: z.string().optional().nullable(),
  assetUrl: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  status: z.enum(["draft", "scheduled", "published", "failed"]).default("draft"),
  postUrl: z.string().optional().nullable(),
});

export const PostQueueUpdateSchema = PostQueueCreateSchema.partial();
