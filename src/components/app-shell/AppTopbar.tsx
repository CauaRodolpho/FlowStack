import { Bell, ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";
import type { RefObject } from "react";

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppTopbar({
  mobileSearchOpen,
  searchRef,
  query,
  roleLabel,
  lightTheme,
  unreadCount,
  displayName,
  onOpenMenu,
  onOpenSearch,
  onSearch,
  onCloseSearch,
  onToggleTheme,
  onOpenNotifications,
  onOpenProfile,
}: {
  mobileSearchOpen: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  query: string;
  roleLabel: string;
  lightTheme: boolean;
  unreadCount: number;
  displayName: string;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onSearch: (query: string) => void;
  onCloseSearch: () => void;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <header className={`topbar ${mobileSearchOpen ? "mobile-searching" : ""}`}>
      <button
        className="menu-button"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
      >
        <Menu size={21} />
      </button>
      <button
        className="mobile-search-toggle"
        onClick={onOpenSearch}
        aria-label="Abrir busca de tarefas"
      >
        <Search size={19} />
      </button>
      <label
        className={`search ${mobileSearchOpen ? "search-mobile-open" : ""}`}
      >
        <Search size={18} aria-hidden="true" />
        <input
          ref={searchRef}
          aria-label="Buscar tarefas no projeto selecionado"
          value={query}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar tarefa no projeto atual..."
        />
        {query || mobileSearchOpen ? (
          <button
            type="button"
            className="search-clear"
            onClick={onCloseSearch}
            aria-label="Limpar e fechar busca"
          >
            <X size={16} />
          </button>
        ) : (
          <kbd>Ctrl K</kbd>
        )}
      </label>
      <div className="user-actions">
        <span className="role-chip">{roleLabel}</span>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={lightTheme ? "Ativar tema escuro" : "Ativar tema claro"}
        >
          {lightTheme ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          className="bell"
          aria-label="Notificações"
          onClick={onOpenNotifications}
        >
          <Bell size={19} />
          {unreadCount > 0 && <span>{unreadCount}</span>}
        </button>
        <button
          className="profile-button"
          onClick={onOpenProfile}
          aria-label={`Abrir perfil de ${displayName}`}
        >
          <span className="avatar avatar-purple">{initials(displayName)}</span>
          <strong>{displayName.split(" ")[0]}</strong>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
