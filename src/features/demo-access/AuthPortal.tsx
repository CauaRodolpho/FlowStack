"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { usePageMotion } from "@/src/hooks/usePageMotion";
import { writeStored } from "@/src/lib/storage";
import type { Role } from "@/src/types/domain";
export function AuthPortal({
  onAuth,
  lightTheme,
  onTheme,
}: {
  onAuth: (role: Role, name: string) => void;
  lightTheme: boolean;
  onTheme: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const motionRef = usePageMotion(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accessAlert, setAccessAlert] = useState(false);
  const [highlightDemos, setHighlightDemos] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    if (mode === "register") {
      if (!name.trim()) return toast.error("Informe seu nome.");
      if (password.length < 6)
        return toast.error("Use uma senha com pelo menos 6 caracteres.");
      if (password !== confirm) return toast.error("As senhas não coincidem.");
      writeStored("flowtask-demo-account", { name: name.trim() });
      toast.success("Conta demonstrativa criada neste navegador.");
      onAuth("junior", name.trim());
      return;
    }
    setAccessAlert(true);
  }

  const demos: { role: Role; name: string; label: string; access: string }[] = [
    {
      role: "junior",
      name: "Cauã Júnior",
      label: "Júnior",
      access: "Executa suas tarefas",
    },
    {
      role: "lead",
      name: "Mariana Tech Lead",
      label: "Tech Lead",
      access: "Cria e supervisiona",
    },
    {
      role: "admin",
      name: "Rafael Admin",
      label: "Administrador",
      access: "Acesso completo",
    },
  ];
  return (
    <main
      ref={motionRef}
      className={`auth-portal ${lightTheme ? "auth-light" : ""}`}
    >
      <button
        className="auth-theme-toggle"
        onClick={onTheme}
        aria-label={lightTheme ? "Ativar tema escuro" : "Ativar tema claro"}
      >
        {lightTheme ? <Moon size={18} /> : <Sun size={18} />}
        <span>{lightTheme ? "Escuro" : "Claro"}</span>
      </button>
      <div className="auth-glow" />
      <div className="circuit circuit-left">
        <i />
        <i />
        <i />
      </div>
      <div className="circuit circuit-right">
        <i />
        <i />
        <i />
      </div>
      <div aria-hidden="true" className="dashboard-ghost ghost-left">
        <span>PROGRESSO</span>
        <strong>82%</strong>
        <i />
        <i />
        <i />
      </div>
      <div className="dashboard-ghost ghost-right">
        <span>PRODUÇÃO</span>
        <div>
          {[38, 67, 48, 83, 61].map((n) => (
            <i key={n} style={{ height: `${n}%` }} />
          ))}
        </div>
      </div>
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">
            <span />
            <span />
          </span>
          <div>
            <strong>FlowTask</strong>
            <small>PROJECT INTELLIGENCE</small>
          </div>
        </div>
        <div className="auth-heading">
          <p>{mode === "login" ? "BEM-VINDO DE VOLTA" : "NOVO ACESSO"}</p>
          <h1>
            {mode === "login" ? "Acesse seu workspace" : "Crie sua conta"}
          </h1>
          <span>
            {mode === "login"
              ? "Entre para continuar gerenciando seus projetos."
              : "Comece com um perfil Júnior demonstrativo."}
          </span>
        </div>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              <UserRound size={16} />
              <input
                aria-label="Nome completo"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
            </label>
          )}
          <label>
            <Mail size={16} />
            <input
              aria-label="E-mail"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </label>
          <label>
            <LockKeyhole size={16} />
            <input
              aria-label="Senha"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>
          {mode === "register" && (
            <label>
              <ShieldCheck size={16} />
              <input
                aria-label="Confirmar senha"
                autoComplete="new-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirmar senha"
              />
            </label>
          )}
          <button className="auth-submit" type="submit">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <div className="auth-switch">
          {mode === "login" ? "Ainda não tem conta?" : "Já possui uma conta?"}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Cadastre-se" : "Fazer login"}
          </button>
        </div>
        <div className="demo-access">
          <span>ACESSOS DEMONSTRATIVOS</span>
        </div>
        <div
          ref={demoRef}
          className={`demo-roles ${highlightDemos ? "demo-roles-highlight" : ""}`}
        >
          {demos.map((demo) => (
            <button
              key={demo.role}
              onClick={() => onAuth(demo.role, demo.name)}
            >
              <b>{demo.label}</b>
              <small>{demo.access}</small>
            </button>
          ))}
        </div>
        <p className="auth-disclaimer">
          Demonstração Front-End: contas e permissões são simuladas e os dados
          ficam apenas neste navegador.
        </p>
      </section>
      <Dialog open={accessAlert} onOpenChange={setAccessAlert}>
        <DialogContent className="demo-alert">
          <DialogHeader>
            <DialogTitle>Use um acesso demonstrativo</DialogTitle>
          </DialogHeader>
          <div className="demo-alert-body">
            <span>
              <ShieldCheck size={21} />
            </span>
            <p>
              Este projeto ainda não possui autenticação com backend. Para
              explorar as permissões e funcionalidades, escolha uma das contas
              demonstrativas disponíveis.
            </p>
          </div>
          <div className="demo-alert-actions">
            <Button variant="outline" onClick={() => setAccessAlert(false)}>
              Entendi
            </Button>
            <Button
              onClick={() => {
                setAccessAlert(false);
                setHighlightDemos(true);
                setTimeout(() => setHighlightDemos(false), 1800);
                requestAnimationFrame(() =>
                  demoRef.current?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                    block: "center",
                  }),
                );
              }}
            >
              Ver contas demonstrativas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
