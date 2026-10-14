export type Cargo = "ALUNO" | "PROFESSOR" | "DEPPI" | "ADMIN";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargos: Cargo[];
}

export interface Curso {
  id: string;
  nome: string;
  carga_horaria: number;
  vagas: number;
  status: string;
  dataInicio: string;
  dataFim: string;
  vagasOcupadas: number;
  vagasDisponiveis: number;
  Instituicao?: {
    nome: string;
    campus: string;
    cidade: string;
  };
}

export const demoResumo: Resumo = {
  geradoEm: new Date().toISOString(),
  totais: {
    usuarios: 1284,
    alunos: 1142,
    professores: 96,
    cursos: 38,
    inscricoes: 2317,
    instituicoes: 7,
    vagasRestantes: 214,
  },
  inscricoesPorSituacao: [
    { status: "PENDENTE", quantidade: 412 },
    { status: "DEFERIDO", quantidade: 1480 },
    { status: "INDEFERIDO", quantidade: 298 },
    { status: "CANCELADO", quantidade: 127 },
  ],
  cursosPorSituacao: [
    { status: "ANALISE", quantidade: 6 },
    { status: "ANDAMENTO", quantidade: 17 },
    { status: "CONCLUIDO", quantidade: 12 },
    { status: "FECHADO", quantidade: 3 },
  ],
};

export const demoCursos: Curso[] = [
  {
    id: "demo-1",
    nome: "Introdução à Programação Web",
    carga_horaria: 40,
    vagas: 30,
    vagasOcupadas: 12,
    vagasDisponiveis: 18,
    status: "ANDAMENTO",
    dataInicio: "2026-11-01",
    dataFim: "2026-12-01",
    Instituicao: { nome: "IFCE", campus: "Cedro", cidade: "Cedro" },
  },
  {
    id: "demo-2",
    nome: "Empreendedorismo e Inovação",
    carga_horaria: 20,
    vagas: 25,
    vagasOcupadas: 8,
    vagasDisponiveis: 17,
    status: "ANDAMENTO",
    dataInicio: "2026-11-10",
    dataFim: "2026-11-30",
    Instituicao: { nome: "IFCE", campus: "Cedro", cidade: "Cedro" },
  },
];

export interface Resumo {
  geradoEm: string;
  totais: {
    usuarios: number;
    alunos: number;
    professores: number;
    cursos: number;
    inscricoes: number;
    instituicoes: number;
    vagasRestantes: number;
  };
  inscricoesPorSituacao: Array<{ status: string; quantidade: number }>;
  cursosPorSituacao: Array<{ status: string; quantidade: number }>;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`/api${path}`, { ...options, headers });
  const body = await response.json().catch(() => null) as
    | { mensagem?: string; message?: string }
    | null;

  if (!response.ok) {
    const error = new Error(
      body?.mensagem ?? body?.message ?? "Não foi possível concluir a operação.",
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return body as T;
}

export function login(email: string, senha: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export function getResumo(token: string) {
  if (token.startsWith("demo-")) return Promise.resolve({ resumo: demoResumo });
  return request<{ resumo: Resumo }>("/admin/relatorios/resumo", {}, token);
}

export function getCursos(token: string) {
  if (token.startsWith("demo-")) return Promise.resolve({ data: demoCursos });
  return request<{ data: Curso[] }>("/cursos", {}, token);
}

export function criarInscricao(token: string, cursoId: string) {
  if (token.startsWith("demo-")) return Promise.resolve({ mensagem: `Inscrição demonstrativa criada para ${cursoId}` });
  return request("/inscricoes", {
    method: "POST",
    body: JSON.stringify({ cursoId }),
  }, token);
}
