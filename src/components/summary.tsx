"use client";

export function Metric({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  tone: string;
}) {
  return (
    <article className="metric-card">
      <span className={`metric-icon ${tone}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small className={tone === "red" ? "negative" : "positive"}>
          {delta}
        </small>
      </div>
    </article>
  );
}
export function Signal({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="signal">
      <span>{icon}</span>
      <p>{label}</p>
      <strong className={tone}>{value}</strong>
    </div>
  );
}
export function Person({
  initials,
  name,
  load,
  status,
  tone,
}: {
  initials: string;
  name: string;
  load: number;
  status: string;
  tone: string;
}) {
  return (
    <div className="person">
      <span className={`avatar avatar-${tone}`}>{initials}</span>
      <div>
        <div className="person-title">
          <strong>{name}</strong>
          <span>{load}%</span>
        </div>
        <div className="load-track">
          <i className={tone} style={{ width: `${load}%` }} />
        </div>
        <small>{status}</small>
      </div>
    </div>
  );
}

export function PageHead({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-head">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
