"use client";

import { useState } from "react";
import { supabase } from "./lib/supabase";
import { useRouter } from "next/navigation";
import { ToastProvider, useToast } from "./components/Toast";

type DemoProfile = {
  id: string;
  label: string;
  description: string;
  email: string;
  password: string;
  icon: string;
};

const DEMO_PROFILES: DemoProfile[] = [
  {
    id: "admin",
    label: "Administrador",
    description: "Acesso completo ao sistema, equipe, produção e compras.",
    email: "admin@admin.com",
    password: "admin123",
    icon: "👑",
  },
  {
    id: "vendedor",
    label: "Vendedor",
    description: "Clientes, produtos, criação e acompanhamento de orçamentos.",
    email: "julia@demo.com",
    password: "demo1234",
    icon: "💼",
  },
  {
    id: "operador",
    label: "Operador",
    description: "Fluxo do setor de produção e atualização dos itens da OP.",
    email: "operador@demo.com",
    password: "demo1234",
    icon: "⚙️",
  },
  {
    id: "compras",
    label: "Compras",
    description: "Central de materiais e acompanhamento das necessidades de compra.",
    email: "compras@demo.com",
    password: "demo1234",
    icon: "🛒",
  },
];

const FUNCAO_LABELS: Record<string, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
  operador: "Operador",
  compras: "Compras",
  financeiro: "Financeiro",
};

// Componente interno que usa o hook useToast (precisa estar dentro do Provider)
function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const traduzirErro = (mensagem: string) => {
    if (mensagem.includes("Invalid login credentials")) {
      return "E-mail ou senha incorretos.";
    }
    if (mensagem.includes("Password should be at least 6 characters")) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    if (mensagem.includes("User already registered")) {
      return "Este e-mail já está cadastrado.";
    }
    return "Ocorreu um erro inesperado. Tente novamente.";
  };

  const autenticar = async (
    emailLogin: string,
    passwordLogin: string,
    actionId: string
  ) => {
    setLoadingAction(actionId);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailLogin,
        password: passwordLogin,
      });

      if (error) {
        showToast(traduzirErro(error.message), "error");
        return;
      }

      if (!data?.user) {
        showToast("Não foi possível iniciar a sessão.", "error");
        return;
      }

      const { data: perfil } = await supabase
        .from("perfis_usuarios")
        .select("funcao")
        .eq("user_id", data.user.id)
        .single();

      if (perfil?.funcao === "desativado") {
        await supabase.auth.signOut();
        showToast("Seu acesso foi desativado pelo administrador.", "error");
        return;
      }

      const funcao = perfil?.funcao?.trim().toLowerCase() || "vendedor";
      const destino =
        funcao === "operador"
          ? "/dashboard/setor"
          : funcao === "compras"
            ? "/dashboard/compras"
            : "/dashboard";

      showToast(
        `Entrando como ${FUNCAO_LABELS[funcao] || "usuário"}...`,
        "success"
      );
      router.push(destino);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await autenticar(email, password, "manual");
  };

  const handleQuickLogin = async (perfil: DemoProfile) => {
    setEmail(perfil.email);
    setPassword(perfil.password);
    await autenticar(perfil.email, perfil.password, perfil.id);
  };

  const isLoading = loadingAction !== null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-10">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
        {/* LOGO */}
        <div className="text-center mb-7 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo_Sane_512x512.png"
            alt="SANE Sistemas"
            className="h-16 w-auto object-contain mb-2"
          />
          <h1 className="text-xl font-bold text-gray-900 mt-2">
            Explore a versão demonstrativa
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-lg">
            Escolha um perfil para conhecer as diferentes permissões e fluxos do sistema.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {DEMO_PROFILES.map((perfil) => {
            const carregandoPerfil = loadingAction === perfil.id;

            return (
              <button
                key={perfil.id}
                type="button"
                onClick={() => handleQuickLogin(perfil)}
                disabled={isLoading}
                className="group text-left rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Entrar como ${perfil.label}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl group-hover:bg-white">
                    {perfil.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900">{perfil.label}</p>
                      <span className="text-xs font-semibold text-blue-600">
                        {carregandoPerfil ? "Entrando..." : "Acessar →"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      {perfil.description}
                    </p>
                    <p className="mt-2 truncate text-xs text-gray-400">
                      {perfil.email}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Os dados desta demo ficam salvos apenas neste navegador. Você pode restaurar a base inicial a qualquer momento pelo menu lateral.
        </div>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            ou entre manualmente
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5 max-w-md mx-auto">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-50"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 disabled:bg-gray-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {loadingAction === "manual" ? "Carregando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Exporta o page com o ToastProvider local (não afeta o layout do dashboard)
export default function Login() {
  return (
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  );
}
