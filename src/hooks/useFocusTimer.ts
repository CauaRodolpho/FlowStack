import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Task } from "../types/domain";

export function useFocusTimer(setTasks: Dispatch<SetStateAction<Task[]>>) {
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const recorded = useRef(false);
  useEffect(() => {
    if (!focusRunning || !focusTask) return;
    recorded.current = false;
    const deadline = Date.now() + focusSeconds * 1000;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setFocusSeconds(remaining);
      if (remaining === 0 && !recorded.current) {
        recorded.current = true;
        clearInterval(timer);
        setFocusRunning(false);
        setTasks((current) =>
          current.map((task) =>
            task.id === focusTask.id
              ? { ...task, focusMinutes: (task.focusMinutes || 0) + 25 }
              : task,
          ),
        );
        toast.success("Sessão concluída: 25 minutos de foco registrados.");
      }
    }, 250);
    return () => clearInterval(timer);
    // Remaining time is captured when resuming; ticking must not recreate the deadline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRunning, focusTask, setTasks]);
  return {
    focusTask,
    setFocusTask,
    focusSeconds,
    setFocusSeconds,
    focusRunning,
    setFocusRunning,
  };
}
