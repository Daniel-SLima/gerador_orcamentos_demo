import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// Build an isolated static copy. The Vercel/server routes in the checkout stay intact.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const staging = join(root, ".pages-demo-build");
const output = join(root, "out");
const basePath = process.env.DEMO_BASE_PATH || "/Portfolio/demos/orcamentos";
if (!basePath.startsWith("/") || basePath.endsWith("/")) {
  throw new Error("DEMO_BASE_PATH must start with / and must not have a trailing slash.");
}
if (!existsSync(join(root, "node_modules", "next", "dist", "bin", "next"))) {
  throw new Error("Run npm ci before building the Pages demonstration.");
}
rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });
cpSync(join(root, "app"), join(staging, "app"), {
  recursive: true,
  filter: source => source !== join(root, "app", "api"),
});
for (const path of ["public", "package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "postcss.config.mjs", "next-env.d.ts"]) {
  if (existsSync(join(root, path))) cpSync(join(root, path), join(staging, path), { recursive: true });
}
symlinkSync(join(root, "node_modules"), join(staging, "node_modules"), "dir");

// No remote font lookup is needed to build or use the static demonstration.
// Suspense keeps the original query-driven client screens exportable.
writeFileSync(join(staging, "app", "layout.tsx"), `import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "OrçaDemo | Demonstração local",
  description: "Explore clientes, produtos, orçamentos e produção com dados fictícios salvos apenas neste navegador.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body className="font-sans antialiased"><Suspense fallback={<div className="p-8 text-slate-600">Carregando demonstração...</div>}>{children}</Suspense></body></html>;
}
`);

const manifestPath = join(staging, "app", "manifest.ts");
if (existsSync(manifestPath)) {
  const manifest = readFileSync(manifestPath, "utf8").replace("start_url: '/'", `start_url: ${JSON.stringify(basePath + "/")}`);
  writeFileSync(manifestPath, 'export const dynamic = "force-static";\n' + manifest);
}

// One real static route handles any locally created record through ?id=.
// The same original UI components remain responsible for all record operations.
for (const route of ["imprimir/[id]", "dashboard/producao/[id]"]) {
  const routeDir = join(staging, "app", route);
  const original = readFileSync(join(routeDir, "page.tsx"), "utf8");
  writeFileSync(join(routeDir, "DemoContent.tsx"), original);
  writeFileSync(join(routeDir, "page.tsx"), `import { Suspense } from "react";
import DemoContent from "./DemoContent";
export const dynamicParams = false;
export function generateStaticParams() { return [{ id: "demo" }]; }
export default function Page() { return <Suspense fallback={<div className="p-8">Carregando demonstração...</div>}><DemoContent /></Suspense>; }
`);
}

const result = spawnSync(process.execPath, [join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"], {
  cwd: staging,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_LOCAL_DEMO: "true",
    NEXT_PUBLIC_DEMO_BASE_PATH: basePath,
    NEXT_TELEMETRY_DISABLED: "1",
  },
});
if (result.status !== 0) process.exit(result.status || 1);
rmSync(output, { recursive: true, force: true });
cpSync(join(staging, "out"), output, { recursive: true });
writeFileSync(join(output, ".nojekyll"), "");
console.log(`Static demonstration ready in ${output}; URL base ${basePath}/`);
