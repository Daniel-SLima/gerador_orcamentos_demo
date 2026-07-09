/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

type DemoRow = Record<string, any>;
type DemoTable =
  | "clientes"
  | "empresa_perfil"
  | "demo_auth_users"
  | "itens_op"
  | "itens_orcamento"
  | "materiais_op"
  | "notifications"
  | "orcamento_anexos"
  | "orcamentos"
  | "ordens_producao"
  | "perfis_usuarios"
  | "produtos"
  | "registros_checklist"
  | "subitens_op"
  | "subitens_produto"
  | "vendedores";

type DemoDatabase = Record<DemoTable, DemoRow[]>;

const STORAGE_KEY = "gerador_orcamentos_demo_v1";
const SESSION_KEY = "gerador_orcamentos_demo_session_v1";
const DEMO_USER = { id: "user-admin-demo", email: "admin@admin.com" };

const now = () => new Date().toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function getInitialData(): DemoDatabase {
  const createdAt = "2026-07-09T12:00:00.000Z";
  const clienteA = "cliente-alfa";
  const clienteB = "cliente-beta";
  const vendedorA = "vendedor-admin";
  const produtoA = "produto-totem";
  const produtoB = "produto-fachada";
  const produtoC = "produto-adesivo";
  const orcamentoA = "orcamento-1001";
  const orcamentoB = "orcamento-1002";
  const itemOrcA = "item-orcamento-1";
  const itemOrcB = "item-orcamento-2";
  const opA = "op-1001";
  const itemOpA = "item-op-1";
  const itemOpB = "item-op-2";

  return {
    perfis_usuarios: [
      { id: "perfil-admin", user_id: DEMO_USER.id, email: DEMO_USER.email, funcao: "admin", setor: null, created_at: createdAt, updated_at: createdAt },
      { id: "perfil-operador", user_id: "user-operador-demo", email: "operador@demo.com", funcao: "operador", setor: "metalurgia", created_at: createdAt, updated_at: createdAt },
      { id: "perfil-compras", user_id: "user-compras-demo", email: "compras@demo.com", funcao: "compras", setor: null, created_at: createdAt, updated_at: createdAt },
      { id: "perfil-julia", user_id: "user-julia-demo", email: "julia@demo.com", funcao: "vendedor", setor: null, created_at: createdAt, updated_at: createdAt },
    ],
    demo_auth_users: [
      { id: DEMO_USER.id, email: DEMO_USER.email, password: "admin123", created_at: createdAt, updated_at: createdAt },
      { id: "user-operador-demo", email: "operador@demo.com", password: "demo1234", created_at: createdAt, updated_at: createdAt },
      { id: "user-compras-demo", email: "compras@demo.com", password: "demo1234", created_at: createdAt, updated_at: createdAt },
      { id: "user-julia-demo", email: "julia@demo.com", password: "demo1234", created_at: createdAt, updated_at: createdAt },
    ],
    vendedores: [
      { id: vendedorA, nome: "Daniel Lima", telefone: "(11) 97720-6591", email: DEMO_USER.email, user_id: DEMO_USER.id, created_at: createdAt, updated_at: createdAt },
      { id: "vendedor-julia", nome: "Julia Martins", telefone: "(11) 95555-0101", email: "julia@demo.com", user_id: "user-julia-demo", created_at: createdAt, updated_at: createdAt },
    ],
    empresa_perfil: [
      {
        id: "empresa-demo",
        nome_empresa: "Sane Comunicacao Visual",
        cnpj: "12.345.678/0001-90",
        telefone: "(11) 4002-8922",
        email: "contato@sane-demo.com",
        endereco: "Rua das Amostras, 120",
        cidade: "Sao Paulo",
        uf: "SP",
        logo_url: "/Logo_Sane_512x512.png",
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    clientes: [
      {
        id: clienteA,
        nome_razao_social: "Alfa Comercio de Decoracao",
        cpf_cnpj: "45.222.111/0001-10",
        contato_nome: "Marina Costa",
        telefone: "(11) 98888-0101",
        email: "marina@alfa-demo.com",
        endereco: "Av. Paulista, 1000",
        cep: "01310-100",
        uf: "SP",
        cidade: "Sao Paulo",
        bairro: "Bela Vista",
        rua_numero: "Av. Paulista, 1000",
        inscricao_estadual: "Isento",
        inscricao_municipal: "",
        user_id: DEMO_USER.id,
        created_at: createdAt,
        updated_at: createdAt,
      },
      {
        id: clienteB,
        nome_razao_social: "Beta Eventos Corporativos",
        cpf_cnpj: "37.555.333/0001-22",
        contato_nome: "Rafael Nogueira",
        telefone: "(21) 97777-0202",
        email: "rafael@beta-demo.com",
        endereco: "Rua do Mercado, 45",
        cep: "20010-120",
        uf: "RJ",
        cidade: "Rio de Janeiro",
        bairro: "Centro",
        rua_numero: "Rua do Mercado, 45",
        inscricao_estadual: "Isento",
        inscricao_municipal: "",
        user_id: DEMO_USER.id,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    produtos: [
      { id: produtoA, codigo_item: "TOT-001", descricao: "Totem em ACM com iluminacao", medidas: "180 x 60 cm", valor_unitario: 1850, imagem_url: "", ultimo_uso: createdAt, user_id: DEMO_USER.id, created_at: createdAt, updated_at: createdAt },
      { id: produtoB, codigo_item: "FCH-002", descricao: "Fachada em lona tensionada", medidas: "300 x 90 cm", valor_unitario: 2450, imagem_url: "", ultimo_uso: createdAt, user_id: DEMO_USER.id, created_at: createdAt, updated_at: createdAt },
      { id: produtoC, codigo_item: "ADS-003", descricao: "Adesivo vinil recortado", medidas: "100 x 80 cm", valor_unitario: 320, imagem_url: "", ultimo_uso: null, user_id: DEMO_USER.id, created_at: createdAt, updated_at: createdAt },
    ],
    subitens_produto: [
      { id: "sub-prod-1", produto_id: produtoA, nome: "Corte da estrutura", ordem: 0, created_at: createdAt },
      { id: "sub-prod-2", produto_id: produtoA, nome: "Instalacao eletrica", ordem: 1, created_at: createdAt },
      { id: "sub-prod-3", produto_id: produtoB, nome: "Impressao da lona", ordem: 0, created_at: createdAt },
    ],
    orcamentos: [
      { id: orcamentoA, numero_orcamento: 1001, data_emissao: "2026-07-09", cliente_id: clienteA, vendedor_id: vendedorA, user_id: DEMO_USER.id, prazo: "10 dias uteis", forma_pagamento: "50% entrada e 50% na entrega", validade_proposta: "7 dias", observacoes: "Instalacao em horario comercial.", desconto_total: 150, valor_total: 4150, status: "Aprovado", created_at: createdAt, updated_at: createdAt },
      { id: orcamentoB, numero_orcamento: 1002, data_emissao: "2026-07-09", cliente_id: clienteB, vendedor_id: vendedorA, user_id: DEMO_USER.id, prazo: "5 dias uteis", forma_pagamento: "A vista", validade_proposta: "5 dias", observacoes: "Arte final enviada pelo cliente.", desconto_total: 0, valor_total: 640, status: "Aberto", created_at: createdAt, updated_at: createdAt },
    ],
    itens_orcamento: [
      { id: itemOrcA, orcamento_id: orcamentoA, produto_id: produtoA, descricao: "Totem em ACM com iluminacao", quantidade: 1, valor_unitario_aplicado: 1850, medidas: "180 x 60 cm", desconto: 0, subtotal: 1850, user_id: DEMO_USER.id, created_at: createdAt },
      { id: itemOrcB, orcamento_id: orcamentoA, produto_id: produtoB, descricao: "Fachada em lona tensionada", quantidade: 1, valor_unitario_aplicado: 2450, medidas: "300 x 90 cm", desconto: 150, subtotal: 2300, user_id: DEMO_USER.id, created_at: createdAt },
      { id: "item-orcamento-3", orcamento_id: orcamentoB, produto_id: produtoC, descricao: "Adesivo vinil recortado", quantidade: 2, valor_unitario_aplicado: 320, medidas: "100 x 80 cm", desconto: 0, subtotal: 640, user_id: DEMO_USER.id, created_at: createdAt },
    ],
    orcamento_anexos: [],
    ordens_producao: [
      { id: opA, orcamento_id: orcamentoA, numero_op: 1001, status: "em_producao", observacoes: "Demo: acompanhar primeiras etapas.", endereco_rua: "Av. Paulista", endereco_numero: "1000", endereco_bairro: "Bela Vista", endereco_cidade: "Sao Paulo", endereco_cep: "01310-100", contato_nome: "Marina Costa", contato_telefone: "(11) 98888-0101", prazo_entrega: "2026-07-20", created_at: createdAt, updated_at: createdAt },
    ],
    itens_op: [
      { id: itemOpA, op_id: opA, item_orcamento_id: itemOrcA, produto_id: produtoA, descricao: "Totem em ACM com iluminacao", quantidade: 1, medidas: "180 x 60 cm", imagem_url: "", setor_atual: "metalurgia", status_item: "em_andamento", created_at: createdAt, updated_at: createdAt },
      { id: itemOpB, op_id: opA, item_orcamento_id: itemOrcB, produto_id: produtoB, descricao: "Fachada em lona tensionada", quantidade: 1, medidas: "300 x 90 cm", imagem_url: "", setor_atual: "aguardando", status_item: "pendente", created_at: createdAt, updated_at: createdAt },
    ],
    subitens_op: [
      { id: "sub-op-1", item_op_id: itemOpA, nome: "Separar chapas", ordem: 0, concluido: true, concluido_por: DEMO_USER.id, concluido_em: createdAt, status: "concluido", created_at: createdAt },
      { id: "sub-op-2", item_op_id: itemOpA, nome: "Montar estrutura", ordem: 1, concluido: false, concluido_por: null, concluido_em: null, status: "pendente", created_at: createdAt },
    ],
    registros_checklist: [
      { id: "registro-1", item_op_id: itemOpA, subitem_id: "sub-op-1", status: "concluido", usuario_id: DEMO_USER.id, observacao: "Item marcado no ambiente demo.", created_at: createdAt },
    ],
    materiais_op: [
      { id: "material-1", op_id: opA, descricao: "Fonte 12V para iluminacao", quantidade_necessaria: 2, unidade: "un", quantidade_comprar: 2, status: "solicitado", observacoes: "Material para demonstracao do fluxo de compras.", previsao_entrega: null, destino_entrega: null, comprado_por: null, created_at: createdAt, updated_at: createdAt },
    ],
    notifications: [
      { id: "notif-1", user_id: DEMO_USER.id, titulo: "Bem-vindo ao modo demo", mensagem: "Os dados desta versao ficam salvos apenas no navegador.", tipo: "info", lida: false, link: "/dashboard", created_at: createdAt },
    ],
  };
}

function hasWindow() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function loadDb(): DemoDatabase {
  if (!hasWindow()) return getInitialData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = getInitialData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as DemoDatabase;
    const initial = getInitialData();
    let changed = false;
    (Object.keys(initial) as DemoTable[]).forEach((table) => {
      if (!Array.isArray(parsed[table])) {
        parsed[table] = clone(initial[table]);
        changed = true;
      }
    });
    if (changed) saveDb(parsed);
    return parsed;
  } catch {
    const initial = getInitialData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveDb(db: DemoDatabase) {
  if (hasWindow()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDemoData() {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getInitialData()));
  window.localStorage.removeItem(SESSION_KEY);
}

function generateDemoPassword() {
  return `demo${Math.floor(1000 + Math.random() * 9000)}`;
}

export function createDemoUser(email: string, funcao = "vendedor", setor: string | null = null) {
  const db = loadDb();
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = db.demo_auth_users.find((user) => user.email.toLowerCase() === normalizedEmail);
  if (existingUser) throw new Error("Este e-mail ja existe na demo.");

  const userId = `user-${uuid()}`;
  const password = generateDemoPassword();
  const profile = {
    id: `perfil-${uuid()}`,
    user_id: userId,
    email: normalizedEmail,
    funcao,
    setor: funcao === "operador" ? setor : null,
    created_at: now(),
    updated_at: now(),
  };

  db.demo_auth_users.push({ id: userId, email: normalizedEmail, password, created_at: now(), updated_at: now() });
  db.perfis_usuarios.push(profile);

  if (funcao === "vendedor" || funcao === "admin") {
    db.vendedores.push({
      id: `vendedor-${uuid()}`,
      nome: normalizedEmail.split("@")[0],
      telefone: "",
      email: normalizedEmail,
      user_id: userId,
      created_at: now(),
      updated_at: now(),
    });
  }

  saveDb(db);
  return { email: normalizedEmail, password, profile };
}

export function resetDemoUserPassword(userId: string) {
  const db = loadDb();
  const authUser = db.demo_auth_users.find((user) => user.id === userId);
  if (!authUser) throw new Error("Usuario nao encontrado na demo.");
  const password = generateDemoPassword();
  authUser.password = password;
  authUser.updated_at = now();
  saveDb(db);
  return { email: authUser.email, password };
}

export function deleteDemoUser(userId: string) {
  const db = loadDb();
  if (userId === DEMO_USER.id) throw new Error("A conta admin principal da demo nao pode ser apagada.");
  db.demo_auth_users = db.demo_auth_users.filter((user) => user.id !== userId);
  db.perfis_usuarios = db.perfis_usuarios.filter((profile) => profile.user_id !== userId && profile.id !== userId);
  db.vendedores = db.vendedores.filter((vendedor) => vendedor.user_id !== userId);
  saveDb(db);
}

function getStoredSession() {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setStoredSession(session: any) {
  if (hasWindow()) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  if (hasWindow()) window.localStorage.removeItem(SESSION_KEY);
}

function normalizeComparable(value: any) {
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
}

function matchesOr(row: DemoRow, expression: string) {
  return expression.split(",").some((part) => {
    const [field, operator, ...rest] = part.split(".");
    const expected = rest.join(".");
    const current = row[field];
    if (operator === "eq") return String(current) === expected;
    if (operator === "ilike") {
      const needle = expected.replaceAll("%", "").toLowerCase();
      return normalizeComparable(current).includes(needle);
    }
    return false;
  });
}

function nextNumber(rows: DemoRow[], field: string, start: number) {
  const max = rows.reduce((acc, row) => Math.max(acc, Number(row[field]) || 0), 0);
  return Math.max(max + 1, start);
}

function applyDefaults(table: DemoTable, row: DemoRow, db: DemoDatabase) {
  const stamped: DemoRow = {
    id: row.id ?? uuid(),
    created_at: row.created_at ?? now(),
    updated_at: row.updated_at ?? now(),
    ...row,
  };

  if (table === "orcamentos" && !stamped.numero_orcamento) {
    stamped.numero_orcamento = nextNumber(db.orcamentos, "numero_orcamento", 1001);
  }
  if (table === "ordens_producao" && !stamped.numero_op) {
    stamped.numero_op = nextNumber(db.ordens_producao, "numero_op", 1001);
  }
  return stamped;
}

function enrichRow(table: DemoTable, row: DemoRow, db: DemoDatabase): DemoRow {
  const enriched = clone(row);

  if (table === "orcamentos") {
    enriched.clientes = db.clientes.find((cliente) => cliente.id === row.cliente_id) ?? null;
    enriched.vendedores = db.vendedores.find((vendedor) => vendedor.id === row.vendedor_id) ?? null;
  }

  if (table === "itens_orcamento") {
    enriched.produtos = db.produtos.find((produto) => produto.id === row.produto_id) ?? null;
  }

  if (table === "ordens_producao") {
    const orcamento = db.orcamentos.find((orc) => orc.id === row.orcamento_id);
    enriched.orcamentos = orcamento ? enrichRow("orcamentos", orcamento, db) : null;
    enriched.itens_op = db.itens_op.filter((item) => item.op_id === row.id).map((item) => clone(item));
  }

  if (table === "itens_op") {
    const op = db.ordens_producao.find((ordem) => ordem.id === row.op_id);
    if (op) {
      const orcamento = db.orcamentos.find((orc) => orc.id === op.orcamento_id);
      enriched.ordens_producao = {
        ...clone(op),
        orcamentos: orcamento ? enrichRow("orcamentos", orcamento, db) : null,
      };
    } else {
      enriched.ordens_producao = null;
    }
    enriched.subitens_op = db.subitens_op.filter((subitem) => subitem.item_op_id === row.id);
  }

  if (table === "materiais_op") {
    const op = db.ordens_producao.find((ordem) => ordem.id === row.op_id);
    if (op) {
      const orcamento = db.orcamentos.find((orc) => orc.id === op.orcamento_id);
      enriched.ordens_producao = {
        ...clone(op),
        orcamentos: orcamento ? enrichRow("orcamentos", orcamento, db) : null,
      };
    } else {
      enriched.ordens_producao = null;
    }
  }

  return enriched;
}

class DemoQueryBuilder implements PromiseLike<any> {
  private filters: Array<(row: DemoRow) => boolean> = [];
  private orExpression: string | null = null;
  private sorters: Array<{ field: string; ascending: boolean }> = [];
  private rangeValue: [number, number] | null = null;
  private limitValue: number | null = null;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: any = null;
  private returnSingle = false;
  private returnMaybeSingle = false;
  private withCount = false;

  constructor(private table: DemoTable) {}

  select(_columns = "*", options?: { count?: string }) {
    this.withCount = options?.count === "exact";
    return this;
  }

  insert(values: any) {
    this.operation = "insert";
    this.payload = values;
    return this;
  }

  update(values: any) {
    this.operation = "update";
    this.payload = values;
    return this;
  }

  delete(_options?: any) {
    this.operation = "delete";
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((row) => String(row[field]) === String(value));
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push((row) => String(row[field]) !== String(value));
    return this;
  }

  in(field: string, values: any[]) {
    const set = new Set(values.map((value) => String(value)));
    this.filters.push((row) => set.has(String(row[field])));
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push((row) => String(row[field]) >= String(value));
    return this;
  }

  lte(field: string, value: any) {
    this.filters.push((row) => String(row[field]) <= String(value));
    return this;
  }

  lt(field: string, value: any) {
    this.filters.push((row) => String(row[field]) < String(value));
    return this;
  }

  is(field: string, value: any) {
    this.filters.push((row) => row[field] === value);
    return this;
  }

  or(expression: string) {
    this.orExpression = expression;
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.sorters.push({ field, ascending: options?.ascending !== false });
    return this;
  }

  range(from: number, to: number) {
    this.rangeValue = [from, to];
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.returnSingle = true;
    return this;
  }

  maybeSingle() {
    this.returnMaybeSingle = true;
    return this;
  }

  private applyFilters(rows: DemoRow[]) {
    let filtered = rows.filter((row) => this.filters.every((filter) => filter(row)));
    if (this.orExpression) filtered = filtered.filter((row) => matchesOr(row, this.orExpression!));
    return filtered;
  }

  private applySortingAndWindow(rows: DemoRow[]) {
    let result = [...rows];
    [...this.sorters].reverse().forEach((sorter) => {
      result.sort((a, b) => {
        const left = a[sorter.field] ?? "";
        const right = b[sorter.field] ?? "";
        if (left === right) return 0;
        const direction = left > right ? 1 : -1;
        return sorter.ascending ? direction : -direction;
      });
    });
    if (this.rangeValue) result = result.slice(this.rangeValue[0], this.rangeValue[1] + 1);
    if (this.limitValue !== null) result = result.slice(0, this.limitValue);
    return result;
  }

  private async execute() {
    const db = loadDb();
    const tableRows = db[this.table] ?? [];
    let affectedRows: DemoRow[] = [];
    let count: number | null = null;

    if (this.operation === "insert") {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      affectedRows = rows.map((row) => applyDefaults(this.table, row, db));
      db[this.table] = [...tableRows, ...affectedRows];
      saveDb(db);
    } else if (this.operation === "update") {
      const selected = this.applyFilters(tableRows);
      const selectedIds = new Set(selected.map((row) => row.id));
      db[this.table] = tableRows.map((row) => (selectedIds.has(row.id) ? { ...row, ...this.payload, updated_at: now() } : row));
      affectedRows = db[this.table].filter((row) => selectedIds.has(row.id));
      saveDb(db);
    } else if (this.operation === "delete") {
      const selected = this.applyFilters(tableRows);
      const selectedIds = new Set(selected.map((row) => row.id));
      db[this.table] = tableRows.filter((row) => !selectedIds.has(row.id));
      affectedRows = selected;
      count = selected.length;
      saveDb(db);
    } else {
      affectedRows = this.applyFilters(tableRows);
      count = affectedRows.length;
    }

    let data: any = this.applySortingAndWindow(affectedRows).map((row) => enrichRow(this.table, row, db));

    if (this.returnSingle || this.returnMaybeSingle) {
      data = data[0] ?? null;
      if (this.returnSingle && !data) {
        return { data: null, error: { message: "Registro nao encontrado." }, count: this.withCount ? count : null };
      }
    }

    return { data, error: null, count: this.withCount ? count : null };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const db = loadDb();
      const normalizedEmail = email.trim().toLowerCase();
      const authUser = db.demo_auth_users.find(
        (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
      );
      const profile = authUser ? db.perfis_usuarios.find((item) => item.user_id === authUser.id) : null;

      if (!authUser || profile?.funcao === "desativado") {
        return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } };
      }
      const user = { id: authUser.id, email: authUser.email };
      const session = { access_token: `demo-token-${authUser.id}`, user };
      setStoredSession(session);
      return { data: { user, session }, error: null };
    },
    async getUser() {
      const session = getStoredSession();
      return { data: { user: session?.user ?? null }, error: null };
    },
    async getSession() {
      const session = getStoredSession();
      return { data: { session }, error: null };
    },
    async signOut() {
      clearStoredSession();
      return { error: null };
    },
    async updateUser(_values: any) {
      const session = getStoredSession();
      if (!session?.user) return { data: { user: null }, error: { message: "Sessao expirada." } };
      const db = loadDb();
      const authUser = db.demo_auth_users.find((user) => user.id === session.user.id);
      if (!authUser) return { data: { user: null }, error: { message: "Usuario nao encontrado." } };
      if (_values?.password) {
        authUser.password = _values.password;
        authUser.updated_at = now();
        saveDb(db);
      }
      return { data: { user: session.user }, error: null };
    },
    onAuthStateChange(_callback: any) {
      return { data: { subscription: { unsubscribe() {} } } };
    },
  },
  from(table: DemoTable) {
    return new DemoQueryBuilder(table);
  },
  storage: {
    from(_bucket: string) {
      return {
        async remove(_paths: string[]) {
          return { data: null, error: null };
        },
      };
    },
  },
  channel(_name: string) {
    return {
      on(..._args: any[]) {
        return this;
      },
      subscribe() {
        return this;
      },
    };
  },
  removeChannel(_channel: any) {},
};
