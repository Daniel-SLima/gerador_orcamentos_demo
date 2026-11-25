import { LOCAL_DEMO } from "./demoMode";
import { createDemoUser, deleteDemoUser, resetDemoUserPassword, supabase } from "./supabase";

// A deliberately small offline address catalog for the demonstration forms.
const demoStates = [
  { sigla: "BA", nome: "Bahia" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "SP", nome: "São Paulo" },
];
const demoCities: Record<string, { id: number; nome: string }[]> = {
  BA: [{ id: 1, nome: "Salvador" }, { id: 2, nome: "Feira de Santana" }],
  RJ: [{ id: 3, nome: "Rio de Janeiro" }, { id: 4, nome: "Niterói" }],
  SP: [{ id: 5, nome: "São Paulo" }, { id: 6, nome: "Campinas" }],
};
const demoAddresses: Record<string, object> = {
  "01310100": { uf: "SP", bairro: "Bela Vista", logradouro: "Av. Paulista", localidade: "São Paulo" },
  "20010120": { uf: "RJ", bairro: "Centro", logradouro: "Rua do Mercado", localidade: "Rio de Janeiro" },
  "40020000": { uf: "BA", bairro: "Centro", logradouro: "Rua de Exemplo", localidade: "Salvador" },
};

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
}

/** Preserve the hosted app's request path unless the Pages demo is selected. */
export async function demoFetch(input: string, options: RequestInit = {}): Promise<Response> {
  if (!LOCAL_DEMO) return fetch(input, options);
  const url = new URL(input, "https://demo.invalid");
  const method = (options.method || "GET").toUpperCase();
  const body = typeof options.body === "string" ? JSON.parse(options.body) : {};

  if (url.hostname === "servicodados.ibge.gov.br") {
    const state = url.pathname.match(/estados\/([A-Z]{2})\/municipios/)?.[1];
    return json(state ? demoCities[state] || [] : demoStates);
  }
  if (url.hostname === "viacep.com.br") {
    const cep = url.pathname.match(/\/ws\/(\d{8})\//)?.[1];
    return json((cep && demoAddresses[cep]) || { erro: true, demo: true });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Inicie a demonstração para continuar." }, 401);

  try {
    if (url.pathname === "/api/vendedores") {
      if (method === "GET") {
        const { data, error } = await supabase.from("vendedores").select("*").order("nome");
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (method === "POST") {
        const { data, error } = await supabase.from("vendedores").insert(body).select("*").single();
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (method === "PUT") {
        const { id, ...values } = body;
        const { data, error } = await supabase.from("vendedores").update(values).eq("id", id).select("*").single();
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        const { data: quotations } = await supabase.from("orcamentos").select("id").eq("vendedor_id", id);
        if (quotations.length) return json({ error: "Este vendedor possui orçamentos na demonstração." }, 409);
        await supabase.from("vendedores").delete().eq("id", id);
        return json({ success: true });
      }
    }
    if (url.pathname === "/api/cloudinary-check") {
      const urls: string[] = Array.isArray(body.urls) ? body.urls : [];
      return json({ results: Object.fromEntries(urls.map(url => [url, url.startsWith("data:") || url.startsWith("blob:")])) });
    }
    if (url.pathname === "/api/admin/invite") {
      const result = createDemoUser(body.email, body.funcao || "vendedor", body.setor || null);
      return json({ success: true, email: result.email, temporaryPassword: result.password, demo: true });
    }
    if (url.pathname === "/api/admin/delete-user") {
      deleteDemoUser(body.userIdToDelete || body.user_id);
      return json({ success: true, demo: true });
    }
    if (url.pathname === "/api/admin/reset-password") {
      const result = resetDemoUserPassword(body.user_id);
      return json({ success: true, email: result.email, newPassword: result.password, demo: true });
    }
    if (url.pathname === "/api/admin/transfer-orcamentos") {
      const { data: seller } = await supabase.from("vendedores").select("*").eq("id", body.vendedorId).single();
      if (!seller) return json({ error: "Vendedor não encontrado." }, 404);
      const { data } = await supabase.from("orcamentos").update({ vendedor_id: seller.id, user_id: seller.user_id }).in("id", body.orcamentoIds || []).select("id");
      return json({ success: true, transferidos: data, demo: true });
    }
    return json({ error: "Esta operação não faz parte da demonstração local." }, 404);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Falha na demonstração local." }, 400);
  }
}
