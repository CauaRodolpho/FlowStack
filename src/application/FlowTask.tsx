"use client";
import { useFocusTimer } from "@/src/hooks/useFocusTimer";
import { defaults, useWorkspace } from "@/src/hooks/useWorkspace";
import {
  canUpdateTask,
  localDate,
  memberChangeError,
  normalizeWorkspace,
  projectMetrics,
  taskEvents,
  transitionError,
  workspaceSchema,
} from "@/src/lib/domain";
import { readStored, writeStored } from "@/src/lib/storage";
import { z } from "zod";

import { Toaster } from "@/components/ui/sonner";
import { CheckCircle2, Clock3, Gauge, ListTodo } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useConfirmation } from "@/src/components/ConfirmDialog";
import {
  AppSidebar,
  type WorkspaceSection,
} from "@/src/components/app-shell/AppSidebar";
import { AppTopbar } from "@/src/components/app-shell/AppTopbar";
import {
  CreateProjectDialog,
  FocusDialog,
  NotificationsDialog,
  ProfileDialog,
} from "@/src/components/workspace/WorkspaceDialogs";
import { Metric } from "@/src/components/summary";
import { initialTeamMembers } from "@/src/data/demo-data";
import { AuthPortal } from "@/src/features/demo-access/AuthPortal";
import { ProjectInsights } from "@/src/features/dashboard/ProjectInsights";
import { ProjectBoard } from "@/src/features/dashboard/ProjectBoard";
import { ProjectsView } from "@/src/features/projects/ProjectsView";
import { ReportsView } from "@/src/features/reports/ReportsView";
import { SettingsView } from "@/src/features/settings/SettingsView";
import { TaskDetails } from "@/src/features/tasks/TaskDetails";
import { TasksView } from "@/src/features/tasks/TasksView";
import { TeamView } from "@/src/features/team/TeamView";
import { usePageMotion } from "@/src/hooks/usePageMotion";
import { useTaskTools } from "@/src/hooks/useTaskTools";
import type {
  AppNotification,
  ColumnId,
  Priority,
  Project,
  Role,
  Task,
} from "@/src/types/domain";
export default function Home() {
  const {
    tasks,
    setTasks,
    teamMembers,
    setTeamMembers,
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    notificationPreferences,
    setNotificationPreferences,
    notificationsByRole,
    setNotificationsByRole,
    readByRole,
    setReadByRole,
    lightTheme,
    setLightTheme,
    hydrated,
  } = useWorkspace();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectDue, setNewProjectDue] = useState(localDate());
  const [newProjectOwner, setNewProjectOwner] = useState("mc");
  const [newProjectPriority, setNewProjectPriority] =
    useState<Priority>("Média");
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileColumn, setMobileColumn] = useState<ColumnId>("todo");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [dragged, setDragged] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState("board");
  const [activeNav, setActiveNav] = useState<WorkspaceSection>("Visão geral");

  const { confirm, confirmation } = useConfirmation();
  const [history, setHistory] = useState<Task[][]>([]);
  const {
    focusTask,
    setFocusTask,
    focusSeconds,
    setFocusSeconds,
    focusRunning,
    setFocusRunning,
  } = useFocusTimer(setTasks);
  const [showIntro, setShowIntro] = useState(true);
  const motionRef = usePageMotion(showIntro ? "login" : activeNav);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newPriority, setNewPriority] = useState<Priority>("Média");
  const [newDue, setNewDue] = useState(localDate());
  const [newOwner, setNewOwner] = useState("cr");
  const [newDescription, setNewDescription] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [displayName, setDisplayName] = useState("Cauã Rodolpho");
  const importRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function closeMenu(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenu(false);
        setMobileSearchOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileSearchOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    }
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);
  const activeProject =
    projects.find((project) => project.id === activeProjectId) || projects[0];
  const projectTasks = tasks.filter(
    (task) => (task.projectId || "ecommerce") === activeProjectId,
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const ownerNames = Object.fromEntries(
      teamMembers.map((member) => [member.id, member.name]),
    );
    return tasks.filter((t) => {
      const searchable = [
        t.title,
        t.description,
        t.priority,
        t.owner,
        ownerNames[t.owner],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (t.projectId || "ecommerce") === activeProjectId &&
        (role !== "junior" || t.owner === "cr") &&
        searchable.includes(term)
      );
    });
  }, [tasks, query, role, activeProjectId, teamMembers]);
  const done = projectTasks.filter((t) => t.column === "done").length;
  const progress = projectTasks.length
    ? Math.round((done / projectTasks.length) * 100)
    : 0;
  const roleLabel =
    role === "junior"
      ? "Desenvolvedor Júnior"
      : role === "lead"
        ? "Líder Técnico"
        : "Administrador";
  const notifications = notificationsByRole[role];
  const unreadCount = notificationPreferences[role]
    ? notifications.filter((item) => !readByRole[role].includes(item.id)).length
    : 0;
  function markNotificationsRead() {
    const ids = notifications.map((item) => item.id);
    setReadByRole((current) => ({ ...current, [role]: ids }));
  }
  const {
    blocked: blockedCount,
    high: highOpen,
    health: healthScore,
  } = projectMetrics(projectTasks);
  const overdue = projectTasks.filter(
    (task) => task.column !== "done" && task.due < localDate(),
  ).length;
  const activeMembers = teamMembers.map((member) => ({
    ...member,
    tasks: tasks.filter(
      (task) => task.owner === member.id && task.column !== "done",
    ).length,
  }));
  function commit(next: Task[]) {
    const validation = workspaceSchema.safeParse({
      version: 2,
      projects,
      teamMembers,
      activeProjectId,
      tasks: next,
    });
    if (!validation.success) {
      toast.error("Revise os dados e as dependências antes de salvar.");
      return false;
    }
    createNotifications(tasks, next);
    setHistory((current) => [...current.slice(-9), tasks]);
    setTasks(next);
    return true;
  }
  function createNotifications(previous: Task[], next: Task[]) {
    const updates = taskEvents(
      previous,
      next,
      projects,
      notificationPreferences,
    );
    setNotificationsByRole((current) => ({
      junior: [...updates.junior, ...current.junior].slice(0, 50),
      lead: [...updates.lead, ...current.lead].slice(0, 50),
      admin: [...updates.admin, ...current.admin].slice(0, 50),
    }));
  }
  useTaskTools({
    enabled: !showIntro,
    role,
    tasks,
    projectId: activeProjectId,
    onCommit: commit,
  });
  function addTask() {
    if (role === "junior") {
      toast.error("O perfil Júnior não pode criar tarefas.");
      return;
    }
    if (
      !newTitle.trim() ||
      !newDue ||
      !teamMembers.some((m) => m.id === newOwner)
    ) {
      toast.error("Informe o título da tarefa.");
      return;
    }
    const saved = commit([
      ...tasks,
      {
        id: Math.max(0, ...tasks.map((task) => task.id)) + 1,
        title: newTitle.trim(),
        description: newDescription.trim(),
        column: "todo",
        priority: newPriority,
        due: newDue,
        comments: 0,
        owner: newOwner,
        projectId: activeProjectId,
        checklist: [],
        blockedBy: null,
      },
    ]);
    if (!saved) return;
    setNewTitle("");
    setNewDescription("");
    setDialogOpen(false);
    toast.success("Tarefa adicionada ao quadro.");
  }
  function moveTask(column: ColumnId) {
    if (dragged === null) return;
    const moving = tasks.find((task) => task.id === dragged);
    if (role === "junior" && moving?.owner !== "cr") {
      toast.error("Você só pode movimentar suas próprias tarefas.");
      return;
    }
    if (role === "junior" && column === "done") {
      toast.error(
        "Envie a tarefa para revisão. Apenas o Tech Lead ou Administrador pode concluí-la.",
      );
      setDragged(null);
      return;
    }
    if (!moving) return;
    const error = transitionError(role, moving, column, tasks);
    if (error) {
      toast.error(error);
      setDragged(null);
      return;
    }
    commit(
      tasks.map((t) =>
        t.id === dragged
          ? {
              ...t,
              column,
              completedAt:
                column === "done" ? t.completedAt || localDate() : undefined,
            }
          : t,
      ),
    );
    setDragged(null);
    toast.success("Tarefa movida.");
  }
  function updateSelected(changes: Partial<Task>) {
    if (!selectedTask) return false;
    if (role === "junior") {
      if (changes.column === "done") {
        toast.error("O perfil Júnior deve enviar a tarefa para revisão.");
        return;
      }
      const allowed: Partial<Task> = {};
      if ("column" in changes) allowed.column = changes.column;
      if ("checklist" in changes) allowed.checklist = changes.checklist;
      changes = allowed;
    }
    const stored = tasks.find((task) => task.id === selectedTask.id);
    if (!stored) return false;
    const savingDraft = role !== "junior" && Object.keys(changes).length === 0;
    const updated = {
      ...(savingDraft ? selectedTask : stored),
      ...changes,
      ...(changes.column
        ? {
            completedAt:
              changes.column === "done"
                ? selectedTask.completedAt || localDate()
                : undefined,
          }
        : {}),
    };
    if (!canUpdateTask(role, selectedTask)) {
      toast.error("Você só pode alterar suas tarefas.");
      return;
    }
    const error = transitionError(role, stored, updated.column, tasks);
    if (error) {
      toast.error(error);
      return;
    }
    const result = workspaceSchema.safeParse({
      version: 2,
      projects,
      teamMembers,
      activeProjectId,
      tasks: tasks.map((task) => (task.id === updated.id ? updated : task)),
    });
    if (!result.success) {
      toast.error("Revise título, prazo e responsável.");
      return;
    }
    setSelectedTask(
      savingDraft
        ? updated
        : { ...selectedTask, ...changes, completedAt: updated.completedAt },
    );
    commit(tasks.map((task) => (task.id === updated.id ? updated : task)));
    return true;
  }
  async function deleteSelected() {
    if (!selectedTask) return;
    if (role !== "admin") {
      toast.error("Somente o Administrador pode excluir tarefas.");
      return;
    }
    if (
      !(await confirm(
        `Excluir “${selectedTask.title}”? Esta ação poderá ser desfeita.`,
      ))
    )
      return;
    commit(
      tasks
        .filter((task) => task.id !== selectedTask.id)
        .map((task) =>
          task.blockedBy === selectedTask.id
            ? { ...task, blockedBy: null }
            : task,
        ),
    );
    setSelectedTask(null);
    toast.success("Tarefa excluída.");
  }
  function undo() {
    if (role === "junior") return;
    const previous = history.at(-1);
    if (!previous) return;
    setTasks(previous);
    setHistory((current) => current.slice(0, -1));
    toast.success("Última alteração desfeita.");
  }
  async function resetDemo() {
    if (role !== "admin") {
      toast.error("Somente o Administrador pode restaurar os dados.");
      return;
    }
    if (
      !(await confirm(
        "Restaurar os dados demonstrativos? Suas alterações atuais serão substituídas.",
      ))
    )
      return;
    setHistory((current) => [...current.slice(-9), tasks]);
    setTasks(defaults.tasks);
    setProjects(defaults.projects);
    setTeamMembers(defaults.teamMembers);
    setNotificationsByRole({ junior: [], lead: [], admin: [] });
    setReadByRole({ junior: [], lead: [], admin: [] });
    setHistory([]);
    setSelectedTask(null);
    setActiveProjectId("ecommerce");
    toast.success("Demonstração restaurada.");
  }
  function addProject() {
    if (role === "junior") {
      toast.error("O perfil Júnior não pode criar projetos.");
      return;
    }
    if (
      !newProjectName.trim() ||
      !newProjectDue ||
      !teamMembers.some((m) => m.id === newProjectOwner)
    ) {
      toast.error("Informe o nome do projeto.");
      return;
    }
    const project: Project = {
      id: `${Date.now()}`,
      name: newProjectName.trim(),
      description:
        newProjectDescription.trim() || "Projeto criado no FlowTask.",
      due: newProjectDue.trim() || "Sem prazo",
      owner: newProjectOwner,
      priority: newProjectPriority,
    };
    if (
      !workspaceSchema.safeParse({
        version: 2,
        projects: [...projects, project],
        tasks,
        teamMembers,
        activeProjectId,
      }).success
    ) {
      toast.error("Revise nome, prazo e responsável do projeto.");
      return;
    }
    setProjects((current) => [...current, project]);
    setActiveProjectId(project.id);
    setNewProjectName("");
    setNewProjectDescription("");
    setProjectDialogOpen(false);
    setActiveNav("Visão geral");
    toast.success("Projeto criado e selecionado.");
  }
  function exportProject() {
    if (role === "junior") return;
    const blob = new Blob(
      [
        JSON.stringify(
          { version: 2, projects, tasks, teamMembers, activeProjectId },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowtask-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Backup exportado.");
  }
  async function importProject(file?: File) {
    if (role !== "admin" || !file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("O limite é 5 MB.");
      const input = JSON.parse(await file.text());
      if (input.version !== undefined && input.version !== 2)
        throw new Error("Versão de backup incompatível.");
      const parsed =
        input.version === 2
          ? workspaceSchema.parse(input)
          : normalizeWorkspace({
              ...input,
              teamMembers: input.teamMembers || initialTeamMembers,
            });
      if (
        !(await confirm(
          "Substituir projetos, tarefas e equipe pelo backup? Exporte os dados atuais antes de continuar.",
        ))
      )
        return;
      setTasks(parsed.tasks);
      setProjects(parsed.projects);
      setTeamMembers(parsed.teamMembers);
      setActiveProjectId(parsed.activeProjectId);
      setHistory([]);
      setSelectedTask(null);
      setNotificationsByRole({ junior: [], lead: [], admin: [] });
      setReadByRole({ junior: [], lead: [], admin: [] });
      toast.success("Backup restaurado.");
    } catch {
      toast.error(
        "Backup inválido. Verifique o formato, os campos e as referências. Nenhum dado foi alterado.",
      );
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }
  function openImport() {
    importRef.current?.click();
  }
  function toggleTheme() {
    setLightTheme((value) => {
      const next = !value;
      writeStored("flowtask-theme-v2", next);
      return next;
    });
  }
  if (!hydrated)
    return (
      <main className="loading-state" aria-busy="true">
        Carregando seu espaço de trabalho…
      </main>
    );
  if (showIntro)
    return (
      <>
        <AuthPortal
          lightTheme={lightTheme}
          onTheme={toggleTheme}
          onAuth={(nextRole, name) => {
            setRole(nextRole);
            setSelectedTask(null);
            setProfileOpen(false);
            setNotificationsOpen(false);
            setHistory([]);
            setQuery("");
            setFocusTask(null);
            setFocusRunning(false);
            const savedNames = readStored(
              "flowtask-display-names",
              z.record(z.string()),
              {},
            );
            setDisplayName(savedNames[nextRole] || name);
            setShowIntro(false);
          }}
        />
        <Toaster richColors position="bottom-right" />
      </>
    );
  return (
    <div ref={motionRef} className={`app-shell ${lightTheme ? "light" : ""}`}>
      {confirmation}
      <AppSidebar
        activeSection={activeNav}
        mobileOpen={mobileMenu}
        onNavigate={(section) => {
          setActiveNav(section);
          setMobileMenu(false);
        }}
        onClose={() => setMobileMenu(false)}
        onLogout={() => {
          setShowIntro(true);
          setMobileMenu(false);
          setActiveNav("Visão geral");
        }}
      />
      <main>
        <AppTopbar
          mobileSearchOpen={mobileSearchOpen}
          searchRef={searchRef}
          query={query}
          roleLabel={roleLabel}
          lightTheme={lightTheme}
          unreadCount={unreadCount}
          displayName={displayName}
          onOpenMenu={() => setMobileMenu(true)}
          onOpenSearch={() => setMobileSearchOpen(true)}
          onSearch={(value) => {
            setQuery(value);
            if (activeNav !== "Visão geral" && activeNav !== "Tarefas")
              setActiveNav("Tarefas");
          }}
          onCloseSearch={() => {
            setQuery("");
            setMobileSearchOpen(false);
          }}
          onToggleTheme={toggleTheme}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />
        <section className="content">
          {" "}
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => importProject(e.target.files?.[0])}
          />
          {activeNav === "Visão geral" && (
            <>
              <div className="welcome-row">
                <div>
                  <p className="eyebrow">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "full",
                    }).format(new Date())}
                  </p>
                  <h1>Seu trabalho, {displayName.split(" ")[0]}</h1>
                  <p className="subtle">
                    Aqui está o progresso dos seus projetos hoje.
                  </p>
                </div>
                <div className="project-pulse">
                  <span className="pulse-dot" />{" "}
                  {projectTasks.length
                    ? `${projectTasks.filter((t) => t.column === "review").length} entregas em revisão`
                    : "Nenhuma tarefa neste projeto"}
                </div>
              </div>
              <div className="metrics">
                <Metric
                  icon={<ListTodo />}
                  label="Tarefas ativas"
                  value={String(projectTasks.length - done)}
                  delta="No projeto selecionado"
                  tone="blue"
                />
                <Metric
                  icon={<CheckCircle2 />}
                  label="Concluídas"
                  value={String(done)}
                  delta="Entregas aprovadas"
                  tone="green"
                />
                <Metric
                  icon={<Clock3 />}
                  label="Em atraso"
                  value={String(overdue)}
                  delta="Requer atenção"
                  tone="red"
                />
                <Metric
                  icon={<Gauge />}
                  label="Conclusão"
                  value={`${progress}%`}
                  delta="Das tarefas do projeto"
                  tone="violet"
                />
              </div>
              <div className="workspace-grid">
                <ProjectBoard
                  project={activeProject}
                  projects={projects}
                  activeProjectId={activeProjectId}
                  role={role}
                  tasks={filtered}
                  allTasks={tasks}
                  members={teamMembers}
                  historyCount={history.length}
                  query={query}
                  view={activeView}
                  mobileColumn={mobileColumn}
                  createOpen={dialogOpen}
                  newTask={{
                    title: newTitle,
                    description: newDescription,
                    priority: newPriority,
                    owner: newOwner,
                    due: newDue,
                  }}
                  onProject={setActiveProjectId}
                  onUndo={undo}
                  onExport={exportProject}
                  onImport={() => importRef.current?.click()}
                  onReset={resetDemo}
                  onView={setActiveView}
                  onMobileColumn={setMobileColumn}
                  onCreateOpen={setDialogOpen}
                  onNewTask={(field, value) => {
                    if (field === "title") setNewTitle(value);
                    if (field === "description") setNewDescription(value);
                    if (field === "priority") setNewPriority(value as Priority);
                    if (field === "owner") setNewOwner(value);
                    if (field === "due") setNewDue(value);
                  }}
                  onCreateTask={addTask}
                  onMove={moveTask}
                  onDrag={setDragged}
                  onSelect={setSelectedTask}
                />
                <ProjectInsights
                  project={activeProject}
                  tasks={projectTasks}
                  members={activeMembers}
                  healthScore={healthScore}
                  highOpen={highOpen}
                  blockedCount={blockedCount}
                  progress={progress}
                  done={done}
                  onOpenTeam={() => setActiveNav("Equipe")}
                />
              </div>
            </>
          )}
          {activeNav === "Meus projetos" && (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              role={role}
              activeProjectId={activeProjectId}
              onOpen={(projectId) => {
                setActiveProjectId(projectId);
                setActiveNav("Visão geral");
              }}
              onCreate={() => setProjectDialogOpen(true)}
            />
          )}
          {activeNav === "Tarefas" && (
            <TasksView
              members={teamMembers}
              tasks={filtered}
              onSelect={setSelectedTask}
            />
          )}
          {activeNav === "Equipe" && (
            <TeamView
              currentRole={role}
              members={activeMembers}
              projects={projects}
              onUpdate={(updated) => {
                const previous = teamMembers.find(
                  (member) => member.id === updated.id,
                );
                if (!previous) return false;
                const error = memberChangeError(role, updated, previous);
                if (error) {
                  toast.error(error);
                  return false;
                }
                setTeamMembers((current) =>
                  current.map((member) =>
                    member.id === updated.id
                      ? {
                          ...updated,
                          initials: updated.name
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase(),
                        }
                      : member,
                  ),
                );
                return true;
              }}
              onRemove={(memberId) => {
                if (role !== "admin" || ["cr", "mc", "rl"].includes(memberId)) {
                  toast.error("Preserve as contas demonstrativas.");
                  return false;
                }
                if (
                  tasks.some((task) => task.owner === memberId) ||
                  projects.some((project) => project.owner === memberId)
                ) {
                  toast.error(
                    "Reatribua as tarefas e os projetos deste integrante antes de removê-lo.",
                  );
                  return false;
                }
                setTeamMembers((current) =>
                  current.filter((member) => member.id !== memberId),
                );
                setHistory([]);
                return true;
              }}
              onAdd={(member) => {
                const error = memberChangeError(role, member);
                if (error) {
                  toast.error(error);
                  return false;
                }
                setTeamMembers((current) => [...current, member]);
                const notification: AppNotification = {
                  id: `team-${member.id}-${Date.now()}`,
                  title: "Novo integrante adicionado",
                  message: `${member.name} entrou na equipe como ${member.level === "admin" ? "Administrador" : member.level === "lead" ? "Tech Lead" : "Júnior"}.`,
                  tone: "success",
                  createdAt: new Date().toISOString(),
                };
                setNotificationsByRole((current) => ({
                  ...current,
                  admin: notificationPreferences.admin
                    ? [notification, ...current.admin].slice(0, 50)
                    : current.admin,
                }));
                return true;
              }}
            />
          )}
          {activeNav === "Relatórios" && (
            <ReportsView tasks={projectTasks} healthScore={healthScore} />
          )}
          {activeNav === "Configurações" && (
            <SettingsView
              role={role}
              displayName={displayName}
              onDisplayName={(name) => {
                setDisplayName(name);
                const savedNames = readStored(
                  "flowtask-display-names",
                  z.record(z.string()),
                  {},
                );
                writeStored("flowtask-display-names", {
                  ...savedNames,
                  [role]: name,
                });
              }}
              lightTheme={lightTheme}
              onTheme={toggleTheme}
              notificationsEnabled={notificationPreferences[role]}
              onNotifications={() =>
                setNotificationPreferences((current) => ({
                  ...current,
                  [role]: !current[role],
                }))
              }
              onExport={exportProject}
              onImport={openImport}
              onReset={resetDemo}
            />
          )}
        </section>
        <CreateProjectDialog
          open={projectDialogOpen}
          onOpenChange={setProjectDialogOpen}
          name={newProjectName}
          description={newProjectDescription}
          owner={newProjectOwner}
          priority={newProjectPriority}
          due={newProjectDue}
          members={teamMembers}
          onName={setNewProjectName}
          onDescription={setNewProjectDescription}
          onOwner={setNewProjectOwner}
          onPriority={setNewProjectPriority}
          onDue={setNewProjectDue}
          onCreate={addProject}
        />
        <TaskDetails
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          role={role}
          tasks={tasks}
          teamMembers={teamMembers}
          updateSelected={updateSelected}
          deleteSelected={deleteSelected}
          setMobileColumn={setMobileColumn}
          setFocusTask={setFocusTask}
          setFocusSeconds={setFocusSeconds}
        />
        <FocusDialog
          task={focusTask}
          seconds={focusSeconds}
          running={focusRunning}
          onOpenChange={(open) => {
            if (!open) {
              setFocusTask(null);
              setFocusRunning(false);
            }
          }}
          onToggle={() => setFocusRunning((value) => !value)}
          onReset={() => {
            setFocusRunning(false);
            setFocusSeconds(25 * 60);
          }}
        />
        <NotificationsDialog
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
          notifications={notifications}
          readIds={readByRole[role]}
          unreadCount={unreadCount}
          onMarkRead={markNotificationsRead}
        />
        <ProfileDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
          displayName={displayName}
          role={role}
          roleLabel={roleLabel}
          onExit={() => {
            setProfileOpen(false);
            setShowIntro(true);
          }}
        />
        <Toaster richColors position="bottom-right" />
      </main>
    </div>
  );
}
