import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";

export const workspaceNavigation = [
  [LayoutDashboard, "Visão geral"],
  [FolderKanban, "Meus projetos"],
  [ListTodo, "Tarefas"],
  [Users, "Equipe"],
  [Activity, "Relatórios"],
] as const;

export type WorkspaceSection =
  (typeof workspaceNavigation)[number][1] | "Configurações";

export function AppSidebar({
  activeSection,
  mobileOpen,
  onNavigate,
  onClose,
  onLogout,
}: {
  activeSection: WorkspaceSection;
  mobileOpen: boolean;
  onNavigate: (section: WorkspaceSection) => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <strong>FlowTask</strong>
        </div>
        <button
          className="close-menu"
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
        <nav aria-label="Navegação principal">
          {workspaceNavigation.map(([Icon, label]) => (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              className={activeSection === label ? "nav-active" : ""}
              aria-current={activeSection === label ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button
          className={`settings ${activeSection === "Configurações" ? "settings-active" : ""}`}
          onClick={() => onNavigate("Configurações")}
          aria-current={activeSection === "Configurações" ? "page" : undefined}
        >
          <Settings size={19} /> Configurações
        </button>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={18} /> Sair da demonstração
        </button>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Fechar menu lateral"
        />
      )}
    </>
  );
}
