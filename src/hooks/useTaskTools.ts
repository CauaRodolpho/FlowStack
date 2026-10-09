import { useEffect } from "react";
import { z } from "zod";
import { localDate, transitionError } from "../lib/domain";
import type { Role, Task } from "../types/domain";

type Context = {
  registerTool: (
    tool: unknown,
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
/** Optional browser integration shares the same permissions, validation and notifications. */
export function useTaskTools({
  enabled,
  role,
  tasks,
  projectId,
  onCommit,
}: {
  enabled: boolean;
  role: Role;
  tasks: Task[];
  projectId: string;
  onCommit: (tasks: Task[]) => boolean;
}) {
  useEffect(() => {
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!enabled || !context) return;
    const lifecycle = new AbortController();
    const register = async () => {
      await context.registerTool(
        {
          name: "create_task",
          title: "Criar tarefa",
          description:
            "Cria uma tarefa no projeto atual, respeitando o cargo demonstrativo.",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string", minLength: 1, maxLength: 180 },
            },
            required: ["title"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: true },
          execute(input: unknown) {
            if (role === "junior")
              throw new Error("Júnior não pode criar tarefas.");
            const { title } = z
              .object({ title: z.string().trim().min(1).max(180) })
              .strict()
              .parse(input);
            const task: Task = {
              id: Date.now(),
              title,
              column: "todo",
              priority: "Média",
              due: localDate(),
              comments: 0,
              owner: "cr",
              projectId,
            };
            if (!onCommit([...tasks, task]))
              throw new Error("Não foi possível criar a tarefa.");
            return { id: task.id, title, column: task.column };
          },
        },
        { signal: lifecycle.signal },
      );
      if (lifecycle.signal.aborted) return;
      await context.registerTool(
        {
          name: "move_task",
          title: "Mover tarefa",
          description:
            "Movimenta uma tarefa do projeto atual com as mesmas regras da interface.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "number" },
              column: {
                type: "string",
                enum: ["todo", "doing", "review", "done"],
              },
            },
            required: ["id", "column"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: true },
          execute(input: unknown) {
            const { id, column } = z
              .object({
                id: z.number().int().positive(),
                column: z.enum(["todo", "doing", "review", "done"]),
              })
              .strict()
              .parse(input);
            const task = tasks.find(
              (item) => item.id === id && item.projectId === projectId,
            );
            if (!task) throw new Error("Tarefa não encontrada neste projeto.");
            const error = transitionError(role, task, column, tasks);
            if (error) throw new Error(error);
            if (
              !onCommit(
                tasks.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        column,
                        completedAt:
                          column === "done"
                            ? item.completedAt || localDate()
                            : undefined,
                      }
                    : item,
                ),
              )
            )
              throw new Error("Alteração inválida.");
            return { id, column };
          },
        },
        { signal: lifecycle.signal },
      );
    };
    void register().catch(() => {
      /* Optional integration must not prevent manual use. */
    });
    return () => lifecycle.abort();
  }, [enabled, role, tasks, projectId, onCommit]);
}
