"use client";

import { useState } from "react";
import { startLocalDemoSession, supabase } from "./lib/supabase";
import { LOCAL_DEMO } from "./lib/demoMode";
import { useRouter } from "next/navigation";
import { ToastProvider, useToast } from "./components/Toast";

const DEMO_EMAIL = "admin@admin.com";
const DEMO_PASSWORD = "admin123";

// Componente interno que usa o hook useToast (precisa estar dentro do Provider)
function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const explorarDemo = () => {
    setLoading(true);
    try {
      startLocalDemoSession();
      router.push("/dashboard/");
    } catch {
      showToast("Permita o armazenamento local do navegador para explorar a demonstração.", "error");
      setLoading(false);
    }
  };

  // 🚀 FUNÇÃO PARA TRADUZIR OS ERROS DO SUPABASE
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

  const preencherCredenciaisDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showToast(traduzirErro(error.message), "error");
    } else if (data?.user) {
      // 🚀 Verifica se o usuário foi desativado
      const { data: perfil } = await supabase
        .from("perfis_usuarios")
        .select("funcao")
        .eq("user_id", data.user.id)
        .single();
        
      if (perfil && perfil.funcao === "desativado") {
        await supabase.auth.signOut();
        showToast("Seu acesso foi desativado pelo administrador.", "error");
      } else {
        showToast("Login realizado! Redirecionando...", "success");
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  if (LOCAL_DEMO) return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-5">
      <section className="max-w-xl w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white">OD</div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Projeto de Daniel Lima</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">OrçaDemo</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">Explore o gerador de orçamentos: cadastre clientes e produtos, monte propostas, gere PDFs e acompanhe o histórico, a produção e as compras.</p>
        <div className="my-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
          <strong>Demonstração com dados fictícios.</strong> As alterações ficam apenas neste navegador. Não é necessário informar e-mail ou senha. Os documentos gerados são exemplos sem valor comercial.
        </div>
        <button type="button" onClick={explorarDemo} disabled={loading} className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:opacity-60">
          {loading ? "Abrindo demonstração..." : "Explorar demonstração"}
        </button>
        <p className="mt-4 text-sm text-slate-500">Você pode restaurar os dados de exemplo a qualquer momento pelo menu.</p>
        <a href="/Portfolio/" className="mt-6 inline-block text-sm font-semibold text-blue-700 underline underline-offset-4">Voltar ao portfólio</a>
      </section>
    </main>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">

        {/* LOGO */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black mb-2 shadow-sm">OD</div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">OrçaDemo</h1>
          <p className="text-sm text-gray-500 mt-2">Acesse sua conta para continuar</p>
        </div>

        <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">Acesso de demonstração</p>
          <p className="mt-1 text-sm text-blue-800">
            Use <strong>{DEMO_EMAIL}</strong> com a senha <strong>{DEMO_PASSWORD}</strong>.
          </p>
          <button
            type="button"
            onClick={preencherCredenciaisDemo}
            className="mt-3 text-sm font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
          >
            Preencher credenciais da demo
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Carregando..." : "Entrar"}
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
