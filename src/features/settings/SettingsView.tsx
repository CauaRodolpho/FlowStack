"use client";

import {
  AlertTriangle,
  Bell,
  Download,
  Moon,
  RotateCcw,
  Sun,
  Upload,
  UserRound,
} from "lucide-react";

import { PageHead } from "@/src/components/summary";
import type { Role } from "@/src/types/domain";
export function SettingsView({
  role,
  displayName,
  onDisplayName,
  lightTheme,
  onTheme,
  notificationsEnabled,
  onNotifications,
  onExport,
  onImport,
  onReset,
}: {
  role: Role;
  displayName: string;
  onDisplayName: (name: string) => void;
  lightTheme: boolean;
  onTheme: () => void;
  notificationsEnabled: boolean;
  onNotifications: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}) {
  return (
    <div className="section-view settings-view">
      <PageHead
        eyebrow="PREFERÊNCIAS LOCAIS"
        title="Configurações"
        description="Personalize a experiência e gerencie os dados desta demonstração."
      />
      <div className="settings-grid">
        <article>
          <div>
            <UserRound />
            <span>
              <strong>Perfil demonstrativo</strong>
              <p>Defina o nome exibido neste acesso.</p>
            </span>
          </div>
          <label className="setting-field">
            <span className="sr-only">Nome de exibição</span>
            <input
              value={displayName}
              maxLength={40}
              onChange={(event) => onDisplayName(event.target.value)}
              onBlur={() => {
                if (!displayName.trim()) onDisplayName("Usuário FlowTask");
              }}
            />
          </label>
        </article>
        <article>
          <div>
            <Sun />
            <span>
              <strong>Aparência</strong>
              <p>Escolha como o FlowTask aparece neste navegador.</p>
            </span>
          </div>
          <button onClick={onTheme}>
            {lightTheme ? <Moon size={17} /> : <Sun size={17} />} Usar tema{" "}
            {lightTheme ? "escuro" : "claro"}
          </button>
        </article>
        <article>
          <div>
            <Bell />
            <span>
              <strong>Notificações do cargo</strong>
              <p>
                Receba novos avisos deste cargo. Pausar preserva o histórico.
              </p>
            </span>
          </div>
          <button
            className={`preference-toggle ${notificationsEnabled ? "preference-on" : ""}`}
            role="switch"
            aria-checked={notificationsEnabled}
            onClick={onNotifications}
          >
            <span /> {notificationsEnabled ? "Ativadas" : "Pausadas"}
          </button>
        </article>
        {role !== "junior" && (
          <article>
            <div>
              <Download />
              <span>
                <strong>Dados do projeto</strong>
                <p>Salve um backup JSON de projetos, tarefas e equipe.</p>
              </span>
            </div>
            <div className="setting-actions">
              <button onClick={onExport}>
                <Download size={16} /> Exportar
              </button>
              {role === "admin" && (
                <button onClick={onImport}>
                  <Upload size={16} /> Importar
                </button>
              )}
            </div>
          </article>
        )}
        {role === "admin" && (
          <article className="danger-setting">
            <div>
              <RotateCcw />
              <span>
                <strong>Restaurar demonstração</strong>
                <p>Volte aos dados iniciais do projeto.</p>
              </span>
            </div>
            <button onClick={onReset}>
              <RotateCcw size={16} /> Restaurar dados
            </button>
          </article>
        )}
      </div>
      <div className="data-disclosure">
        <AlertTriangle size={17} />
        <div>
          <strong>Sobre os dados</strong>
          <p>
            Esta versão não possui contas nem banco de dados. Todas as
            alterações são salvas localmente no seu navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
