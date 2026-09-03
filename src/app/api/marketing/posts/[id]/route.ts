import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { PostQueueUpdateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const existing = await db.postQueue.findFirst({
      where: {
        id: params.id,
        event: { orgId: auth.orgId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    const json = await request.json();
    const result = PostQueueUpdateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const updated = await db.postQueue.update({
      where: { id: params.id },
      data: {
        ...(data.platform && { platform: data.platform }),
        ...(data.title && { title: data.title }),
        ...(data.copy !== undefined && { copy: data.copy }),
        ...(data.assetUrl !== undefined && { assetUrl: data.assetUrl }),
        ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null }),
        ...(data.status && { status: data.status }),
        ...(data.postUrl !== undefined && { postUrl: data.postUrl }),
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "MARKETING_POST_UPDATE",
      entity: "PostQueue",
      entityId: updated.id,
      payload: data,
      request,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar post de marketing: " + error.message },
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
    const existing = await db.postQueue.findFirst({
      where: {
        id: params.id,
        event: { orgId: auth.orgId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    await db.postQueue.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Post removido da fila" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao excluir post: " + error.message },
      { status: 500 }
    );
  }
}
