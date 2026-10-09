import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  initialProjects,
  initialTasks,
  initialTeamMembers,
} from "../data/demo-data";
import { normalizeWorkspace, workspaceSchema } from "../lib/domain";
import { readStored, writeStored } from "../lib/storage";
import type {
  NotificationPreferences,
  NotificationsByRole,
  Project,
  ReadByRole,
  Task,
  TeamMemberData,
} from "../types/domain";
export const defaults = normalizeWorkspace({
  tasks: initialTasks,
  projects: initialProjects,
  teamMembers: initialTeamMembers,
  activeProjectId: "ecommerce",
});
export function useWorkspace() {
  const [tasks, setTasks] = useState<Task[]>(defaults.tasks);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>(
    defaults.teamMembers,
  );
  const [projects, setProjects] = useState<Project[]>(defaults.projects);
  const [activeProjectId, setActiveProjectId] = useState("ecommerce");

  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>({
      junior: true,
      lead: true,
      admin: true,
    });
  const [notificationsByRole, setNotificationsByRole] =
    useState<NotificationsByRole>({ junior: [], lead: [], admin: [] });
  const [readByRole, setReadByRole] = useState<ReadByRole>({
    junior: [],
    lead: [],
    admin: [],
  });

  const [lightTheme, setLightTheme] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const report = () =>
      toast.error(
        "Não foi possível ler ou salvar alguns dados. Use um backup para recuperá-los.",
      );
    window.addEventListener("flowtask-storage-error", report);
    let data = readStored("flowtask-workspace-v2", workspaceSchema, defaults);
    try {
      if (!localStorage.getItem("flowtask-workspace-v2")) {
        data = normalizeWorkspace({
          tasks: JSON.parse(
            localStorage.getItem("flowtask-tasks") ||
              JSON.stringify(initialTasks),
          ),
          projects: JSON.parse(
            localStorage.getItem("flowtask-projects") ||
              JSON.stringify(initialProjects),
          ),
          teamMembers: JSON.parse(
            localStorage.getItem("flowtask-team") ||
              JSON.stringify(initialTeamMembers),
          ),
          activeProjectId:
            localStorage.getItem("flowtask-active-project") || "ecommerce",
        });
      }
    } catch {
      report();
    }
    // Hydrate from browser-only storage after SSR; this is synchronization with an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(data.tasks);
    setProjects(data.projects);
    setTeamMembers(data.teamMembers);
    setActiveProjectId(data.activeProjectId);
    setLightTheme(readStored("flowtask-theme-v2", z.boolean(), false));
    const notification = z.object({
      id: z.string(),
      title: z.string(),
      message: z.string(),
      tone: z.enum(["success", "warning", "danger"]),
      createdAt: z.string(),
    });
    setNotificationsByRole(
      readStored(
        "flowtask-notifications-v2",
        z.object({
          junior: z.array(notification),
          lead: z.array(notification),
          admin: z.array(notification),
        }),
        { junior: [], lead: [], admin: [] },
      ),
    );
    setReadByRole(
      readStored(
        "flowtask-read-notifications-v2",
        z.object({
          junior: z.array(z.string()),
          lead: z.array(z.string()),
          admin: z.array(z.string()),
        }),
        { junior: [], lead: [], admin: [] },
      ),
    );
    setNotificationPreferences(
      readStored(
        "flowtask-notification-preferences",
        z.object({
          junior: z.boolean(),
          lead: z.boolean(),
          admin: z.boolean(),
        }),
        { junior: true, lead: true, admin: true },
      ),
    );
    setHydrated(true);
    return () => window.removeEventListener("flowtask-storage-error", report);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("flowtask-light", lightTheme);
    return () => document.documentElement.classList.remove("flowtask-light");
  }, [lightTheme]);

  useEffect(() => {
    if (hydrated)
      writeStored("flowtask-workspace-v2", {
        version: 2,
        tasks,
        projects,
        teamMembers,
        activeProjectId,
      });
  }, [tasks, projects, teamMembers, activeProjectId, hydrated]);
  useEffect(() => {
    if (hydrated) writeStored("flowtask-notifications-v2", notificationsByRole);
  }, [notificationsByRole, hydrated]);
  useEffect(() => {
    if (hydrated) writeStored("flowtask-read-notifications-v2", readByRole);
  }, [readByRole, hydrated]);
  useEffect(() => {
    if (hydrated)
      writeStored("flowtask-notification-preferences", notificationPreferences);
  }, [notificationPreferences, hydrated]);

  return {
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
  };
}
