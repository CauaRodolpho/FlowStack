"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  CheckSquare,
  Link2,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { columns } from "@/src/data/demo-data";
import type { ColumnId, Priority, Role, Task } from "@/src/types/domain";

import type { TeamMemberData } from "@/src/types/domain";
type Props = {
  selectedTask: Task | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  role: Role;
  tasks: Task[];
  teamMembers: TeamMemberData[];
  updateSelected: (changes: Partial<Task>) => boolean | undefined;
  deleteSelected: () => Promise<void>;
  setMobileColumn: (column: ColumnId) => void;
  setFocusTask: (task: Task | null) => void;
  setFocusSeconds: (seconds: number) => void;
};
export function TaskDetails({
  selectedTask,
  setSelectedTask,
  role,
  tasks,
  teamMembers,
  updateSelected,
  deleteSelected,
  setMobileColumn,
  setFocusTask,
  setFocusSeconds,
}: Props) {
  const [newCheck, setNewCheck] = useState("");
  function addCheck() {
    if (!selectedTask || !newCheck.trim()) return;
    updateSelected({
      checklist: [
        ...(selectedTask.checklist || []),
        {
          id:
            Math.max(
              0,
              ...(selectedTask.checklist || []).map((item) => item.id),
            ) + 1,
          text: newCheck.trim(),
          done: false,
        },
      ],
    });
    setNewCheck("");
  }
  return (
    <Dialog
      open={!!selectedTask}
      onOpenChange={(open) => !open && setSelectedTask(null)}
    >
      <DialogContent className="task-dialog border-white/10 bg-[#111827] text-white">
        <DialogHeader>
          <DialogTitle>Detalhes da tarefa</DialogTitle>
        </DialogHeader>
        {selectedTask && (
          <div className="detail-form">
            <label>
              Título
              <Input
                value={selectedTask.title}
                onChange={(e) =>
                  setSelectedTask({
                    ...selectedTask,
                    title: e.target.value,
                  })
                }
                disabled={role === "junior"}
              />
            </label>
            <div className="detail-grid">
              <label>
                Prioridade
                <select
                  value={selectedTask.priority}
                  disabled={role === "junior"}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      priority: e.target.value as Priority,
                    })
                  }
                >
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </label>
              <label>
                Status
                <select
                  disabled={role === "junior" && selectedTask.column === "done"}
                  value={selectedTask.column}
                  onChange={(e) =>
                    updateSelected({ column: e.target.value as ColumnId })
                  }
                >
                  {columns
                    .filter(
                      (col) =>
                        role !== "junior" ||
                        col.id !== "done" ||
                        selectedTask.column === "done",
                    )
                    .map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <label>
              Responsável
              <select
                disabled={role === "junior"}
                value={selectedTask.owner}
                onChange={(event) =>
                  setSelectedTask({
                    ...selectedTask,
                    owner: event.target.value,
                  })
                }
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Descrição
              <textarea
                disabled={role === "junior"}
                value={selectedTask.description || ""}
                onChange={(event) =>
                  setSelectedTask({
                    ...selectedTask,
                    description: event.target.value,
                  })
                }
              />
            </label>
            <label>
              Prazo
              <Input
                type="date"
                value={selectedTask.due}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, due: e.target.value })
                }
                disabled={role === "junior"}
              />
            </label>
            <label>
              <span className="label-icon">
                <Link2 size={14} /> Dependência
              </span>
              <select
                value={selectedTask.blockedBy || ""}
                disabled={role === "junior"}
                onChange={(e) =>
                  updateSelected({
                    blockedBy: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">Nenhuma dependência</option>
                {tasks
                  .filter(
                    (task) =>
                      task.id !== selectedTask.id &&
                      task.projectId === selectedTask.projectId,
                  )
                  .map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
              </select>
            </label>
            <div className="checklist">
              <div>
                <span>
                  <CheckSquare size={15} /> Checklist
                </span>
                <small>
                  {selectedTask.checklist?.filter((item) => item.done).length ||
                    0}
                  /{selectedTask.checklist?.length || 0}
                </small>
              </div>
              {(selectedTask.checklist || []).map((item) => (
                <label key={item.id}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() =>
                      updateSelected({
                        checklist: selectedTask.checklist?.map((check) =>
                          check.id === item.id
                            ? { ...check, done: !check.done }
                            : check,
                        ),
                      })
                    }
                  />
                  <span>{item.text}</span>
                  <button
                    aria-label={`Remover item ${item.text}`}
                    onClick={() =>
                      updateSelected({
                        checklist: selectedTask.checklist?.filter(
                          (check) => check.id !== item.id,
                        ),
                      })
                    }
                  >
                    <Trash2 size={13} />
                  </button>
                </label>
              ))}
              <div className="add-check">
                <Input
                  value={newCheck}
                  onChange={(e) => setNewCheck(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCheck()}
                  placeholder="Adicionar item..."
                />
                <Button
                  aria-label="Adicionar item ao checklist"
                  onClick={addCheck}
                >
                  <Plus size={15} />
                </Button>
              </div>
            </div>
            <div className="detail-actions">
              {role !== "junior" && (
                <Button
                  onClick={() => {
                    if (!selectedTask.title.trim() || !selectedTask.due) {
                      toast.error("Preencha título e prazo.");
                      return;
                    }
                    if (updateSelected({})) toast.success("Alterações salvas.");
                  }}
                >
                  Salvar alterações
                </Button>
              )}
              {role === "junior" && selectedTask.column === "todo" && (
                <Button
                  className="task-next-action"
                  onClick={() => {
                    if (!updateSelected({ column: "doing" })) return;
                    setMobileColumn("doing");
                    toast.success("Tarefa iniciada.");
                  }}
                >
                  <Play size={15} /> Iniciar tarefa
                </Button>
              )}
              {role === "junior" && selectedTask.column === "doing" && (
                <Button
                  className="task-next-action"
                  onClick={() => {
                    if (!updateSelected({ column: "review" })) return;
                    setMobileColumn("review");
                    toast.success("Tarefa enviada para revisão.");
                  }}
                >
                  <CheckCircle2 size={15} /> Enviar para revisão
                </Button>
              )}
              {role === "junior" && selectedTask.column === "review" && (
                <p className="review-waiting">
                  Aguardando revisão do Líder Técnico ou Administrador.
                </p>
              )}
              {role !== "junior" && selectedTask.column === "review" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!updateSelected({ column: "doing" })) return;
                      toast.info("Ajustes solicitados ao responsável.");
                    }}
                  >
                    Solicitar ajustes
                  </Button>
                  <Button
                    className="approve-task"
                    onClick={() => {
                      if (!updateSelected({ column: "done" })) return;
                      toast.success("Tarefa aprovada e concluída.");
                    }}
                  >
                    <CheckCircle2 size={15} /> Aprovar entrega
                  </Button>
                </>
              )}
              <Button
                className="focus-button"
                onClick={() => {
                  setFocusTask(selectedTask);
                  setSelectedTask(null);
                  setFocusSeconds(25 * 60);
                }}
              >
                <Play size={15} /> Modo Foco
              </Button>
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                Fechar
              </Button>
              {role === "admin" && (
                <Button className="delete-task" onClick={deleteSelected}>
                  Excluir
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
