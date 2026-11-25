const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");
const ts = require("typescript");

function runtime(local = true) {
  const store = new Map();
  const modules = new Map();
  let networkCalls = 0;
  const localStorage = {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key),
  };
  function load(name) {
    const file = path.resolve(__dirname, "../app/lib", name + ".ts");
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(compiled, {
      module, exports: module.exports,
      require: id => load(id.replace(/^\.\//, "")),
      process: { env: {
        NEXT_PUBLIC_LOCAL_DEMO: String(local),
        NEXT_PUBLIC_DEMO_BASE_PATH: local ? "/Portfolio/demos/orcamentos" : "",
      } },
      window: { localStorage }, crypto: webcrypto, URL, Response, console,
      fetch: async () => {
        networkCalls++;
        if (local) throw new Error("Local demonstration attempted a network request");
        return new Response("[]", { headers: { "Content-Type": "application/json" } });
      },
    }, { filename: file });
    return module.exports;
  }
  return { load, store, networkCalls: () => networkCalls };
}

test("local session, persistent CRUD, quotation relations, transfer and reset never use fetch", async () => {
  const demo = runtime();
  const { supabase, startLocalDemoSession, resetDemoData } = demo.load("supabase");
  const { demoFetch } = demo.load("demoFetch");
  assert.equal((await demoFetch("/api/vendedores")).status, 401);
  startLocalDemoSession();
  assert.equal((await (await demoFetch("/api/vendedores")).json()).length, 2);

  const created = await (await demoFetch("/api/vendedores", {
    method: "POST", body: JSON.stringify({ nome: "Vendedor de exemplo", user_id: "user-admin-demo", email: "seller@example.invalid" }),
  })).json();
  assert.ok(created.id);
  await demoFetch("/api/vendedores", { method: "PUT", body: JSON.stringify({ id: created.id, nome: "Nome alterado" }) });
  assert.equal((await (await demoFetch("/api/vendedores")).json()).find(row => row.id === created.id).nome, "Nome alterado");

  const { data: customer } = await supabase.from("clientes").insert({ nome_razao_social: "Cliente de exemplo" }).select().single();
  const { data: product } = await supabase.from("produtos").insert({ descricao: "Produto de exemplo", valor_unitario: 125 }).select().single();
  const { data: quote } = await supabase.from("orcamentos").insert({ cliente_id: customer.id, vendedor_id: created.id, user_id: "user-admin-demo", valor_total: 250, status: "Aberto" }).select().single();
  await supabase.from("itens_orcamento").insert({ orcamento_id: quote.id, produto_id: product.id, quantidade: 2, subtotal: 250 });
  const { data: readQuote } = await supabase.from("orcamentos").select().eq("id", quote.id).single();
  assert.equal(readQuote.numero_orcamento, 1003);
  assert.equal(readQuote.clientes.nome_razao_social, "Cliente de exemplo");
  assert.equal(readQuote.vendedores.nome, "Nome alterado");
  assert.equal((await demoFetch(`/api/vendedores?id=${created.id}`, { method: "DELETE" })).status, 409);

  const transfer = await (await demoFetch("/api/admin/transfer-orcamentos", {
    method: "POST", body: JSON.stringify({ vendedorId: "vendedor-julia", orcamentoIds: [quote.id] }),
  })).json();
  assert.equal(transfer.transferidos.length, 1);
  const { data: transferred } = await supabase.from("orcamentos").select().eq("id", quote.id).single();
  assert.equal(transferred.vendedor_id, "vendedor-julia");
  assert.equal(transferred.user_id, "user-julia-demo");
  assert.equal((await demoFetch(`/api/vendedores?id=${created.id}`, { method: "DELETE" })).status, 200);

  const invitation = await (await demoFetch("/api/admin/invite", {
    method: "POST", body: JSON.stringify({ email: "visitor@example.invalid", funcao: "vendedor" }),
  })).json();
  assert.equal(invitation.demo, true);
  assert.ok(invitation.temporaryPassword);
  assert.equal((await (await demoFetch("https://viacep.com.br/ws/01310100/json/")).json()).uf, "SP");
  assert.equal((await (await demoFetch("https://viacep.com.br/ws/99999999/json/")).json()).erro, true);
  assert.equal((await demoFetch("https://example.invalid/unavailable")).status, 404);
  assert.equal(demo.networkCalls(), 0);

  demo.store.set("another-portfolio-demo", "keep");
  resetDemoData();
  assert.equal((await supabase.auth.getSession()).data.session, null);
  assert.equal((await supabase.from("orcamentos").select()).data.length, 2);
  assert.equal(demo.store.get("another-portfolio-demo"), "keep");
});

test("new record links resolve to exported routes and default hosting keeps its original paths", async () => {
  const demo = runtime();
  const routes = demo.load("demoMode");
  assert.equal(routes.printUrl("new-record", "op"), "/Portfolio/demos/orcamentos/imprimir/demo/?id=new-record&action=op");
  assert.equal(routes.productionRoute("new-op"), "/dashboard/producao/demo/?id=new-op");

  const hosted = runtime(false);
  assert.equal(hosted.load("demoMode").printUrl("existing-record"), "/imprimir/existing-record?action=view");
  assert.equal(hosted.load("demoMode").productionRoute("existing-op"), "/dashboard/producao/existing-op");
  await hosted.load("demoFetch").demoFetch("/api/vendedores");
  assert.equal(hosted.networkCalls(), 1);
});
