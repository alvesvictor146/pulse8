import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { SupplierUpdateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const existing = await db.supplier.findFirst({
      where: { id: params.id, orgId: auth.orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
    }

    const json = await request.json();
    const result = SupplierUpdateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const updated = await db.supplier.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.cnpjCpf !== undefined && { cnpjCpf: data.cnpjCpf }),
        ...(data.contact !== undefined && { contact: data.contact }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.pix !== undefined && { pix: data.pix }),
        ...(data.category && { category: data.category }),
        ...(data.rating !== undefined && { rating: data.rating }),
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "SUPPLIER_UPDATE",
      entity: "Supplier",
      entityId: updated.id,
      payload: data,
      request,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar fornecedor: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const existing = await db.supplier.findFirst({
      where: { id: params.id, orgId: auth.orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
    }

    await db.supplier.delete({
      where: { id: params.id },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "SUPPLIER_DELETE",
      entity: "Supplier",
      entityId: params.id,
      payload: { name: existing.name },
      request,
    });

    return NextResponse.json({ success: true, message: "Fornecedor removido com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao excluir fornecedor: " + error.message },
      { status: 500 }
    );
  }
}
