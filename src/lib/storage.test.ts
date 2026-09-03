import { describe, it, expect } from "vitest";
import { sanitizeFilename, generatePresignedUploadUrl } from "./storage";

describe("Cloud Storage & Presigned URLs (EP-03 & EP-10)", () => {
  it("deve sanitizar nomes de arquivos com acentos, espaços e caracteres especiais", () => {
    expect(sanitizeFilename("Capa do Festival Verão 2026!.png")).toBe("capa-do-festival-verao-2026-.png");
    expect(sanitizeFilename("comprovante PIX #123 (Banco).pdf")).toBe("comprovante-pix-123-banco-.pdf");
  });

  it("deve gerar chave estruturada com isolamento multi-tenant (orgId/folder/uuid.ext)", async () => {
    const orgId = "org-test-uuid";
    const result = await generatePresignedUploadUrl({
      filename: "flyer_instagram.jpg",
      contentType: "image/jpeg",
      folder: "marketing",
      orgId,
    });

    expect(result.key).toMatch(/^org-test-uuid\/marketing\/[a-f0-9-]+\.jpg$/);
    expect(result.publicUrl).toContain("https://assets.pulse8.app/org-test-uuid/marketing/");
    expect(result.uploadUrl).toBeDefined();
  });
});
