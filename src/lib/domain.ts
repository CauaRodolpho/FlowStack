import { z } from "zod";
import type {
  NotificationsByRole,
  Project,
  Role,
  Task,
  TeamMemberData,
} from "../types/domain";

const id = z.string().trim().min(1).max(120);
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Data inválida");
export const taskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(180),
  description: z.string().max(5000).optional(),
  column: z.enum(["todo", "doing", "review", "done"]),
  priority: z.enum(["Alta", "Média", "Baixa"]),
  due: isoDate,
  comments: z.number().int().nonnegative(),
  owner: id,
  projectId: id,
  completedAt: isoDate.optional(),
  focusMinutes: z.number().nonnegative().optional(),
  blockedBy: z.number().int().positive().nullable().optional(),
  checklist: z
    .array(
      z.object({
        id: z.number().int().positive(),
        text: z.string().trim().min(1).max(300),
        done: z.boolean(),
      }),
    )
    .max(100)
    .optional(),
});
export const projectSchema = z.object({
  id,
  name: z.string().trim().min(1).max(120),
  description: z.string().max(5000),
  due: isoDate,
  owner: id,
  priority: z.enum(["Alta", "Média", "Baixa"]),
});
export const memberSchema = z.object({
  id,
  initials: z.string().min(1).max(4),
  name: z.string().trim().min(1).max(120),
  email: z.string().email().optional(),
  position: z.string().trim().min(1).max(120),
  level: z.enum(["junior", "lead", "admin"]),
  load: z.number().min(0).max(100),
  tasks: z.number().int().nonnegative(),
  tone: z.string().max(30),
  projects: z.array(id).optional(),
});
export const workspaceSchema = z
  .object({
    version: z.literal(2),
    projects: z.array(projectSchema).min(1).max(100),
    tasks: z.array(taskSchema).max(10000),
    teamMembers: z.array(memberSchema).min(1).max(500),
    activeProjectId: id,
  })
  .superRefine((value, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    const projectIds = new Set(value.projects.map((p) => p.id));
    const memberIds = new Set(value.teamMembers.map((m) => m.id));
    const taskIds = new Set(value.tasks.map((t) => t.id));
    if (
      projectIds.size !== value.projects.length ||
      memberIds.size !== value.teamMembers.length ||
      taskIds.size !== value.tasks.length
    )
      fail("IDs duplicados");
    if (!projectIds.has(value.activeProjectId))
      fail("Projeto selecionado inexistente");
    for (const [fixed, level] of [
      ["cr", "junior"],
      ["mc", "lead"],
      ["rl", "admin"],
    ])
      if (value.teamMembers.find((m) => m.id === fixed)?.level !== level)
        fail("Preserve os três perfis demonstrativos");
    for (const project of value.projects)
      if (!memberIds.has(project.owner))
        fail("Responsável do projeto inexistente");
    for (const member of value.teamMembers)
      if (member.projects?.some((p) => !projectIds.has(p)))
        fail("Projeto da equipe inexistente");
    for (const task of value.tasks) {
      if (!memberIds.has(task.owner) || !projectIds.has(task.projectId))
        fail("Referência de tarefa inválida");
      const visited = new Set<number>([task.id]);
      let next = task.blockedBy;
      while (next) {
        const dep = value.tasks.find((t) => t.id === next);
        if (!dep || dep.projectId !== task.projectId || visited.has(next)) {
          fail("Dependência inválida ou circular");
          break;
        }
        visited.add(next);
        next = dep.blockedBy;
      }
    }
  });
export type Workspace = z.infer<typeof workspaceSchema>;
export const canCreateProject = (role: Role) => role !== "junior";
export const canReviewTask = (role: Role) => role !== "junior";
export const canUpdateTask = (role: Role, task: Task) =>
  role !== "junior" || task.owner === "cr";
export function transitionError(
  role: Role,
  task: Task,
  next: Task["column"],
  all: Task[],
): string | null {
  if (!canUpdateTask(role, task))
    return "Você só pode alterar suas próprias tarefas.";
  if (role === "junior" && task.column === "done")
    return "Somente a liderança pode reabrir uma entrega aprovada.";
  if (role === "junior" && next === "done")
    return "Envie para revisão. A liderança aprova a entrega.";
  if (
    next !== task.column &&
    next !== "todo" &&
    task.blockedBy &&
    all.find((t) => t.id === task.blockedBy)?.column !== "done"
  )
    return "Conclua a dependência antes de avançar.";
  return null;
}
export function calculateProjectProgress(tasks: Task[]) {
  return tasks.length
    ? Math.round(
        (tasks.filter((t) => t.column === "done").length / tasks.length) * 100,
      )
    : 0;
}
export function projectMetrics(tasks: Task[]) {
  const blocked = tasks.filter(
    (t) =>
      t.blockedBy && tasks.find((d) => d.id === t.blockedBy)?.column !== "done",
  ).length;
  const high = tasks.filter(
    (t) => t.priority === "Alta" && t.column !== "done",
  ).length;
  const review = tasks.filter((t) => t.column === "review").length;
  return {
    blocked,
    high,
    review,
    health: Math.max(0, 100 - blocked * 12 - high * 4 - review * 2),
    progress: calculateProjectProgress(tasks),
  };
}
export function weeklyCompletions(tasks: Task[], today = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(day.getDate() - 6 + index);
    const date = localDate(day);
    return {
      date,
      label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(day),
      count: tasks.filter(
        (task) => task.column === "done" && task.completedAt === date,
      ).length,
    };
  });
}
export function memberChangeError(
  role: Role,
  member: TeamMemberData,
  previous?: TeamMemberData,
) {
  if (!previous && role !== "admin")
    return "Somente o Administrador pode adicionar integrantes.";
  if (
    previous &&
    (role === "junior" ||
      (role === "lead" &&
        (previous.level !== "junior" || member.level !== "junior")))
  )
    return "Seu perfil não pode alterar este integrante.";
  if (
    previous &&
    ["cr", "mc", "rl"].includes(previous.id) &&
    previous.level !== member.level
  )
    return "Os cargos das três contas de demonstração são fixos.";
  if (!memberSchema.safeParse(member).success)
    return "Revise os dados do integrante.";
  return null;
}
export function taskEvents(
  previous: Task[],
  next: Task[],
  projects: Project[],
  enabled: Record<Role, boolean>,
  stamp = new Date().toISOString(),
): NotificationsByRole {
  const result: NotificationsByRole = { junior: [], lead: [], admin: [] };
  let sequence = 0;
  const push = (
    role: Role,
    title: string,
    message: string,
    tone: "success" | "warning" | "danger" = "success",
  ) => {
    if (enabled[role])
      result[role].push({
        id: `${stamp}-${role}-${sequence++}`,
        title,
        message,
        tone,
        createdAt: stamp,
      });
  };
  for (const task of next) {
    const before = previous.find((t) => t.id === task.id);
    if (!before || before.column === task.column) continue;
    if (task.column === "review") {
      for (const role of ["lead", "admin"] as const)
        push(
          role,
          "Entrega para revisão",
          `“${task.title}” aguarda aprovação.`,
          "warning",
        );
    }
    if (
      task.owner === "cr" &&
      before.column === "review" &&
      task.column === "doing"
    )
      push(
        "junior",
        "Ajustes solicitados",
        `Revise a tarefa “${task.title}”.`,
        "warning",
      );
    if (task.owner === "cr" && task.column === "done")
      push(
        "junior",
        "Entrega aprovada",
        `“${task.title}” foi aprovada pela liderança.`,
      );
  }
  for (const project of projects) {
    const before = previous.filter((t) => t.projectId === project.id),
      after = next.filter((t) => t.projectId === project.id);
    // Só mudanças de status geram marcos; excluir ou importar tarefas não é produtividade.
    if (
      !after.some((t) =>
        before.some((b) => b.id === t.id && b.column !== t.column),
      )
    )
      continue;
    const a = calculateProjectProgress(before.filter((t) => t.owner === "cr")),
      b = calculateProjectProgress(after.filter((t) => t.owner === "cr"));
    for (const milestone of [20, 40, 60, 80, 100])
      if (a < milestone && b >= milestone)
        for (const role of ["junior", "lead"] as const)
          push(
            role,
            `Progresso do Júnior: ${milestone}%`,
            `${project.name}: ${b}% das tarefas do Júnior aprovadas.`,
          );
    const aTotal = calculateProjectProgress(before),
      bTotal = calculateProjectProgress(after);
    if (aTotal < 40 && bTotal >= 40)
      push("admin", "40% das tarefas concluídas", project.name);
    if (aTotal < 100 && bTotal === 100)
      push("admin", "Projeto concluído", project.name);
  }
  return result;
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
      }).format(parsed);
}
export function normalizeLegacyDate(date: string) {
  if (isoDate.safeParse(date).success) return date;
  const match =
    /^(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/i.exec(
      date,
    );
  if (!match) throw new Error("Prazo inválido");
  return `2026-${String(["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"].indexOf(match[2].toLowerCase()) + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}
export function normalizeWorkspace(data: {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMemberData[];
  activeProjectId: string;
}): Workspace {
  const owners = new Map(
    data.teamMembers.flatMap((m) => [
      [m.id, m.id],
      [m.initials, m.id],
    ]),
  );
  return workspaceSchema.parse({
    ...data,
    version: 2,
    tasks: data.tasks.map((t) => ({
      ...t,
      projectId: t.projectId || "ecommerce",
      owner: owners.get(t.owner) || t.owner,
      due: normalizeLegacyDate(t.due),
    })),
    projects: data.projects.map((p) => ({
      ...p,
      owner: owners.get(p.owner) || p.owner,
      due: normalizeLegacyDate(p.due),
    })),
  });
}
