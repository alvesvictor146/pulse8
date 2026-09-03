import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { generatePresignedUploadUrl } from "@/lib/storage";

const PresignRequestSchema = z.object({
  filename: z.string().min(1, "Nome do arquivo é obrigatório"),
  contentType: z.string().min(1, "Tipo MIME é obrigatório"),
  folder: z.enum(["covers", "receipts", "marketing", "attachments"]).default("attachments"),
});

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = PresignRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { filename, contentType, folder } = result.data;

    const presigned = await generatePresignedUploadUrl({
      filename,
      contentType,
      folder,
      orgId: auth.orgId,
    });

    return NextResponse.json(presigned);
  } catch (error) {
    return handleApiError(error);
  }
}
