import { Badge } from "@/components/ui/Badge";
import type { StatusAposta, StatusCampanha, TipoCampanha } from "@/types";

export function StatusApostaBadge({ status }: { status: StatusAposta }) {
  switch (status) {
    case "PENDENTE":
      return <Badge tone="neutral">Pendente</Badge>;
    case "AGUARDANDO_VALIDACAO":
      return <Badge tone="warning">Aguardando validação</Badge>;
    case "CONFIRMADA":
      return <Badge tone="success">Confirmada</Badge>;
    case "REJEITADA":
      return <Badge tone="destructive">Rejeitada</Badge>;
  }
}

export function StatusCampanhaBadge({ status }: { status: StatusCampanha }) {
  switch (status) {
    case "ABERTA":
      return <Badge tone="success">Aberta</Badge>;
    case "EM_APURACAO":
      return <Badge tone="warning">Em apuração</Badge>;
    case "ENCERRADA":
      return <Badge tone="neutral">Encerrada</Badge>;
  }
}

export function TipoCampanhaBadge({ tipo }: { tipo: TipoCampanha }) {
  return tipo === "PUBLICA" ? (
    <Badge tone="info">Pública</Badge>
  ) : (
    <Badge tone="warning">Privada</Badge>
  );
}
