export type Role = "ADMIN" | "USER";

export interface Usuario {
  id: number | string;
  nome: string;
  email: string;
  tipo_usuario: Role;
}

export type TipoCampanha = "PUBLICA" | "PRIVADA";

export type StatusCampanha = "ABERTA" | "EM_APURACAO" | "ENCERRADA";

export type StatusAposta =
  | "PENDENTE"
  | "AGUARDANDO_VALIDACAO"
  | "CONFIRMADA"
  | "REJEITADA";

export interface Campanha {
  id: number | string;
  nome: string;
  descricao?: string | null;
  tipo: TipoCampanha;
  codigoConvite: string;
  valorAposta?: number | null;
  status: StatusCampanha;
  criadorId?: number | string;
  criador?: { id: number | string; nome: string };
  idTipoCampanha?: number | string;
  tipoCampanha?: { id: number | string; nome: string };
  dataInicio?: string;
  dataFim?: string;
  opcoes?: OpcaoAposta[];
}

export interface OpcaoAposta {
  id: number | string;
  descricao: string;
  ehVencedora?: boolean;
}

export interface MeioPagamento {
  id: number | string;
  nome: string;
  chave?: string | null;
  ativo: boolean;
}

export interface TipoCampanhaItem {
  id: number | string;
  descricao: string;
  ativo: boolean;
}

export interface Aposta {
  id: number | string;
  idCampanha: number | string;
  idUsuario: number | string;
  idOpcao: number | string;
  status: StatusAposta;
  comprovante?: string | null;
  criadoEm?: string;
  campanha?: Campanha;
  opcao?: OpcaoAposta;
  usuario?: Usuario;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    usuario: Usuario;
  };
}
