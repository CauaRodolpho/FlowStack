import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { initials } from "@/src/components/app-shell/AppTopbar";
import type {
  AppNotification,
  Priority,
  Role,
  Task,
  TeamMemberData,
} from "@/src/types/domain";
import { Bell, Pause, Play, Plus, RotateCcw, ShieldCheck } from "lucide-react";

export function CreateTaskDialog({
  open,
  onOpenChange,
  title,
  description,
  priority,
  owner,
  due,
  members,
  onTitle,
  onDescription,
  onPriority,
  onOwner,
  onDue,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  priority: Priority;
  owner: string;
  due: string;
  members: TeamMemberData[];
  onTitle: (value: string) => void;
  onDescription: (value: string) => void;
  onPriority: (value: Priority) => void;
  onOwner: (value: string) => void;
  onDue: (value: string) => void;
  onCreate: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="new-task" aria-label="Criar nova tarefa">
          <Plus size={17} /> Nova tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#111827] text-white">
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
        </DialogHeader>
        <div className="dialog-form">
          <label htmlFor="task-title">Título da tarefa</label>
          <Input
            id="task-title"
            value={title}
            onChange={(event) => onTitle(event.target.value)}
            placeholder="Ex.: Criar página de contato"
          />
          <label>
            Descrição
            <textarea
              value={description}
              onChange={(event) => onDescription(event.target.value)}
              placeholder="Objetivo e contexto da tarefa"
            />
          </label>
          <div className="detail-grid">
            <label>
              Prioridade
              <select
                value={priority}
                onChange={(event) => onPriority(event.target.value as Priority)}
              >
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </label>
            <label>
              Responsável
              <select
                value={owner}
                onChange={(event) => onOwner(event.target.value)}
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Prazo
            <Input
              type="date"
              value={due}
              onChange={(event) => onDue(event.target.value)}
            />
          </label>
          <Button onClick={onCreate}>Adicionar ao quadro</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  name,
  description,
  owner,
  priority,
  due,
  members,
  onName,
  onDescription,
  onOwner,
  onPriority,
  onDue,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  owner: string;
  priority: Priority;
  due: string;
  members: TeamMemberData[];
  onName: (value: string) => void;
  onDescription: (value: string) => void;
  onOwner: (value: string) => void;
  onPriority: (value: Priority) => void;
  onDue: (value: string) => void;
  onCreate: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#111827] text-white">
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
        </DialogHeader>
        <div className="dialog-form">
          <label>
            Nome do projeto
            <Input
              value={name}
              onChange={(event) => onName(event.target.value)}
              placeholder="Ex.: Aplicativo financeiro"
            />
          </label>
          <label>
            Descrição
            <textarea
              value={description}
              onChange={(event) => onDescription(event.target.value)}
              placeholder="Objetivo principal do projeto"
            />
          </label>
          <div className="detail-grid">
            <label>
              Responsável
              <select
                value={owner}
                onChange={(event) => onOwner(event.target.value)}
              >
                {members
                  .filter((member) => member.level !== "junior")
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Prioridade
              <select
                value={priority}
                onChange={(event) => onPriority(event.target.value as Priority)}
              >
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </label>
          </div>
          <label>
            Prazo
            <Input
              type="date"
              value={due}
              onChange={(event) => onDue(event.target.value)}
            />
          </label>
          <Button onClick={onCreate}>Criar projeto</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FocusDialog({
  task,
  seconds,
  running,
  onOpenChange,
  onToggle,
  onReset,
}: {
  task: Task | null;
  seconds: number;
  running: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: () => void;
  onReset: () => void;
}) {
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent className="focus-dialog border-white/10 bg-[#0d1523] text-white">
        <DialogHeader>
          <DialogTitle>Modo Foco</DialogTitle>
        </DialogHeader>
        {task && (
          <div className="focus-content">
            <p>{task.title}</p>
            <div
              className="focus-clock"
              role="timer"
              aria-label={`Tempo restante: ${time}`}
            >
              {time}
            </div>
            <div className="focus-controls">
              <Button disabled={seconds === 0} onClick={onToggle}>
                {running ? <Pause size={18} /> : <Play size={18} />}{" "}
                {running ? "Pausar" : "Começar"}
              </Button>
              <Button variant="outline" onClick={onReset}>
                <RotateCcw size={17} /> Reiniciar
              </Button>
            </div>
            <small>
              Uma sessão completa registra 25 minutos de concentração.
            </small>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function NotificationsDialog({
  open,
  onOpenChange,
  notifications,
  readIds,
  unreadCount,
  onMarkRead,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: AppNotification[];
  readIds: string[];
  unreadCount: number;
  onMarkRead: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#111827] text-white">
        <DialogHeader>
          <div className="notification-head">
            <DialogTitle>Notificações automáticas</DialogTitle>
            {unreadCount > 0 && (
              <button onClick={onMarkRead}>Marcar como lidas</button>
            )}
          </div>
        </DialogHeader>
        <div className="notification-list">
          {!notifications.length && (
            <div className="notification-empty">
              <Bell size={22} />
              <strong>Nenhuma notificação para este cargo</strong>
              <p>
                As atualizações aparecerão aqui quando você movimentar tarefas
                na Visão Geral.
              </p>
            </div>
          )}
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={
                readIds.includes(notification.id) ? "notification-read" : ""
              }
            >
              <span
                className={`notify-dot ${notification.tone}`}
                aria-hidden="true"
              />
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <time dateTime={notification.createdAt}>
                  <small>
                    {new Date(notification.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </time>
              </div>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProfileDialog({
  open,
  onOpenChange,
  displayName,
  role,
  roleLabel,
  onExit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  role: Role;
  roleLabel: string;
  onExit: () => void;
}) {
  const permission =
    role === "junior"
      ? "Executa as próprias tarefas e envia entregas para revisão."
      : role === "lead"
        ? "Cria projetos e tarefas, supervisiona e aprova entregas."
        : "Controle completo de projetos, tarefas, dados e configurações.";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#111827] text-white">
        <DialogHeader>
          <DialogTitle>Perfil demonstrativo</DialogTitle>
        </DialogHeader>
        <div className="profile-panel">
          <span className="avatar avatar-purple">{initials(displayName)}</span>
          <div>
            <strong>{displayName}</strong>
            <p>{roleLabel} · Ambiente demonstrativo</p>
          </div>
        </div>
        <p className="demo-note">
          Este projeto não utiliza autenticação. Os dados ficam armazenados
          somente neste navegador.
        </p>
        <div className="permission-summary">
          <ShieldCheck size={17} />
          <div>
            <strong>Permissões deste acesso</strong>
            <p>{permission}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onExit}>
          Voltar à apresentação
        </Button>
      </DialogContent>
    </Dialog>
  );
}
