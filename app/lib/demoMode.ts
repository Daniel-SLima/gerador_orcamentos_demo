/** GitHub Pages runs the original UI entirely against browser-local fixtures. */
export const LOCAL_DEMO = process.env.NEXT_PUBLIC_LOCAL_DEMO === "true";
export const DEMO_BASE_PATH = LOCAL_DEMO
  ? process.env.NEXT_PUBLIC_DEMO_BASE_PATH || "/Portfolio/demos/orcamentos"
  : "";

export function withDemoBase(path: string) {
  return `${DEMO_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

export function printRoute(id: string, action = "view") {
  return LOCAL_DEMO
    ? `/imprimir/demo/?id=${encodeURIComponent(id)}&action=${encodeURIComponent(action)}`
    : `/imprimir/${encodeURIComponent(id)}?action=${encodeURIComponent(action)}`;
}

export function printUrl(id: string, action = "view") {
  return withDemoBase(printRoute(id, action));
}

export function productionRoute(id: string) {
  return LOCAL_DEMO
    ? `/dashboard/producao/demo/?id=${encodeURIComponent(id)}`
    : `/dashboard/producao/${encodeURIComponent(id)}`;
}
