import React from "react";
import { useEffect, useState, type FormEvent } from "react";
import { criarInscricao, getCursos, getResumo, type Cargo, type Curso, type Resumo } from "./api";
import { useAuth } from "./auth";

type IconName = "home" | "courses" | "institution" | "users" | "chart" | "user";

function useHashRoute() {
  const readRoute = () => decodeURIComponent(window.location.hash || "#/");
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

function navigate(path: string) {
  window.location.hash = path;
}

const menu = [
  { label: "Início", icon: "home" as IconName, roles: ["ADMIN"] as Cargo[] },
  { label: "Cursos", icon: "courses" as IconName, roles: ["ADMIN", "DEPPI", "PROFESSOR", "ALUNO"] as Cargo[] },
  { label: "Instituições", icon: "institution" as IconName, roles: ["ADMIN", "DEPPI"] as Cargo[] },
  { label: "Usuários", icon: "users" as IconName, roles: ["ADMIN", "DEPPI"] as Cargo[] },
  { label: "Relatórios", icon: "chart" as IconName, roles: ["ADMIN"] as Cargo[] },
  { label: "Perfil", icon: "user" as IconName, roles: ["ADMIN", "DEPPI", "PROFESSOR", "ALUNO"] as Cargo[] },
];

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    home: "M3 11.5 12 4l9 7.5M5.5 10v9h13v-9M9 19v-5h6v5",
    courses: "M4 5.5h16M4 9.5h16M4 13.5h10M4 17.5h7",
    institution: "M4 20V8l8-4 8 4v12M2 20h20M8 12v2M12 12v2M16 12v2",
    users: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 11a2.5 2.5 0 1 0 0-5",
    chart: "M4 19V5M4 19h17M8 16v-4M12 16V8M16 16v-6M20 16v-9",
    user: "M20 20v-1.5a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4V20M12 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

function NavItems({ usuario, active }: { usuario: { cargos: Cargo[] }; active: string }) {
  return <>{menu.filter((item) => usuario.cargos.some((cargo) => item.roles.includes(cargo))).map((item) => {
    const path = item.label === "Início" ? "#/" : `#/${item.label.toLowerCase()}`;
    return <button className={active === path ? "nav-item active" : "nav-item"} key={item.label} onClick={() => navigate(path)}><Icon name={item.icon} />{item.label}</button>;
  })}</>;
}

function LoginPage() {
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try { await login(email, senha); }
    catch (err) { setError(err instanceof Error ? err.message : "Falha ao entrar."); }
    finally { setLoading(false); }
  }

  return <main className="login-page">
    <section className="login-card">
      <div className="brand-mark">D</div>
      <p className="eyebrow">IFCE · Extensão</p>
      <h1>Bem-vindo ao DEPPI</h1>
      <p className="muted">Entre com suas credenciais institucionais.</p>
      <form onSubmit={handleSubmit}>
        <label>E-mail institucional<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu.email@ifce.edu.br" /></label>
        <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="Digite sua senha" /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button full-width" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
      </form>
      <div className="demo-divider"><span>ou demonstração</span></div>
      <div className="demo-actions">
        <button onClick={() => loginDemo("ADMIN")}>ADMIN demo</button>
        <button onClick={() => loginDemo("ALUNO")}>ALUNO demo</button>
        <button onClick={() => loginDemo("PROFESSOR")}>PROFESSOR demo</button>
        <button onClick={() => loginDemo("DEPPI")}>DEPPI demo</button>
      </div>
    </section>
  </main>;
}

function ForbiddenPage() {
  const { logout } = useAuth();
  return <main className="center-page"><div className="error-code">403</div><h1>Acesso não permitido</h1><p className="muted">Seu cargo não possui permissão para visualizar esta área.</p><button className="primary-button" onClick={logout}>Sair da conta</button></main>;
}

function RoleWorkspace() {
  const { usuario, logout } = useAuth();
  const route = useHashRoute();

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="side-brand"><div className="brand-mark small">D</div><div><strong>DEPPI</strong><small>IFCE · Extensão</small></div></div>
      <nav><NavItems usuario={usuario!} active={route} /></nav>
      <button className="logout-button" onClick={logout}><span>↪</span>Sair</button>
    </aside>
    <div className="content">
      <header className="topbar"><span className="breadcrumb">☰ &nbsp; Início</span><div className="profile"><span className="moon">◐</span><div><strong>{usuario?.nome ?? "Usuário"}</strong><small>{usuario?.cargos.join(" · ")}</small></div><div className="avatar">{usuario?.nome.charAt(0).toUpperCase()}</div></div></header>
      <main className="dashboard"><div className="welcome"><div><h1>Olá, {usuario?.nome?.split(" ")[0] ?? "usuário"}</h1><p className="muted">Escolha uma opção no menu para continuar.</p></div></div><section className="panel workspace-panel"><h2>Áreas disponíveis</h2><p className="muted">Use o menu lateral para acessar os módulos disponíveis para o seu cargo.</p></section></main>
    </div>
  </div>;
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return <div className="stat-card"><span>{label}</span><strong className={accent ? "accent-text" : ""}>{value.toLocaleString("pt-BR")}</strong></div>;
}

function StatusBars({ items, colors }: { items: Array<{ status: string; quantidade: number }>; colors: Record<string, string> }) {
  const max = Math.max(...items.map((item) => item.quantidade), 1);
  return <div className="status-list">{items.map((item) => <div className="status-row" key={item.status}><div className="status-label"><i style={{ background: colors[item.status] }} />{item.status.toLowerCase().replace("ANDAMENTO", "em andamento").replace("CONCLUIDO", "concluído").replace("ANALISE", "em análise").replace("DEFERIDO", "deferida").replace("INDEFERIDO", "indeferida").replace("PENDENTE", "pendente").replace("CANCELADO", "cancelada")}</div><div className="bar-track"><div className="bar-fill" style={{ width: `${(item.quantidade / max) * 100}%`, background: colors[item.status] }} /></div><b>{item.quantidade.toLocaleString("pt-BR")}</b></div>)}</div>;
}

function formatStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ANALISE: "em análise",
    ANDAMENTO: "em andamento",
    CONCLUIDO: "concluído",
    FECHADO: "fechado",
    PENDENTE: "pendente",
    DEFERIDO: "deferida",
    INDEFERIDO: "indeferida",
    CANCELADO: "cancelada",
  };

  return labels[status] ?? status.toLowerCase();
}

function CoursesPage() {
  const { token, usuario, logout } = useAuth();
  const route = useHashRoute();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getCursos(token)
      .then((result) => setCursos(result.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Falha ao carregar cursos."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleEnroll(courseId: string) {
    if (!token) return;
    setMessage("");
    setError("");
    try {
      await criarInscricao(token, courseId);
      setMessage("Inscrição realizada com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível realizar a inscrição.");
    }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="side-brand"><div className="brand-mark small">D</div><div><strong>DEPPI</strong><small>IFCE · Extensão</small></div></div>
      <nav><NavItems usuario={usuario!} active={route} /></nav>
      <button className="logout-button" onClick={logout}><span>↪</span>Sair</button>
    </aside>
    <div className="content">
      <header className="topbar"><span className="breadcrumb">☰ &nbsp; Cursos</span><div className="profile"><span className="moon">◐</span><div><strong>{usuario?.nome}</strong><small>{usuario?.cargos.join(" · ")}</small></div><div className="avatar">{usuario?.nome.charAt(0).toUpperCase()}</div></div></header>
      <main className="dashboard">
        <div className="welcome"><div><h1>Cursos</h1><p className="muted">{usuario?.cargos.includes("ALUNO") ? "Encontre uma capacitação para se inscrever." : "Acompanhe os cursos cadastrados no DEPPI."}</p></div>{usuario?.cargos.includes("PROFESSOR") || usuario?.cargos.includes("DEPPI") ? <button className="primary-button">Novo curso</button> : null}</div>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="form-error">{error}</div>}
        {loading ? <div className="loading">Carregando cursos...</div> : cursos.length === 0 ? <section className="panel empty-state"><h2>Nenhum curso encontrado</h2><p className="muted">Quando houver cursos disponíveis, eles aparecerão nesta área.</p></section> : <div className="course-grid">{cursos.map((curso) => <article className="course-card" key={curso.id}><div className="course-cover"><span>{formatStatusLabel(curso.status)}</span></div><div className="course-body"><h2>{curso.nome}</h2><p className="muted">{curso.Instituicao?.nome ?? "Instituição não informada"}{curso.Instituicao?.campus ? ` · ${curso.Instituicao.campus}` : ""}</p><div className="course-meta"><span>{curso.carga_horaria}h</span><span>{curso.vagasDisponiveis} vagas disponíveis</span></div>{usuario?.cargos.includes("ALUNO") && curso.vagasDisponiveis > 0 ? <button className="primary-button full-width" onClick={() => handleEnroll(curso.id)}>Inscrever-se</button> : null}</div></article>)}</div>}
      </main>
    </div>
  </div>;
}

function Dashboard() {
  const { token, usuario, logout } = useAuth();
  const route = useHashRoute();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getResumo(token).then((result) => setResumo(result.resumo)).catch((err) => setError(err instanceof Error ? err.message : "Falha ao carregar o resumo."));
  }, [token]);

  const totals = resumo?.totais;
  const inscricaoColors = { PENDENTE: "#c26b2a", DEFERIDO: "#3c9961", INDEFERIDO: "#c54141", CANCELADO: "#77736e" };
  const cursoColors = { ANALISE: "#c26b2a", ANDAMENTO: "#168344", CONCLUIDO: "#315bd6", FECHADO: "#858585" };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="side-brand"><div className="brand-mark small">D</div><div><strong>DEPPI</strong><small>IFCE · Extensão</small></div></div>
      <nav><NavItems usuario={usuario!} active={route} /></nav>
      <button className="logout-button" onClick={logout}><span>↪</span>Sair</button>
    </aside>
    <div className="content">
      <header className="topbar"><span className="breadcrumb">☰ &nbsp; Início</span><div className="profile"><span className="moon">◐</span><div><strong>{usuario?.nome ?? "Usuário"}</strong><small>{usuario?.cargos.join(" · ")}</small></div><div className="avatar">{usuario?.nome.charAt(0).toUpperCase()}</div></div></header>
      <main className="dashboard">
        <div className="welcome"><div><h1>Bom dia, {usuario?.nome?.split(" ")[0] ?? "usuário"}</h1><p className="muted">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div><button className="outline-button"><Icon name="chart" /> Ver relatórios</button></div>
        {error && <div className="form-error">{error}</div>}
        {!resumo && !error ? <div className="loading">Carregando resumo...</div> : totals && <><div className="stats-grid"><StatCard label="Usuários" value={totals.usuarios} /><StatCard label="Alunos" value={totals.alunos} /><StatCard label="Professores" value={totals.professores} /><StatCard label="Cursos" value={totals.cursos} /><StatCard label="Inscrições" value={totals.inscricoes} /><StatCard label="Instituições" value={totals.instituicoes} /><StatCard label="Vagas restantes" value={totals.vagasRestantes} accent /></div><div className="charts-grid"><section className="panel"><div className="panel-title"><h2>Inscrições por situação</h2><button>Detalhes</button></div><StatusBars items={resumo.inscricoesPorSituacao} colors={inscricaoColors} /></section><section className="panel"><div className="panel-title"><h2>Cursos por situação</h2></div><div className="donut-wrap"><div className="donut"><strong>{totals.cursos}</strong><span>cursos</span></div><div className="legend">{resumo.cursosPorSituacao.map((item) => <div key={item.status}><i style={{ background: cursoColors[item.status as keyof typeof cursoColors] }} />{formatStatusLabel(item.status)}<b>{item.quantidade}</b></div>)}</div></div></section></div></>}
      </main>
    </div>
  </div>;
}

export function App() {
  const { token, usuario, hasRole } = useAuth();
  const route = useHashRoute();
  if (!token) return <LoginPage />;
  if (!usuario?.cargos.length) return <ForbiddenPage />;
  if (route === "#/cursos") return <CoursesPage />;
  const protectedItem = menu.find((item) => `#/${item.label.toLowerCase()}` === route);
  if (protectedItem && !usuario.cargos.some((cargo) => protectedItem.roles.includes(cargo))) return <ForbiddenPage />;
  if (!hasRole("ADMIN")) return <RoleWorkspace />;
  if (route !== "#/") return <RoleWorkspace />;
  return <Dashboard />;
}
