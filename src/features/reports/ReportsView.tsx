import { Progress } from "@/components/ui/progress";
import { PageHead } from "@/src/components/summary";
import { columns } from "@/src/data/demo-data";
import {
  calculateProjectProgress,
  localDate,
  projectMetrics,
  weeklyCompletions,
} from "@/src/lib/domain";
import type { Task } from "@/src/types/domain";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Target,
} from "lucide-react";

export function ReportsView({
  tasks,
  healthScore,
}: {
  tasks: Task[];
  healthScore: number;
}) {
  const completed = tasks.filter((task) => task.column === "done").length;
  const completion = calculateProjectProgress(tasks);
  const weekly = weeklyCompletions(tasks);
  const max = Math.max(1, ...weekly.map((day) => day.count));
  const weeklyTotal = weekly.reduce((sum, day) => sum + day.count, 0);
  const { review, blocked } = projectMetrics(tasks);
  const overdue = tasks.filter(
    (task) => task.column !== "done" && task.due < localDate(),
  ).length;
  const focus = tasks.reduce((sum, task) => sum + (task.focusMinutes || 0), 0);
  return (
    <div className="section-view reports-view">
      <PageHead
        eyebrow="PROJETO SELECIONADO"
        title="Relatórios"
        description="Indicadores calculados a partir das tarefas deste projeto."
      />
      <div className="report-metrics">
        <ReportMetric
          icon={<Activity />}
          value={String(weeklyTotal)}
          label="entregas em 7 dias"
          note="com data de aprovação registrada"
        />
        <ReportMetric
          icon={<CheckCircle2 />}
          value={`${completion}%`}
          label="tarefas concluídas"
          note={`${completed} de ${tasks.length} tarefas`}
        />
        <ReportMetric
          icon={<Clock3 />}
          value={`${focus} min`}
          label="foco registrado"
          note="sessões concluídas neste navegador"
        />
        <ReportMetric
          icon={<Target />}
          value={String(healthScore)}
          label="saúde do projeto"
          note="estimativa por prioridades e bloqueios"
        />
      </div>
      <div className="report-grid">
        <article className="chart-card production-chart">
          <div className="chart-head">
            <div>
              <h2>Entregas recentes</h2>
              <p>Conclusões registradas nos últimos sete dias</p>
            </div>
          </div>
          <div
            className="bar-chart"
            role="img"
            aria-label={weekly
              .map((day) => `${day.date}: ${day.count} entregas`)
              .join("; ")}
          >
            {weekly.map((day) => (
              <div key={day.date}>
                <span>{day.count}</span>
                <i style={{ height: `${(day.count / max) * 100}%` }} />
                <small>{day.label}</small>
              </div>
            ))}
          </div>
          {!weeklyTotal && (
            <p className="chart-note">
              Nenhuma aprovação registrada neste período.
            </p>
          )}
        </article>
        <article className="chart-card distribution-card">
          <div className="chart-head">
            <div>
              <h2>Distribuição do trabalho</h2>
              <p>Tarefas por etapa</p>
            </div>
            <BarChart3 size={19} />
          </div>
          {columns.map((column) => {
            const count = tasks.filter(
              (task) => task.column === column.id,
            ).length;
            return (
              <div className="distribution-row" key={column.id}>
                <span>
                  <i className={`status-dot ${column.tone}`} />
                  {column.label}
                </span>
                <div>
                  <i
                    style={{
                      width: `${tasks.length ? (count / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <strong>{count}</strong>
              </div>
            );
          })}
        </article>
        <article className="chart-card bottleneck-card">
          <div className="chart-head">
            <div>
              <h2>Pontos de atenção</h2>
              <p>Situação atual do projeto</p>
            </div>
            <AlertTriangle size={19} />
          </div>
          <div>
            <span className="risk high">{overdue}</span>
            <p>tarefas abertas com prazo vencido.</p>
          </div>
          <div>
            <span className="risk medium">{review}</span>
            <p>tarefas aguardando revisão da liderança.</p>
          </div>
          <div>
            <span className="risk low">{blocked}</span>
            <p>tarefas com dependências pendentes.</p>
          </div>
        </article>
        <article className="chart-card velocity-card">
          <div className="chart-head">
            <div>
              <h2>Progresso das entregas</h2>
              <p>Tarefas aprovadas em relação ao total</p>
            </div>
            <CheckCircle2 size={19} />
          </div>
          <div className="velocity-score">
            <strong>{completion}%</strong>
            <span>concluído</span>
          </div>
          <Progress
            value={completion}
            aria-label={`${completion}% concluído`}
          />
          <p>
            {tasks.length
              ? `${tasks.length - completed} tarefas ainda não foram concluídas.`
              : "Crie tarefas para começar a acompanhar este projeto."}
          </p>
        </article>
      </div>
    </div>
  );
}
function ReportMetric({
  icon,
  value,
  label,
  note,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  note: string;
}) {
  return (
    <article>
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
        <small>{note}</small>
      </div>
    </article>
  );
}
