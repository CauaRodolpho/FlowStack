import { formatDate } from "@/src/lib/domain";

import { Badge } from "@/components/ui/badge";

import { PageHead } from "@/src/components/summary";
import { columns } from "@/src/data/demo-data";
import type { Task, TeamMemberData } from "@/src/types/domain";
export function TasksView({
  tasks,
  members,
  onSelect,
}: {
  tasks: Task[];
  members: TeamMemberData[];
  onSelect: (task: Task) => void;
}) {
  return (
    <div className="section-view">
      <PageHead
        eyebrow="CENTRAL DE EXECUÇÃO"
        title="Tarefas do projeto"
        description="Consulte prioridades, responsáveis e andamento em uma única lista."
      />
      <div className="task-page-list">
        <div className="task-table-head">
          <span>Tarefa</span>
          <span>Prioridade</span>
          <span>Status</span>
          <span>Responsável</span>
          <span>Prazo</span>
        </div>
        {!tasks.length && (
          <p className="empty-state">
            Nenhuma tarefa encontrada. Experimente outro filtro.
          </p>
        )}
        {tasks.map((task) => (
          <button key={task.id} onClick={() => onSelect(task)}>
            <span className="task-list-title">
              <i
                className={`status-dot ${columns.find((c) => c.id === task.column)?.tone}`}
              />
              <strong>{task.title}</strong>
            </span>
            <Badge
              className={`task-list-priority priority priority-${task.priority.toLowerCase().replace("é", "e")}`}
            >
              {task.priority}
            </Badge>
            <span className="task-list-status">
              {columns.find((c) => c.id === task.column)?.label}
            </span>
            <span
              className="task-list-owner avatar small"
              aria-label={`Responsável: ${
                members.find((member) => member.id === task.owner)?.name ||
                "Não definido"
              }`}
            >
              {members.find((member) => member.id === task.owner)?.initials ||
                "?"}
            </span>
            <span className="task-list-due">{formatDate(task.due)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
