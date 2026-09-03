import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { sanitizeFilename } from "@/lib/storage";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "attachments";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const sanitized = sanitizeFilename(file.name);
    const ext = sanitized.includes(".") ? sanitized.split(".").pop() : "bin";
    const uniqueId = randomUUID();
    const key = `${auth.orgId}/${folder}/${uniqueId}.${ext}`;

    const STORAGE_PUBLIC_URL = process.env.STORAGE_PUBLIC_URL || "https://assets.pulse8.app";
    const publicUrl = `${STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

    return NextResponse.json({
      success: true,
      key,
      publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro no upload direto: " + error.message },
      { status: 500 }
    );
  }
}
