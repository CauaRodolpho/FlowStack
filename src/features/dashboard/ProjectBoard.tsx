import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTaskDialog } from "@/src/components/workspace/WorkspaceDialogs";
import { columns } from "@/src/data/demo-data";
import { TaskCalendar, TaskTimeline } from "@/src/features/tasks/TaskSchedule";
import { formatDate } from "@/src/lib/domain";
import type {
  ColumnId,
  Priority,
  Project,
  Role,
  Task,
  TeamMemberData,
} from "@/src/types/domain";
import {
  CalendarDays,
  Download,
  FolderKanban,
  Link2,
  MessageSquare,
  Plus,
  RotateCcw,
  Undo2,
  Upload,
} from "lucide-react";

export function ProjectBoard({
  project,
  projects,
  activeProjectId,
  role,
  tasks,
  allTasks,
  members,
  historyCount,
  query,
  view,
  mobileColumn,
  createOpen,
  newTask,
  onProject,
  onUndo,
  onExport,
  onImport,
  onReset,
  onView,
  onMobileColumn,
  onCreateOpen,
  onNewTask,
  onCreateTask,
  onMove,
  onDrag,
  onSelect,
}: {
  project: Project;
  projects: Project[];
  activeProjectId: string;
  role: Role;
  tasks: Task[];
  allTasks: Task[];
  members: TeamMemberData[];
  historyCount: number;
  query: string;
  view: string;
  mobileColumn: ColumnId;
  createOpen: boolean;
  newTask: {
    title: string;
    description: string;
    priority: Priority;
    owner: string;
    due: string;
  };
  onProject: (projectId: string) => void;
  onUndo: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  onView: (view: string) => void;
  onMobileColumn: (column: ColumnId) => void;
  onCreateOpen: (open: boolean) => void;
  onNewTask: (field: keyof ProjectBoardProps["newTask"], value: string) => void;
  onCreateTask: () => void;
  onMove: (column: ColumnId) => void;
  onDrag: (taskId: number) => void;
  onSelect: (task: Task) => void;
}) {
  return (
    <section className="board-card">
      <div className="board-heading">
        <div>
          <div className="title-row">
            <span className="project-icon">
              <FolderKanban size={18} />
            </span>
            <select
              className="project-selector"
              value={activeProjectId}
              onChange={(event) => onProject(event.target.value)}
              aria-label="Selecionar projeto"
            >
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <p>{project.description}</p>
        </div>
        <div className="board-actions">
          <button
            onClick={onUndo}
            disabled={!historyCount || role === "junior"}
            title="Desfazer última alteração"
            aria-label={`Desfazer última alteração. ${historyCount} disponíveis`}
          >
            <Undo2 size={16} />
            <span>{historyCount}</span>
          </button>
          {role === "admin" && (
            <>
              <button
                onClick={onExport}
                title="Exportar projeto"
                aria-label="Exportar backup do projeto"
              >
                <Download size={16} />
              </button>
              <button
                onClick={onImport}
                title="Importar projeto"
                aria-label="Importar backup do projeto"
              >
                <Upload size={16} />
              </button>
              <button
                onClick={onReset}
                title="Restaurar demonstração"
                aria-label="Restaurar dados demonstrativos"
              >
                <RotateCcw size={16} />
              </button>
            </>
          )}
          {role !== "junior" && (
            <CreateTaskDialog
              open={createOpen}
              onOpenChange={onCreateOpen}
              title={newTask.title}
              description={newTask.description}
              priority={newTask.priority}
              owner={newTask.owner}
              due={newTask.due}
              members={members}
              onTitle={(value) => onNewTask("title", value)}
              onDescription={(value) => onNewTask("description", value)}
              onPriority={(value) => onNewTask("priority", value)}
              onOwner={(value) => onNewTask("owner", value)}
              onDue={(value) => onNewTask("due", value)}
              onCreate={onCreateTask}
            />
          )}
        </div>
      </div>
      <Tabs value={view} onValueChange={onView} className="board-tabs">
        <TabsList>
          <TabsTrigger value="board">Quadro</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="timeline">Linha do tempo</TabsTrigger>
        </TabsList>
      </Tabs>
      {query && (
        <p className="search-result-count" aria-live="polite">
          {tasks.length}{" "}
          {tasks.length === 1 ? "tarefa encontrada" : "tarefas encontradas"} no
          projeto atual
        </p>
      )}
      {view === "board" && (
        <Kanban
          tasks={tasks}
          allTasks={allTasks}
          members={members}
          role={role}
          mobileColumn={mobileColumn}
          onMobileColumn={onMobileColumn}
          onMove={onMove}
          onDrag={onDrag}
          onSelect={onSelect}
          onCreate={() => onCreateOpen(true)}
        />
      )}
      {(view === "list" || view === "calendar") && (
        <p className="mobile-scroll-hint">
          Deslize para o lado para ver mais conteúdo
        </p>
      )}
      {view === "list" && <TaskList tasks={tasks} onSelect={onSelect} />}
      {view === "calendar" && (
        <TaskCalendar tasks={tasks} onSelect={onSelect} />
      )}
      {view === "timeline" && (
        <TaskTimeline tasks={tasks} onSelect={onSelect} />
      )}
    </section>
  );
}

type ProjectBoardProps = Parameters<typeof ProjectBoard>[0];

function Kanban({
  tasks,
  allTasks,
  members,
  role,
  mobileColumn,
  onMobileColumn,
  onMove,
  onDrag,
  onSelect,
  onCreate,
}: Pick<
  ProjectBoardProps,
  | "tasks"
  | "allTasks"
  | "members"
  | "role"
  | "mobileColumn"
  | "onMobileColumn"
  | "onMove"
  | "onDrag"
  | "onSelect"
> & { onCreate: () => void }) {
  return (
    <>
      <div className="mobile-status-tabs" aria-label="Etapas do quadro">
        {columns.map((column) => (
          <button
            key={column.id}
            className={mobileColumn === column.id ? "active" : ""}
            onClick={() => onMobileColumn(column.id)}
            aria-pressed={mobileColumn === column.id}
          >
            <span className={`status-dot ${column.tone}`} aria-hidden="true" />
            {column.label}
            <strong>
              {tasks.filter((task) => task.column === column.id).length}
            </strong>
          </button>
        ))}
      </div>
      <p className="mobile-board-help">
        Selecione uma etapa e toque em uma tarefa para atualizá-la.
      </p>
      <div className="kanban">
        {columns.map((column) => {
          const items = tasks.filter((task) => task.column === column.id);
          return (
            <div
              className={`kanban-column ${mobileColumn === column.id ? "mobile-column-active" : ""}`}
              key={column.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onMove(column.id)}
            >
              <div className="column-head">
                <div>
                  <span
                    className={`status-dot ${column.tone}`}
                    aria-hidden="true"
                  />
                  <strong>{column.label}</strong>
                  <span className="count">{items.length}</span>
                </div>
                <button
                  aria-label={`Adicionar em ${column.label}`}
                  onClick={onCreate}
                  disabled={role === "junior"}
                >
                  <Plus size={17} />
                </button>
              </div>
              <div className="task-list">
                {items.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    blocked={
                      !!task.blockedBy &&
                      allTasks.find((item) => item.id === task.blockedBy)
                        ?.column !== "done"
                    }
                    ownerInitials={
                      members.find((member) => member.id === task.owner)
                        ?.initials || "?"
                    }
                    draggable={role !== "junior" || task.owner === "cr"}
                    onDrag={() => onDrag(task.id)}
                    onSelect={() => onSelect(task)}
                  />
                ))}
                {!items.length && (
                  <div className="empty-column">Solte uma tarefa aqui</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TaskCard({
  task,
  blocked,
  ownerInitials,
  draggable,
  onDrag,
  onSelect,
}: {
  task: Task;
  blocked: boolean;
  ownerInitials: string;
  draggable: boolean;
  onDrag: () => void;
  onSelect: () => void;
}) {
  const checklistDone = task.checklist?.filter((item) => item.done).length || 0;
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Abrir tarefa ${task.title}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`task-card ${blocked ? "task-blocked" : ""}`}
      draggable={draggable}
      onDragStart={onDrag}
      onClick={onSelect}
    >
      <div className="task-top">
        <h3>{task.title}</h3>
        <Badge
          className={`priority priority-${task.priority.toLowerCase().replace("é", "e")}`}
        >
          {task.priority}
        </Badge>
      </div>
      {blocked && (
        <div className="blocked-label">
          <Link2 size={12} /> Bloqueada por outra tarefa
        </div>
      )}
      {!!task.checklist?.length && (
        <div className="check-progress">
          <i
            style={{
              width: `${(checklistDone / task.checklist.length) * 100}%`,
            }}
          />
          <span>
            {checklistDone}/{task.checklist.length}
          </span>
        </div>
      )}
      <div className="task-meta">
        <span className="avatar small">{ownerInitials}</span>
        <span>
          <CalendarDays size={14} />
          {formatDate(task.due)}
        </span>
        <span>
          <MessageSquare size={14} />
          {task.comments}
        </span>
      </div>
    </article>
  );
}

function TaskList({
  tasks,
  onSelect,
}: {
  tasks: Task[];
  onSelect: (task: Task) => void;
}) {
  return (
    <div className="list-view">
      {tasks.map((task) => (
        <button key={task.id} onClick={() => onSelect(task)}>
          <span
            className={`status-dot ${columns.find((column) => column.id === task.column)?.tone}`}
            aria-hidden="true"
          />
          <strong>{task.title}</strong>
          <Badge
            className={`priority priority-${task.priority.toLowerCase().replace("é", "e")}`}
          >
            {task.priority}
          </Badge>
          <span>
            {columns.find((column) => column.id === task.column)?.label}
          </span>
          <span>{formatDate(task.due)}</span>
        </button>
      ))}
      {!tasks.length && (
        <div className="empty-search">
          Nenhuma tarefa encontrada com os filtros atuais.
        </div>
      )}
    </div>
  );
}
