"use client";

import { useState, useEffect } from "react";
import { createDemoUser, deleteDemoUser, resetDemoUserPassword, supabase } from "../../lib/supabase";
import { usePerfilUsuario } from "../../hooks/usePerfilUsuario";
import { useRouter } from "next/navigation";
import { useAlert, AlertModal, useConfirm, ConfirmModal } from "../../components/AlertModal";

interface PerfilUsuario {
  id: string;
  user_id: string;
  email: string;
  funcao: string;
  setor: string | null;
  created_at: string;
}

interface VendedorTransferencia {
  id: string;
  nome: string;
  email: string | null;
  user_id: string;
}

interface OrcamentoTransferencia {
  id: string;
  numero_orcamento: number;
  data_emissao: string;
  valor_total: number;
  status: string;
  user_id: string;
  vendedor_id: string | null;
  clientes: { nome_razao_social: string } | { nome_razao_social: string }[] | null;
  vendedores: { nome: string } | { nome: string }[] | null;
}

const SETORES = [
  { value: "metalurgia", label: "Metalurgia" },
  { value: "impressao", label: "Impressão" },
  { value: "plotagem", label: "Plotagem" },
  { value: "instalacao", label: "Instalação" },
  { value: "embalagem", label: "Embalagem" },
];

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor || 0);

const formatarData = (data: string) => new Intl.DateTimeFormat("pt-BR").format(new Date(`${data}T00:00:00`));

const getErrorMessage = (error: unknown, fallback = "Erro inesperado.") =>
  error instanceof Error ? error.message : fallback;

export default function UsuariosPage() {
  const { isAdmin, loadingPerfil } = usePerfilUsuario();
  const router = useRouter();
  const { showAlert, alertProps } = useAlert();
  const { showConfirm, confirmProps } = useConfirm();

  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroFuncao, setFiltroFuncao] = useState<"todos" | "admin" | "vendedor" | "operador" | "financeiro" | "compras">("todos");

  // Convite Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFuncao, setInviteFuncao] = useState<"admin" | "vendedor" | "operador" | "financeiro" | "compras">("vendedor");
  const [inviteSetor, setInviteSetor] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<{ email: string; password: string } | null>(null);
  const [resetSuccess, setResetSuccess] = useState<{ email: string; password: string } | null>(null);

  // Editar Usuario Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUsuario, setEditUsuario] = useState<PerfilUsuario | null>(null);
  const [editFuncao, setEditFuncao] = useState("");
  const [editSetor, setEditSetor] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Transferencia de orcamentos antigos
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [vendedoresTransferencia, setVendedoresTransferencia] = useState<VendedorTransferencia[]>([]);
  const [orcamentosTransferencia, setOrcamentosTransferencia] = useState<OrcamentoTransferencia[]>([]);
  const [orcamentosSelecionados, setOrcamentosSelecionados] = useState<string[]>([]);
  const [vendedorDestinoId, setVendedorDestinoId] = useState("");
  const [buscaTransferencia, setBuscaTransferencia] = useState("");
  const [carregandoTransferencia, setCarregandoTransferencia] = useState(false);
  const [transferindoOrcamentos, setTransferindoOrcamentos] = useState(false);

  useEffect(() => {
    if (!loadingPerfil) {
      if (!isAdmin) {
        router.push("/dashboard");
      } else {
        carregarUsuarios();
      }
    }
  }, [loadingPerfil, isAdmin, router]);

  const carregarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("perfis_usuarios")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setUsuarios(data as PerfilUsuario[]);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      showAlert("Erro ao buscar lista de usuários da equipe.", { type: "error", title: "Erro de Conexão" });
    } finally {
      setLoading(false);
    }
  };

  const carregarDadosTransferencia = async () => {
    setCarregandoTransferencia(true);
    try {
      const adminUserIds = usuarios.filter(u => u.funcao === "admin").map(u => u.user_id);

      const { data: vendedoresData, error: vendedoresError } = await supabase
        .from("vendedores")
        .select("id, nome, email, user_id")
        .order("nome", { ascending: true });

      if (vendedoresError) throw vendedoresError;
      setVendedoresTransferencia((vendedoresData || []) as VendedorTransferencia[]);

      if (adminUserIds.length === 0) {
        setOrcamentosTransferencia([]);
        return;
      }

      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from("orcamentos")
        .select(`
          id,
          numero_orcamento,
          data_emissao,
          valor_total,
          status,
          user_id,
          vendedor_id,
          clientes ( nome_razao_social ),
          vendedores ( nome )
        `)
        .in("user_id", adminUserIds)
        .order("numero_orcamento", { ascending: false });

      if (orcamentosError) throw orcamentosError;
      setOrcamentosTransferencia((orcamentosData || []) as unknown as OrcamentoTransferencia[]);
    } catch (error) {
      console.error("Erro ao carregar dados de transferencia:", error);
      showAlert("Erro ao carregar orçamentos antigos para transferência.", { type: "error", title: "Erro" });
    } finally {
      setCarregandoTransferencia(false);
    }
  };

  const abrirModalTransferencia = () => {
    setTransferModalOpen(true);
    setOrcamentosSelecionados([]);
    setVendedorDestinoId("");
    setBuscaTransferencia("");
    carregarDadosTransferencia();
  };

  const toggleOrcamentoTransferencia = (orcamentoId: string) => {
    setOrcamentosSelecionados(prev =>
      prev.includes(orcamentoId)
        ? prev.filter(id => id !== orcamentoId)
        : [...prev, orcamentoId]
    );
  };

  const transferirOrcamentosSelecionados = async () => {
    if (!vendedorDestinoId || orcamentosSelecionados.length === 0) {
      showAlert("Selecione o vendedor destino e ao menos um orçamento.", { type: "warning", title: "Seleção incompleta" });
      return;
    }

    const vendedorDestino = vendedoresTransferencia.find(v => v.id === vendedorDestinoId);
    const confirmado = await showConfirm(
      `Transferir ${orcamentosSelecionados.length} orçamento(s) para ${vendedorDestino?.nome || "o vendedor selecionado"}?`,
      { type: "warning", title: "Confirmar transferência", confirmLabel: "Transferir", cancelLabel: "Cancelar" }
    );
    if (!confirmado) return;

    setTransferindoOrcamentos(true);
    showAlert("Essa funcionalidade está disponível apenas em produção", { type: "info", title: "Modo demo" });
    setTransferindoOrcamentos(false);
    return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/transfer-orcamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ vendedorId: vendedorDestinoId, orcamentoIds: orcamentosSelecionados }),
      });

      const data = await res.json() as { error?: string; transferidos?: { id: string }[] };
      if (!res.ok) throw new Error(data.error || "Erro ao transferir orçamentos.");

      const transferidos = data.transferidos || [];
      const idsTransferidos = new Set(transferidos.map(o => o.id));
      setOrcamentosTransferencia(prev => prev.filter(o => !idsTransferidos.has(o.id)));
      setOrcamentosSelecionados([]);
      showAlert(`${transferidos.length} orçamento(s) transferido(s) com sucesso.`, { type: "success", title: "Transferência concluída" });
    } catch (error) {
      const message = getErrorMessage(error, "Erro ao transferir orcamentos.");
      showAlert(message, { type: "error", title: "Falha na transferência" });
    } finally {
      setTransferindoOrcamentos(false);
    }
  };

  const alterarFuncao = async (perfilId: string, novaFuncao: string) => {
    setMenuAbertoId(null);
    try {
      const { error } = await supabase
        .from("perfis_usuarios")
        .update({ funcao: novaFuncao })
        .eq("id", perfilId);

      if (error) throw error;

      setUsuarios(usuarios.map(u => u.id === perfilId ? { ...u, funcao: novaFuncao } : u));
      showAlert("Permissão atualizada com sucesso!", { type: "success", title: "Feito" });
    } catch (error) {
      console.error("Erro ao atualizar função:", error);
      showAlert("Erro ao atualizar a permissão do usuário.", { type: "error", title: "Falha" });
    }
  };

  const hardDeleteUsuario = async (userIdToDelete: string) => {
    setMenuAbertoId(null);
    
    const confirmado = await showConfirm(
      "ATENÇÃO: Deseja apagar este usuário permanentemente? ISSO EXCLUIRÁ TODOS OS PRODUTOS, IMAGENS E O ACESSO DELE. Esta ação não pode ser desfeita.",
      { type: "error", title: "Apagar Usuário", confirmLabel: "Sim, apagar", cancelLabel: "Cancelar" }
    );
    if (!confirmado) return;
    
    setLoading(true);
    try {
      deleteDemoUser(userIdToDelete);
      setUsuarios(usuarios.filter(u => u.id !== userIdToDelete && u.user_id !== userIdToDelete));
      showAlert("Usuario removido da demo com sucesso.", { type: "success", title: "Conta Apagada" });
      return;
      const { data: { session: _session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${_session?.access_token}`
        },
        body: JSON.stringify({ userIdToDelete })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao apagar conta.");
      
      // Remove do estado local usando tanto o id local do perfil quanto o user_id do auth
      setUsuarios(usuarios.filter(u => u.id !== userIdToDelete && u.user_id !== userIdToDelete));
      showAlert("Usuário apagado com sucesso e imagens deletadas do Cloudinary.", { type: "success", title: "Conta Apagada" });
    } catch (error) {
      console.error("Erro no hard delete:", error);
      showAlert(getErrorMessage(error), { type: "error", title: "Falha na Exclusão" });
    } finally {
      setLoading(false);
    }
  };

  const resetarSenha = async (userIdToReset: string, email: string) => {
    setMenuAbertoId(null);
    const confirmado = await showConfirm(
      `Tem certeza que deseja resetar a senha de ${email}? A senha antiga não funcionará mais.`,
      { type: "warning", title: "Resetar Senha", confirmLabel: "Sim, resetar", cancelLabel: "Cancelar" }
    );
    
    if (!confirmado) return;
    
    setLoading(true);
    try {
      const data = resetDemoUserPassword(userIdToReset);
      setResetSuccess({ email: data.email, password: data.password });
      return;
      const { data: { session: _sessionReset } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${_sessionReset?.access_token}`
        },
        body: JSON.stringify({ user_id: userIdToReset })
      });
      
      const dataReset = await res.json();
      if (!res.ok) throw new Error(dataReset.error);

      setResetSuccess({ email: dataReset.email, password: dataReset.newPassword });
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      showAlert(getErrorMessage(error), { type: "error", title: "Falha no Reset" });
    } finally {
      setLoading(false);
    }
  };

  const enviarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setInviteLoading(true);
    try {
      if (inviteFuncao === "operador" && !inviteSetor) throw new Error("Selecione o setor do operador.");
      const data = createDemoUser(inviteEmail, inviteFuncao, inviteSetor || null);
      setInviteSuccess({ email: data.email, password: data.password });
      carregarUsuarios();
      return;
      const { data: { session: _sessionInvite } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${_sessionInvite?.access_token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      
      const dataInvite = await res.json();
      
      if (!res.ok) throw new Error(dataInvite.error || "Erro desconhecido");
      
      setInviteSuccess({ email: dataInvite.email, password: dataInvite.temporaryPassword });
      carregarUsuarios(); // Atualiza a lista por baixo
    } catch (err) {
      showAlert(getErrorMessage(err), { type: "error", title: "Erro no Cadastro" });
    } finally {
      setInviteLoading(false);
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setInviteEmail("");
    setInviteFuncao("vendedor");
    setInviteSetor("");
    setInviteSuccess(null);
  };

  const fecharModalReset = () => {
    setResetSuccess(null);
  };

  const getEstatisticas = () => {
    const total = usuarios.length;
    const admins = usuarios.filter(u => u.funcao === "admin").length;
    const vendedores = usuarios.filter(u => u.funcao === "vendedor").length;
    const operadores = usuarios.filter(u => u.funcao === "operador").length;
    const financeiros = usuarios.filter(u => u.funcao === "financeiro").length;
    const compras = usuarios.filter(u => u.funcao === "compras").length;
    return { total, admins, vendedores, operadores, financeiros, compras };
  };

  const abrirEditModal = (usuario: PerfilUsuario) => {
    setEditUsuario(usuario);
    setEditFuncao(usuario.funcao);
    setEditSetor(usuario.setor || "");
    setEditModalOpen(true);
    setMenuAbertoId(null);
  };

  const salvarEdicao = async () => {
    if (!editUsuario) return;
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from("perfis_usuarios")
        .update({ funcao: editFuncao, setor: editSetor || null })
        .eq("id", editUsuario.id);
      if (error) throw error;
      setUsuarios(usuarios.map(u => u.id === editUsuario.id ? { ...u, funcao: editFuncao, setor: editSetor || null } : u));
      setEditModalOpen(false);
      showAlert("Usuário atualizado com sucesso!", { type: "success", title: "Feito" });
    } catch (err) {
      showAlert("Erro ao salvar: " + (err as Error).message, { type: "error", title: "Erro" });
    } finally {
      setEditLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchesBusca = u.email.toLowerCase().includes(busca.toLowerCase());
    const matchesFuncao = filtroFuncao === "todos" || u.funcao === filtroFuncao;
    return matchesBusca && matchesFuncao;
  });

  const getClienteTransferencia = (orcamento: OrcamentoTransferencia) => {
    if (Array.isArray(orcamento.clientes)) return orcamento.clientes[0]?.nome_razao_social || "Cliente nao informado";
    return orcamento.clientes?.nome_razao_social || "Cliente nao informado";
  };

  const getVendedorTransferencia = (orcamento: OrcamentoTransferencia) => {
    if (Array.isArray(orcamento.vendedores)) return orcamento.vendedores[0]?.nome || "Sem vendedor";
    return orcamento.vendedores?.nome || "Sem vendedor";
  };

  const orcamentosTransferenciaFiltrados = orcamentosTransferencia.filter(orc => {
    const termo = buscaTransferencia.trim().toLowerCase();
    if (!termo) return true;
    return String(orc.numero_orcamento).includes(termo)
      || getClienteTransferencia(orc).toLowerCase().includes(termo)
      || getVendedorTransferencia(orc).toLowerCase().includes(termo);
  });

  const { total, admins, vendedores, operadores, financeiros, compras } = getEstatisticas();

  if (loadingPerfil || loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto animate-pulse pb-20 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 mt-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 h-24 rounded-xl border border-gray-100"></div>
          <div className="bg-gray-100 h-24 rounded-xl border border-gray-100"></div>
          <div className="bg-gray-100 h-24 rounded-xl border border-gray-100"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-64"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24" onClick={() => menuAbertoId && setMenuAbertoId(null)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Equipe de Vendas</h1>
          <p className="text-gray-500 mt-1.5 text-sm md:text-base max-w-xl">
            Gerencie o acesso da sua equipe ao sistema. Novos membros sempre entram com permissão de Vendedor.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 font-bold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Novo Membro
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Total</p><p className="text-2xl font-bold text-gray-900">{total}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center text-purple-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Admins</p><p className="text-2xl font-bold text-gray-900">{admins}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Vendedores</p><p className="text-2xl font-bold text-gray-900">{vendedores}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 border-l-[4px] border-l-orange-500">
          <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center text-orange-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Operadores</p><p className="text-2xl font-bold text-gray-900">{operadores}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 border-l-[4px] border-l-emerald-500">
          <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Financeiro</p><p className="text-2xl font-bold text-gray-900">{financeiros}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 border-l-[4px] border-l-blue-500">
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Compras</p><p className="text-2xl font-bold text-gray-900">{compras}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"></path></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Transferir Orçamentos Antigos</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Reatribua orçamentos criados por contas admin para o vendedor correto, mantendo os itens vinculados ao novo titular.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={abrirModalTransferencia}
          className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors"
        >
          Abrir Transferência
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="Buscar por e-mail..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-shadow shadow-sm"
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl h-[46px] self-start md:self-auto overflow-x-auto w-full md:w-auto">
          <button onClick={() => setFiltroFuncao("todos")} className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${filtroFuncao === "todos" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Todos</button>
          <button onClick={() => setFiltroFuncao("admin")} className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${filtroFuncao === "admin" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Admins</button>
          <button onClick={() => setFiltroFuncao("vendedor")} className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${filtroFuncao === "vendedor" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Vendedores</button>
          <button onClick={() => setFiltroFuncao("operador")} className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${filtroFuncao === "operador" ? "bg-white text-orange-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Operadores</button>
          <button onClick={() => setFiltroFuncao("financeiro")} className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${filtroFuncao === "financeiro" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Financeiro</button>
          <button onClick={() => setFiltroFuncao("compras")} className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${filtroFuncao === "compras" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Compras</button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        {usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Nenhum membro encontrado</h3>
            <p className="text-gray-500 mt-1">Sua busca não retornou resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-gray-100">
            {usuariosFiltrados.map((usuario) => {
              const inicial = usuario.email ? usuario.email.charAt(0).toUpperCase() : "?";
              const isAdminRole = usuario.funcao === "admin";
              
              return (
                <div key={usuario.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  
                  {/* Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${isAdminRole ? "bg-purple-100 text-purple-700" : "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-800"}`}>
                      {inicial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{usuario.email}</p>
                      <p className="text-sm text-gray-500">
                        Entrou em {new Intl.DateTimeFormat('pt-BR').format(new Date(usuario.created_at))}
                      </p>
                    </div>
                  </div>

                  {/* Status & Ações */}
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        isAdminRole ? "bg-purple-50 text-purple-700 border-purple-200" :
                        usuario.funcao === "desativado" ? "bg-gray-100 text-gray-500 border-gray-300" :
                        usuario.funcao === "operador" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        usuario.funcao === "financeiro" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        usuario.funcao === "compras" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {isAdminRole ? "🛡️ Admin" : usuario.funcao === "desativado" ? "🚫 Desativado" : usuario.funcao === "operador" ? "🏭 Operador" : usuario.funcao === "financeiro" ? "💰 Financeiro" : usuario.funcao === "compras" ? "🛒 Compras" : "💼 Vendedor"}
                      </span>
                      {usuario.funcao === "operador" && usuario.setor && (
                        <span className="text-xs text-orange-600 font-medium capitalize">{usuario.setor}</span>
                      )}
                    </div>

                    <button
                      onClick={() => abrirEditModal(usuario)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                      title="Editar usuário"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>

                    {!isAdminRole && (
                      <button
                        onClick={() => resetarSenha(usuario.user_id, usuario.email)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none"
                        title="Redefinir senha"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                      </button>
                    )}

                    {!isAdminRole && (
                      <button
                        onClick={() => hardDeleteUsuario(usuario.user_id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                        title="Apagar usuário"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {transferModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Transferir Orçamentos Antigos</h3>
                <p className="text-sm text-gray-500 mt-1">Apenas orçamentos ainda vinculados a contas admin aparecem aqui.</p>
              </div>
              <button type="button" onClick={() => setTransferModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vendedor destino</label>
                  <select
                    value={vendedorDestinoId}
                    onChange={e => setVendedorDestinoId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all shadow-sm text-sm font-medium"
                  >
                    <option value="">Selecione um vendedor</option>
                    {vendedoresTransferencia.map(vendedor => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.nome}{vendedor.email ? ` - ${vendedor.email}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Buscar orçamento</label>
                  <input
                    type="text"
                    value={buscaTransferencia}
                    onChange={e => setBuscaTransferencia(e.target.value)}
                    placeholder="Número, cliente ou vendedor atual"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all shadow-sm text-sm font-medium"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setOrcamentosSelecionados(orcamentosTransferenciaFiltrados.map(orc => orc.id))}
                    disabled={orcamentosTransferenciaFiltrados.length === 0}
                    className="w-full md:w-auto px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50 text-sm"
                  >
                    Selecionar lista
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-900">{orcamentosSelecionados.length} selecionado(s)</span>
                <button
                  type="button"
                  onClick={() => setOrcamentosSelecionados([])}
                  className="text-blue-600 hover:text-blue-700 font-bold disabled:opacity-40"
                  disabled={orcamentosSelecionados.length === 0}
                >
                  Limpar seleção
                </button>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                {carregandoTransferencia ? (
                  <div className="p-10 text-center text-gray-500 font-medium">Carregando orçamentos...</div>
                ) : orcamentosTransferenciaFiltrados.length === 0 ? (
                  <div className="p-10 text-center">
                    <h4 className="font-bold text-gray-900">Nenhum orçamento antigo encontrado</h4>
                    <p className="text-sm text-gray-500 mt-1">A lista considera orçamentos cujo titular atual ainda é uma conta admin.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
                    {orcamentosTransferenciaFiltrados.map(orcamento => {
                      const selecionado = orcamentosSelecionados.includes(orcamento.id);
                      return (
                        <button
                          key={orcamento.id}
                          type="button"
                          onClick={() => toggleOrcamentoTransferencia(orcamento.id)}
                          className={`w-full text-left p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between transition-colors ${selecionado ? "bg-blue-50" : "bg-white hover:bg-gray-50"}`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selecionado ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                              {selecionado && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate">#{String(orcamento.numero_orcamento).padStart(5, "0")} - {getClienteTransferencia(orcamento)}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Atual: {getVendedorTransferencia(orcamento)} | {formatarData(orcamento.data_emissao)} | {orcamento.status}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-green-600 shrink-0">{formatarMoeda(Number(orcamento.valor_total || 0))}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-end gap-3">
              <button type="button" onClick={() => setTransferModalOpen(false)} className="px-5 py-2.5 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors">
                Cancelar
              </button>
              <button
                type="button"
                onClick={transferirOrcamentosSelecionados}
                disabled={transferindoOrcamentos || orcamentosSelecionados.length === 0 || !vendedorDestinoId}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {transferindoOrcamentos ? "Transferindo..." : "Transferir Orçamentos"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Convite Interno */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 transition-transform">
            
            {inviteSuccess ? (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Conta Criada!</h3>
                  <p className="text-sm text-gray-500 mb-6">Envie as credenciais abaixo para o vendedor via WhatsApp ou mensagem.</p>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left space-y-3 relative mt-4">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`*Acesso ao Sistema*\nLogin: ${inviteSuccess.email}\nSenha: ${inviteSuccess.password}`);
                        showAlert("Credenciais copiadas com sucesso!", { type: "success", title: "Copiado" });
                      }}
                      className="absolute top-4 right-4 p-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-all shadow-sm flex items-center gap-1.5 group"
                      title="Copiar credenciais"
                      type="button"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      <span className="text-xs font-bold">Copiar</span>
                    </button>
                    
                    <div className="pr-24">
                      <span className="text-xs text-gray-500 uppercase font-bold">Email (Login):</span>
                      <p className="font-medium text-gray-900 truncate">{inviteSuccess.email}</p>
                    </div>
                    <div className="pr-24">
                      <span className="text-xs text-gray-500 uppercase font-bold">Senha Provisória:</span>
                      <p className="font-mono text-lg font-bold text-blue-600 truncate tracking-wider">{inviteSuccess.password}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex gap-2 text-left">
                  <svg className="shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Acesso liberado imediatamente. O vendedor pode alterar a senha logando e acessando Segurança na barra lateral.
                </div>
                <button 
                  onClick={fecharModal}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={enviarConvite}>
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Novo Membro</h3>
                  <button type="button" onClick={fecharModal} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">E-mail de Acesso</label>
                    <input 
                      type="email" 
                      required
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all shadow-sm"
                      placeholder="vendedor@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de conta</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["admin", "vendedor", "operador", "financeiro", "compras"].map(funcao => (
                        <button
                          key={funcao}
                          type="button"
                          onClick={() => {
                            setInviteFuncao(funcao as typeof inviteFuncao);
                            if (funcao !== "operador") setInviteSetor("");
                          }}
                          className={`py-2.5 px-3 rounded-xl text-sm font-bold capitalize border-2 transition-all ${
                            inviteFuncao === funcao
                              ? funcao === "admin" ? "bg-purple-100 border-purple-300 text-purple-700"
                              : funcao === "operador" ? "bg-orange-100 border-orange-300 text-orange-700"
                              : funcao === "financeiro" ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {funcao}
                        </button>
                      ))}
                    </div>
                  </div>

                  {inviteFuncao === "operador" && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Setor do operador</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SETORES.map(setor => (
                          <button
                            key={setor.value}
                            type="button"
                            onClick={() => setInviteSetor(setor.value)}
                            className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                              inviteSetor === setor.value
                                ? "bg-orange-100 border-orange-300 text-orange-700"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {setor.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg flex items-start gap-2 border border-yellow-200">
                    <svg className="shrink-0 w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    A conta será criada silenciosamente agora. As credenciais (E-mail e Senha) aparecerão na tela seguinte para você repassar ao funcionário.
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                  <button type="button" onClick={fecharModal} className="px-5 py-2.5 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={inviteLoading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-px transition-all disabled:opacity-50 disabled:hover:translate-y-0 text-sm">
                    {inviteLoading ? "Gerando Credenciais..." : "Continuar"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Modal Sucesso Reset de Senha */}
      {resetSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 transition-transform">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Senha Resetada!</h3>
                <p className="text-sm text-gray-500 mb-6">Envie esta nova senha temporária para o vendedor e oriente-o a trocá-la assim que acessar o sistema.</p>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left space-y-3 relative mt-4">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`*Sua Nova Senha*\nLogin: ${resetSuccess.email}\nSenha: ${resetSuccess.password}`);
                      showAlert("Nova senha copiada com sucesso!", { type: "success", title: "Copiado" });
                    }}
                    className="absolute top-4 right-4 p-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-all shadow-sm flex items-center gap-1.5 group"
                    title="Copiar credenciais"
                    type="button"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Login</label>
                    <p className="font-medium text-gray-900 truncate pr-10">{resetSuccess.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nova Senha Temporária</label>
                    <p className="font-mono text-lg font-bold text-blue-600 tracking-wider bg-blue-50/50 py-1 px-2 rounded -ml-2 inline-block">
                      {resetSuccess.password}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={fecharModalReset}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {editModalOpen && editUsuario && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Editar Usuário</h3>
              <button type="button" onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail</label>
                <p className="text-gray-900 font-medium truncate">{editUsuario.email}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Função</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["admin", "vendedor", "operador", "financeiro", "compras"].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setEditFuncao(f)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-bold capitalize border-2 transition-all ${
                        editFuncao === f
                          ? f === "admin" ? "bg-purple-100 border-purple-300 text-purple-700"
                          : f === "operador" ? "bg-orange-100 border-orange-300 text-orange-700"
                          : f === "financeiro" ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                          : "bg-blue-100 border-blue-300 text-blue-700"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {f === "admin" ? "🛡️" : f === "operador" ? "🏭" : f === "financeiro" ? "💰" : f === "compras" ? "🛒" : "💼"} {f}
                    </button>
                  ))}
                </div>
              </div>

              {editFuncao === "operador" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Setor de Trabalho</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SETORES.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setEditSetor(s.value)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium capitalize border-2 transition-all ${
                          editSetor === s.value
                            ? "bg-orange-100 border-orange-300 text-orange-700"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editFuncao !== "operador" && editUsuario.funcao === "operador" && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg">
                  ⚠️ Ao remover a função Operador, o setor definido será limpo.
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setEditModalOpen(false)} className="px-5 py-2.5 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors">
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarEdicao}
                disabled={editLoading || (editFuncao === "operador" && !editSetor)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-px transition-all disabled:opacity-50"
              >
                {editLoading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal {...alertProps} />
      <ConfirmModal {...confirmProps} />
    </div>
  );
}
