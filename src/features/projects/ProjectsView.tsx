import { formatDate } from "@/src/lib/domain";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, FolderKanban, Plus, ShieldCheck } from "lucide-react";

import { PageHead } from "@/src/components/summary";
import type { Project, Role, Task } from "@/src/types/domain";
export function ProjectsView({
  projects,
  tasks,
  role,
  activeProjectId,
  onOpen,
  onCreate,
}: {
  projects: Project[];
  tasks: Task[];
  role: Role;
  activeProjectId: string;
  onOpen: (projectId: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="section-view">
      <PageHead
        eyebrow="PORTFÓLIO DE PROJETOS"
        title="Meus projetos"
        description="Acompanhe o progresso, os riscos e a próxima entrega."
      />
      <div className="project-grid">
        {projects.map((project) => {
          const projectTasks = tasks.filter(
            (task) => (task.projectId || "ecommerce") === project.id,
          );
          const done = projectTasks.filter(
            (task) => task.column === "done",
          ).length;
          const progress = projectTasks.length
            ? (done / projectTasks.length) * 100
            : 0;
          return (
            <article
              className={`project-main-card ${activeProjectId === project.id ? "project-selected" : ""}`}
              key={project.id}
            >
              <div className="project-card-top">
                <span className="project-icon">
                  <FolderKanban size={20} />
                </span>
                <Badge>
                  {progress === 100
                    ? "Concluído"
                    : projectTasks.length
                      ? "Em andamento"
                      : "Novo"}
                </Badge>
              </div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <div className="project-stat-row">
                <span>
                  <strong>{projectTasks.length}</strong> tarefas
                </span>
                <span>
                  <strong>{done}</strong> concluídas
                </span>
                <span>
                  <strong>{formatDate(project.due)}</strong> entrega
                </span>
              </div>
              <Progress value={progress} />
              <button onClick={() => onOpen(project.id)}>
                Abrir projeto <ChevronDown size={15} />
              </button>
            </article>
          );
        })}
        {role !== "junior" ? (
          <button className="new-project-card" onClick={onCreate}>
            <Plus size={24} />
            <strong>Novo projeto</strong>
            <p>Crie um espaço de trabalho e organize as tarefas da equipe.</p>
          </button>
        ) : (
          <article className="new-project-card project-restricted">
            <ShieldCheck size={24} />
            <strong>Criação restrita</strong>
            <p>Projetos são criados pelo Tech Lead ou Administrador.</p>
          </article>
        )}
      </div>
    </div>
  );
}
