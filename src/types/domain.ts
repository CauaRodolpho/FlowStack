export type ColumnId = "todo" | "doing" | "review" | "done";
export type Priority = "Alta" | "Média" | "Baixa";
export type Role = "junior" | "lead" | "admin";
export type AppNotification = {
  id: string;
  title: string;
  message: string;
  tone: "success" | "warning" | "danger";
  createdAt: string;
};
export type NotificationsByRole = Record<Role, AppNotification[]>;
export type ReadByRole = Record<Role, string[]>;
export type NotificationPreferences = Record<Role, boolean>;
export type TeamMemberData = {
  id: string;
  initials: string;
  name: string;
  email?: string;
  position: string;
  level: Role;
  load: number;
  tasks: number;
  tone: string;
  projects?: string[];
};
export type CheckItem = { id: number; text: string; done: boolean };
export type Task = {
  id: number;
  title: string;
  description?: string;
  column: ColumnId;
  priority: Priority;
  due: string;
  comments: number;
  owner: string;
  checklist?: CheckItem[];
  blockedBy?: number | null;
  completedAt?: string;
  focusMinutes?: number;
  projectId?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  due: string;
  owner: string;
  priority: Priority;
};
