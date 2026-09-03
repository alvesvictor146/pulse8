import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { PostQueueCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");

    const where: any = {
      event: {
        orgId: auth.orgId,
      },
    };

    if (eventId) {
      where.eventId = eventId;
    }

    if (platform && platform !== "all") {
      where.platform = platform;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const posts = await db.postQueue.findMany({
      where,
      include: {
        event: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar fila de posts de marketing: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = PostQueueCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const event = await db.event.findFirst({
      where: { id: data.eventId, orgId: auth.orgId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const post = await db.postQueue.create({
      data: {
        eventId: data.eventId,
        platform: data.platform,
        title: data.title,
        copy: data.copy || null,
        assetUrl: data.assetUrl || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: data.status,
        postUrl: data.postUrl || null,
      },
      include: {
        event: true,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "MARKETING_POST_CREATE",
      entity: "PostQueue",
      entityId: post.id,
      payload: { title: post.title, platform: post.platform },
      request,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao agendar post de marketing: " + error.message },
      { status: 500 }
    );
  }
}
