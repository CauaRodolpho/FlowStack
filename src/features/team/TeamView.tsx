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
  AlertTriangle,
  Gauge,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useConfirmation } from "@/src/components/ConfirmDialog";
import { PageHead } from "@/src/components/summary";
import type { Project, Role, TeamMemberData } from "@/src/types/domain";
export function TeamView({
  currentRole,
  members,
  projects,
  onUpdate,
  onRemove,
  onAdd,
}: {
  currentRole: Role;
  members: TeamMemberData[];
  projects: Project[];
  onUpdate: (member: TeamMemberData) => boolean;
  onRemove: (memberId: string) => boolean;
  onAdd: (member: TeamMemberData) => boolean;
}) {
  const { confirm, confirmation } = useConfirmation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<TeamMemberData | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    position: "",
    level: "junior" as Role,
    load: 0,
    tasks: 0,
    projects: [] as string[],
  });
  const selfId =
    currentRole === "junior" ? "cr" : currentRole === "lead" ? "mc" : "rl";
  const levelLabel = (level: Role) =>
    level === "junior"
      ? "Júnior"
      : level === "lead"
        ? "Tech Lead"
        : "Administrador";
  const canEdit = (member: TeamMemberData) =>
    currentRole === "admin" ||
    (currentRole === "lead" && member.level === "junior");

  async function createMember() {
    const name = newMember.name.trim();
    const email = newMember.email.trim().toLowerCase();
    if (!name || !email || !newMember.position.trim()) {
      toast.error("Preencha nome, e-mail e função.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    if (members.some((member) => member.email?.toLowerCase() === email)) {
      toast.error("Já existe um integrante com este e-mail.");
      return;
    }
    if (
      newMember.level === "admin" &&
      !(await confirm(
        "Criar outro Administrador com acesso total à demonstração?",
      ))
    )
      return;
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    const added = onAdd({
      id: `member-${Date.now()}`,
      initials,
      name,
      email,
      position: newMember.position.trim(),
      level: newMember.level,
      load: Math.max(0, Math.min(100, Number(newMember.load) || 0)),
      tasks: Math.max(0, Number(newMember.tasks) || 0),
      tone:
        newMember.level === "admin"
          ? "red"
          : newMember.level === "lead"
            ? "violet"
            : "green",
      projects: newMember.projects,
    });
    if (!added) return;
    setCreateOpen(false);
    setNewMember({
      name: "",
      email: "",
      position: "",
      level: "junior",
      load: 0,
      tasks: 0,
      projects: [],
    });
    toast.success("Integrante adicionado à equipe.");
  }

  return (
    <div className="section-view">
      {confirmation}
      <PageHead
        eyebrow="CAPACIDADE DA EQUIPE"
        title="Equipe"
        description="Distribua o trabalho sem sobrecarregar quem está produzindo."
      />
      <div className="team-toolbar">
        <p>
          {currentRole === "admin"
            ? "Você pode cadastrar e definir o acesso de novos integrantes."
            : "Somente o Administrador pode cadastrar novos integrantes."}
        </p>
        {currentRole === "admin" && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={17} /> Adicionar integrante
          </Button>
        )}
      </div>
      <div className="team-summary">
        <article>
          <Users />
          <div>
            <strong>{members.length}</strong>
            <span>integrantes ativos</span>
          </div>
        </article>
        <article>
          <Gauge />
          <div>
            <strong>
              {members.length
                ? Math.round(
                    members.reduce((sum, member) => sum + member.load, 0) /
                      members.length,
                  )
                : 0}
              %
            </strong>
            <span>capacidade planejada média</span>
          </div>
        </article>
        <article>
          <AlertTriangle />
          <div>
            <strong>
              {members.filter((member) => member.load >= 85).length}
            </strong>
            <span>com capacidade planejada ≥ 85%</span>
          </div>
        </article>
      </div>
      <div className="team-grid">
        {members.map((member) => (
          <TeamMember
            key={member.id}
            member={member}
            levelLabel={levelLabel(member.level)}
            menuOpen={openMenu === member.id}
            onMenu={() =>
              setOpenMenu((current) =>
                current === member.id ? null : member.id,
              )
            }
            onView={() => {
              setOpenMenu(null);
              toast.info(
                `${member.name}: ${member.tasks} tarefas e ${member.load}% de capacidade.`,
              );
            }}
            onEdit={() => {
              setOpenMenu(null);
              setEditing({ ...member });
            }}
            onRemove={async () => {
              setOpenMenu(null);
              if (member.id === selfId) {
                toast.error(
                  "Você não pode remover a própria conta demonstrativa.",
                );
                return;
              }
              if (currentRole !== "admin") {
                toast.error(
                  "Somente o Administrador pode remover integrantes.",
                );
                return;
              }
              if (await confirm(`Remover ${member.name} da equipe?`)) {
                if (onRemove(member.id))
                  toast.success("Integrante removido da equipe.");
              }
            }}
            canEdit={canEdit(member)}
            canRemove={
              currentRole === "admin" && !["cr", "mc", "rl"].includes(member.id)
            }
          />
        ))}
      </div>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="team-edit-dialog border-white/10 bg-[#111827] text-white">
          <DialogHeader>
            <DialogTitle>Gerenciar integrante</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="dialog-form">
              <div className="member-edit-head">
                <span className={`avatar avatar-${editing.tone}`}>
                  {editing.initials}
                </span>
                <div>
                  <strong>{editing.name}</strong>
                  <p>{levelLabel(editing.level)}</p>
                </div>
              </div>
              <label>
                Nome
                <Input
                  value={editing.name}
                  disabled={!canEdit(editing)}
                  onChange={(event) =>
                    setEditing({ ...editing, name: event.target.value })
                  }
                />
              </label>
              <label>
                Função na equipe
                <Input
                  value={editing.position}
                  disabled={!canEdit(editing)}
                  onChange={(event) =>
                    setEditing({ ...editing, position: event.target.value })
                  }
                />
              </label>
              <label>
                Nível de acesso
                <select
                  value={editing.level}
                  disabled={
                    currentRole !== "admin" ||
                    ["cr", "mc", "rl"].includes(editing.id)
                  }
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      level: event.target.value as Role,
                    })
                  }
                >
                  <option value="junior">Desenvolvedor Júnior</option>
                  <option value="lead">Tech Lead</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
              <label>
                Capacidade planejada (%)
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editing.load}
                  onChange={(event) =>
                    setEditing({ ...editing, load: Number(event.target.value) })
                  }
                />
              </label>
              <div className="hierarchy-note">
                <ShieldCheck size={17} />
                <span>
                  {currentRole === "admin"
                    ? "O Administrador define a hierarquia. Os três perfis de demonstração mantêm seus cargos."
                    : currentRole === "lead"
                      ? "O Tech Lead pode editar integrantes Júnior, mas não pode promover cargos."
                      : "O perfil Júnior possui acesso somente para visualização."}
                </span>
              </div>
              <Button
                disabled={!canEdit(editing)}
                onClick={() => {
                  if (!onUpdate(editing)) return;
                  setEditing(null);
                  toast.success("Dados do integrante atualizados.");
                }}
              >
                Salvar alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="team-create-dialog border-white/10 bg-[#111827] text-white">
          <DialogHeader>
            <DialogTitle>Adicionar integrante</DialogTitle>
          </DialogHeader>
          <div className="dialog-form">
            <div className="create-member-intro">
              <Users size={19} />
              <div>
                <strong>Novo integrante da equipe</strong>
                <p>Os dados serão salvos somente neste navegador.</p>
              </div>
            </div>
            <label>
              Nome completo
              <Input
                value={newMember.name}
                onChange={(event) =>
                  setNewMember({ ...newMember, name: event.target.value })
                }
                placeholder="Ex.: Ana Oliveira"
              />
            </label>
            <label>
              E-mail profissional
              <Input
                type="email"
                value={newMember.email}
                onChange={(event) =>
                  setNewMember({ ...newMember, email: event.target.value })
                }
                placeholder="ana@empresa.com"
              />
            </label>
            <label>
              Função na equipe
              <Input
                value={newMember.position}
                onChange={(event) =>
                  setNewMember({ ...newMember, position: event.target.value })
                }
                placeholder="Ex.: Desenvolvedora Front-end"
              />
            </label>
            <div className="detail-grid">
              <label>
                Nível de acesso
                <select
                  value={newMember.level}
                  onChange={(event) =>
                    setNewMember({
                      ...newMember,
                      level: event.target.value as Role,
                    })
                  }
                >
                  <option value="junior">Desenvolvedor Júnior</option>
                  <option value="lead">Tech Lead</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
              <label>
                Capacidade inicial (%)
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newMember.load}
                  onChange={(event) =>
                    setNewMember({
                      ...newMember,
                      load: Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>

            <fieldset className="project-access-list">
              <legend>Projetos dos quais participará</legend>
              {projects.map((project) => (
                <label key={project.id}>
                  <input
                    type="checkbox"
                    checked={newMember.projects.includes(project.id)}
                    onChange={(event) =>
                      setNewMember({
                        ...newMember,
                        projects: event.target.checked
                          ? [...newMember.projects, project.id]
                          : newMember.projects.filter(
                              (id) => id !== project.id,
                            ),
                      })
                    }
                  />
                  <span>{project.name}</span>
                </label>
              ))}
            </fieldset>
            {newMember.level === "admin" && (
              <div className="admin-warning">
                <AlertTriangle size={17} />
                <span>
                  Este cargo terá acesso completo. Uma confirmação será
                  solicitada.
                </span>
              </div>
            )}
            <Button onClick={createMember}>
              <UserRound size={17} /> Criar integrante
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function TeamMember({
  member,
  levelLabel,
  menuOpen,
  onMenu,
  onView,
  onEdit,
  onRemove,
  canEdit,
  canRemove,
}: {
  member: TeamMemberData;
  levelLabel: string;
  menuOpen: boolean;
  onMenu: () => void;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
  canEdit: boolean;
  canRemove: boolean;
}) {
  return (
    <article className="member-card">
      <div>
        <span className={`avatar avatar-${member.tone}`}>
          {member.initials}
        </span>
        <div>
          <strong>{member.name}</strong>
          <p>{member.position}</p>
        </div>
        <div className="member-menu-wrap">
          <button
            className="member-menu-button"
            onClick={onMenu}
            aria-label={`Ações de ${member.name}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-controls={`member-menu-${member.id}`}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div
              id={`member-menu-${member.id}`}
              className="member-menu"
              role="menu"
            >
              <button role="menuitem" onClick={onView}>
                Ver perfil e tarefas
              </button>
              <button role="menuitem" onClick={onEdit} disabled={!canEdit}>
                Editar integrante
              </button>
              <button
                role="menuitem"
                className="member-remove"
                onClick={onRemove}
                disabled={!canRemove}
              >
                Remover da equipe
              </button>
            </div>
          )}
        </div>
      </div>
      <span className={`access-badge access-${member.level}`}>
        {levelLabel}
      </span>
      <div className="member-numbers">
        <span>
          <strong>{member.tasks}</strong> tarefas
        </span>
        <span>
          <strong>{member.load}%</strong> capacidade
        </span>
      </div>
      <div className="load-track">
        <i className={member.tone} style={{ width: `${member.load}%` }} />
      </div>
      <small>
        {member.load >= 85
          ? "Recomendamos redistribuir tarefas"
          : member.load > 55
            ? "Carga equilibrada"
            : "Disponível para novas tarefas"}
      </small>
    </article>
  );
}
