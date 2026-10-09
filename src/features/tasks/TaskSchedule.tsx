import { formatDate, localDate } from "@/src/lib/domain";
import type { Task } from "@/src/types/domain";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function TaskCalendar({
  tasks,
  onSelect,
}: {
  tasks: Task[];
  onSelect: (task: Task) => void;
}) {
  const [month, setMonth] = useState(() => localDate().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(() => localDate());
  const [year, number] = month.split("-").map(Number);
  const first = new Date(year, number - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, number, 0).getDate();
  function change(delta: number) {
    const nextMonth = localDate(new Date(year, number - 1 + delta, 1)).slice(
      0,
      7,
    );
    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  }
  const selectedTasks = tasks.filter((task) => task.due === selectedDate);
  return (
    <section className="task-calendar" aria-label="Calendário de prazos">
      <div className="schedule-toolbar">
        <button aria-label="Mês anterior" onClick={() => change(-1)}>
          <ChevronLeft size={18} />
        </button>
        <h3>
          {new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric",
          }).format(first)}
        </h3>
        <button aria-label="Próximo mês" onClick={() => change(1)}>
          <ChevronRight size={18} />
        </button>
        <button
          className="schedule-today"
          onClick={() => {
            setMonth(localDate().slice(0, 7));
            setSelectedDate(localDate());
          }}
        >
          Hoje
        </button>
      </div>
      <div className="mobile-calendar" aria-label="Calendário mensal compacto">
        <div className="mobile-calendar-grid">
          {["S", "T", "Q", "Q", "S", "S", "D"].map((day, index) => (
            <span className="mobile-weekday" key={`${day}-${index}`}>
              {day}
            </span>
          ))}
          {Array.from({ length: offset }, (_, index) => (
            <span
              className="mobile-calendar-blank"
              key={`mobile-blank-${index}`}
            />
          ))}
          {Array.from({ length: count }, (_, index) => {
            const date = `${month}-${String(index + 1).padStart(2, "0")}`;
            const dayTasks = tasks.filter((task) => task.due === date);
            return (
              <button
                key={date}
                className={`${date === localDate() ? "today" : ""} ${
                  date === selectedDate ? "selected" : ""
                }`}
                onClick={() => setSelectedDate(date)}
                aria-pressed={date === selectedDate}
                aria-label={`${index + 1}, ${dayTasks.length} ${
                  dayTasks.length === 1 ? "tarefa" : "tarefas"
                }`}
              >
                <time dateTime={date}>{index + 1}</time>
                {dayTasks.length > 0 && <i>{dayTasks.length}</i>}
              </button>
            );
          })}
        </div>
        <div className="mobile-day-tasks">
          <strong>
            {new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "long",
            }).format(new Date(`${selectedDate}T12:00:00`))}
          </strong>
          {!selectedTasks.length && (
            <p>Nenhuma entrega prevista para este dia.</p>
          )}
          {selectedTasks.map((task) => (
            <button key={task.id} onClick={() => onSelect(task)}>
              <span>{task.title}</span>
              <small>
                {task.column === "done" ? "Concluída" : "Abrir tarefa"}
              </small>
            </button>
          ))}
        </div>
      </div>
      <div
        className="calendar-scroll"
        tabIndex={0}
        aria-label="Calendário. Deslize na horizontal em telas pequenas."
      >
        <div className="calendar-grid">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
            <strong className="weekday" key={day}>
              {day}
            </strong>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <div className="calendar-blank" key={`blank-${i}`} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const date = `${month}-${String(i + 1).padStart(2, "0")}`;
            return (
              <div
                className={`calendar-day ${date === localDate() ? "today" : ""}`}
                key={date}
              >
                <time dateTime={date}>{i + 1}</time>
                {tasks
                  .filter((task) => task.due === date)
                  .map((task) => (
                    <button
                      key={task.id}
                      className={`calendar-task calendar-${task.column}`}
                      onClick={() => onSelect(task)}
                    >
                      {task.title}
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export function TaskTimeline({
  tasks,
  onSelect,
}: {
  tasks: Task[];
  onSelect: (task: Task) => void;
}) {
  const ordered = [...tasks].sort((a, b) => a.due.localeCompare(b.due));
  return (
    <div className="deadline-list">
      <p className="chart-note">Próximos prazos, em ordem de entrega.</p>
      {!ordered.length && (
        <p className="empty-state">Nenhuma tarefa neste filtro.</p>
      )}
      {ordered.map((task) => (
        <button key={task.id} onClick={() => onSelect(task)}>
          <span className="sr-only">Abrir tarefa: </span>
          <time dateTime={task.due}>{formatDate(task.due)}</time>
          <i
            className={`deadline-dot ${task.column === "done" ? "done" : ""}`}
          />
          <span>{task.title}</span>
          <small>
            {task.column === "done"
              ? "Concluída"
              : task.due < localDate()
                ? "Atrasada"
                : "Prevista"}
          </small>
        </button>
      ))}
    </div>
  );
}
