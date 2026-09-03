/**
 * Script para injetar import de handleApiError em todas as rotas de API.
 * Execução: npx tsx scripts/patch-routes.ts
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const API_DIR = join(process.cwd(), "src/app/api");
const SKIP_DIRS = ["auth", "webhooks"];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.some((s) => full.includes(`/api/${s}`) || full.includes(`\\api\\${s}`))) continue;
      files.push(...walk(full));
    } else if (entry === "route.ts") {
      files.push(full);
    }
  }
  return files;
}

const routes = walk(API_DIR);
let updated = 0;
let skipped = 0;

for (const routePath of routes) {
  let content = readFileSync(routePath, "utf-8");

  const hasAuthContext = content.includes('getAuthContext');
  const hasApiError = content.includes('api-error');

  if (!hasAuthContext || hasApiError) {
    skipped++;
    console.log(`⏭  ${routePath.split("api")[1]} (sem auth ou já atualizado)`);
    continue;
  }

  // 1. Adicionar import de handleApiError
  content = content.replace(
    `import { getAuthContext } from "@/lib/session";`,
    `import { getAuthContext } from "@/lib/session";\nimport { handleApiError } from "@/lib/api-error";`
  );

  // 2. Substituir catch genérico pelo handleApiError
  // Padrão: } catch (error: any) { ... return NextResponse.json({error: "..."+error.message}, {status: 500}) }
  content = content.replace(
    /  } catch \(error: any\) \{[\s\S]*?console\.error\([^)]+\);[\s\S]*?return NextResponse\.json\(\s*\{ error: [^}]+\},\s*\{ status: 500 \}\s*\);\s*  \}/g,
    `  } catch (error) {\n    return handleApiError(error);\n  }`
  );

  writeFileSync(routePath, content, "utf-8");
  updated++;
  console.log(`✅ ${routePath.split("api")[1]}`);
}

console.log(`\n📊 Resultado: ${updated} atualizados, ${skipped} pulados de ${routes.length} routes`);
