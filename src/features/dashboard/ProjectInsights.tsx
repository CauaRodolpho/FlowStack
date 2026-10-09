import { Progress } from "@/components/ui/progress";
import { Person, Signal } from "@/src/components/summary";
import { formatDate } from "@/src/lib/domain";
import type { Project, Task, TeamMemberData } from "@/src/types/domain";
import {
  AlertTriangle,
  CircleDot,
  Clock3,
  MoreHorizontal,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export function ProjectInsights({
  project,
  tasks,
  members,
  healthScore,
  highOpen,
  blockedCount,
  progress,
  done,
  onOpenTeam,
}: {
  project: Project;
  tasks: Task[];
  members: TeamMemberData[];
  healthScore: number;
  highOpen: number;
  blockedCount: number;
  progress: number;
  done: number;
  onOpenTeam: () => void;
}) {
  const reviewCount = tasks.filter((task) => task.column === "review").length;
  return (
    <aside className="insights">
      <section className="insight-card health-card">
        <div className="card-title">
          <div>
            <span className="mini-icon violet">
              <Target size={17} />
            </span>
            <h2>Radar do projeto</h2>
          </div>
          <MoreHorizontal size={18} aria-hidden="true" />
        </div>
        <div className="health-score">
          <div
            className="score-ring"
            style={{
              background: `conic-gradient(#e5485d 0 ${healthScore}%,#1c2840 ${healthScore}%)`,
            }}
          >
            <span>{healthScore}</span>
            <small>/100</small>
          </div>
          <div>
            <strong>
              {healthScore >= 80
                ? "Saúde boa"
                : healthScore >= 60
                  ? "Atenção necessária"
                  : "Risco elevado"}
            </strong>
            <p>Nota calculada pelas tarefas atuais.</p>
          </div>
        </div>
        <div className="signal-list">
          <Signal
            icon={<Clock3 />}
            label="Prioridades altas"
            value={`${highOpen} abertas`}
            tone="warning"
          />
          <Signal
            icon={<AlertTriangle />}
            label="Tarefas bloqueadas"
            value={`${blockedCount} ${blockedCount === 1 ? "tarefa" : "tarefas"}`}
            tone="danger"
          />
          <Signal
            icon={<Users />}
            label="Carga da equipe"
            value={
              members.some((member) => member.load >= 85)
                ? "Rever capacidade"
                : "Equilibrada"
            }
            tone="success"
          />
        </div>
        <div className="score-explain">
          <span>–{blockedCount * 12} bloqueios</span>
          <span>–{highOpen * 4} prioridades altas</span>
          <span>–{reviewCount * 2} em revisão</span>
        </div>
        <div className="rule-insight">
          <Sparkles size={17} />
          <div>
            <strong>Sugestão do sistema</strong>
            <p>
              {blockedCount
                ? "Resolva as dependências antes de iniciar novas tarefas."
                : "Priorize as tarefas de alta prioridade em andamento."}
            </p>
          </div>
        </div>
      </section>
      <section className="insight-card progress-card">
        <div className="card-title">
          <div>
            <span className="mini-icon blue">
              <CircleDot size={17} />
            </span>
            <h2>Progresso</h2>
          </div>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} />
        <div className="progress-line">
          <span>
            {done} de {tasks.length} tarefas
          </span>
          <span>Entrega: {formatDate(project.due)}</span>
        </div>
      </section>
      <section className="insight-card team-card">
        <div className="card-title">
          <div>
            <span className="mini-icon green">
              <Users size={17} />
            </span>
            <h2>Capacidade planejada</h2>
          </div>
          <button onClick={onOpenTeam}>Ver todos</button>
        </div>
        {members.slice(0, 3).map((member) => (
          <Person
            key={member.id}
            initials={member.initials}
            name={member.name.split(" ")[0]}
            load={member.load}
            status={
              member.load >= 85
                ? "Sobrecarga"
                : member.load >= 50
                  ? "Equilibrado"
                  : "Disponível"
            }
            tone={member.tone}
          />
        ))}
      </section>
    </aside>
  );
}
