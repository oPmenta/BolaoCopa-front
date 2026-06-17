import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Check, X, Trophy, Clock, AlertCircle,
  CheckCircle, XCircle, RefreshCw
} from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusCampanhaBadge } from "@/components/StatusBadge";
import type { Aposta, Campanha, OpcaoAposta } from "@/types";

export default function GerenciarCampanha() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  // Buscar campanha
  const { data: campanha, isLoading } = useQuery({
    queryKey: ["campanha", "codigo", codigo],
    enabled: !!codigo,
    queryFn: async () => {
      const response = await api.get<{ data: Campanha }>(`/campanhas/codigo/${codigo}`);
      return response.data.data;
    },
  });

  // Buscar opções
  const { data: opcoes } = useQuery({
    queryKey: ["campanha", campanha?.id, "opcoes"],
    enabled: !!campanha?.id,
    queryFn: async () => {
      if (!campanha) throw new Error("Campanha não carregada");
      const response = await api.get<{ data: OpcaoAposta[] }>(
        `/campanhas/${campanha.id}/opcoes`
      );
      return response.data.data;
    },
  });

  // 🔁 BUSCAR APOSTAS DA CAMPANHA (USANDO NOVA ROTA)
  const { data: apostas, isError: apostasErro, refetch: refetchApostas } = useQuery({
    queryKey: ["apostas", "campanha", campanha?.id],
    enabled: !!campanha?.id,
    queryFn: async () => {
      if (!campanha) throw new Error("Campanha não carregada");
      const response = await api.get<{ data: Aposta[] }>(
        `/apostas/campanha/${campanha.id}` // ✅ NOVA ROTA
      );
      return response.data.data;
    },
    retry: false,
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: async (vars: { idAposta: Aposta["id"]; status: Aposta["status"] }) => {
      const { data } = await api.patch(`/apostas/${vars.idAposta}/status`, {
        status: vars.status,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Status da aposta atualizado!");
      refetchApostas(); // Recarrega a lista
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro ao atualizar")),
  });

  const resultadoMutation = useMutation({
    mutationFn: async (idOpcao: OpcaoAposta["id"]) => {
      if (!campanha) throw new Error("Campanha não carregada");
      const { data } = await api.patch(
        `/campanhas/${campanha.id}/definir-resultado`,
        { opcao_id: idOpcao }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Resultado definido com sucesso!");
      qc.invalidateQueries({ queryKey: ["campanha"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro ao definir resultado")),
  });

  const statusCampanhaMutation = useMutation({
    mutationFn: async (status: Campanha["status"]) => {
      if (!campanha) throw new Error("Campanha não carregada");
      const { data } = await api.patch(`/campanhas/${campanha.id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      toast.success("Status da campanha atualizado!");
      qc.invalidateQueries({ queryKey: ["campanha", "codigo", codigo] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro")),
  });

  // --- VERIFICAÇÃO DE PERMISSÃO ---
  if (isLoading) {
    return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  }

  if (!campanha) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Campanha não encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔑 Verificação robusta de criador
  const isCriador =
    user?.id !== undefined &&
    String(campanha.criadorId ?? campanha.criador?.id) === String(user.id);

  if (!isCriador) {
    toast.error("Você não tem permissão para gerenciar esta campanha.");
    return <Navigate to={`/campanhas/codigo/${campanha.codigoConvite}`} replace />;
  }

  // Mapeamento de status
  const statusConfig: Record<Aposta["status"], { label: string; icon: React.ReactNode; tone: "default" | "success" | "warning" | "destructive" | "info" | "neutral" }> = {
    PENDENTE: {
      label: "Pendente",
      icon: <Clock className="h-3.5 w-3.5" />,
      tone: "neutral",
    },
    AGUARDANDO_VALIDACAO: {
      label: "Aguardando validação",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      tone: "warning",
    },
    CONFIRMADA: {
      label: "Confirmada",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      tone: "success",
    },
    REJEITADA: {
      label: "Rejeitada",
      icon: <XCircle className="h-3.5 w-3.5" />,
      tone: "destructive",
    },
  };

  // Função de confirmação para mudança de status
  const handleStatusChange = (aposta: Aposta, novoStatus: "CONFIRMADA" | "REJEITADA") => {
    const confirmar = window.confirm(
      `Tem certeza que deseja ${novoStatus === "CONFIRMADA" ? "aprovar" : "rejeitar"} a aposta #${aposta.id}?`
    );
    if (confirmar) {
      statusMutation.mutate({ idAposta: aposta.id, status: novoStatus });
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Link to={`/campanhas/codigo/${campanha.codigoConvite}`}>
          <Button variant="outline" size="sm">Ver página pública</Button>
        </Link>
        <span className="text-xs text-muted-foreground ml-auto">
          Criador: {campanha.criador?.nome || "Você"}
        </span>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>{campanha.nome}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Código: <code className="font-mono">{campanha.codigoConvite}</code>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusCampanhaBadge status={campanha.status} />
            {campanha.status === "ABERTA" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusCampanhaMutation.mutate("FECHADA")}
                disabled={statusCampanhaMutation.isPending}
              >
                {statusCampanhaMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Fechar apostas"
                )}
              </Button>
            ) : campanha.status === "FECHADA" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusCampanhaMutation.mutate("ENCERRADA")}
                disabled={statusCampanhaMutation.isPending}
              >
                {statusCampanhaMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Encerrar campanha"
                )}
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Definir resultado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campanha.status !== "ENCERRADA" ? (
            <p className="text-sm text-muted-foreground">
              {campanha.status === "ABERTA"
                ? "A campanha ainda está aberta para apostas. Encerre as apostas primeiro."
                : "A campanha está em apuração. Defina o resultado ou encerre a campanha."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">
              Selecione a opção vencedora para esta campanha.
            </p>
          )}
          {(opcoes ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem opções cadastradas.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {(opcoes ?? []).map((op) => (
                <button
                  key={op.id}
                  onClick={() => {
                    if (campanha.status === "ENCERRADA") {
                      resultadoMutation.mutate(op.id);
                    } else {
                      toast.warning("A campanha precisa estar ENCERRADA para definir o resultado.");
                    }
                  }}
                  className={[
                    "rounded-xl border-2 p-3 text-left transition-all flex items-center justify-between",
                    op.ehVencedora
                      ? "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)] shadow-elegant"
                      : "border-border hover:border-primary/50",
                    campanha.status !== "ENCERRADA" ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  ].join(" ")}
                  disabled={campanha.status !== "ENCERRADA"}
                >
                  <span className="font-semibold">{op.descricao}</span>
                  {op.ehVencedora ? (
                    <Badge tone="success" className="gap-1">
                      <Trophy className="h-3.5 w-3.5" /> Vencedora
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Opção</Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Apostas recebidas
            <Badge tone="default" className="ml-auto">
              {apostas?.length || 0} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apostasErro ? (
            <p className="text-sm text-muted-foreground">
              O backend ainda não tem <code>GET /apostas/campanha/:id</code>. Implemente esse endpoint para listar aqui.
            </p>
          ) : !apostas?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma aposta recebida ainda.</p>
              <p className="text-xs">Compartilhe o código de convite para atrair participantes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apostas.map((a) => {
                const status = statusConfig[a.status] || statusConfig.PENDENTE;
                const opcaoDescricao =
                  a.opcao?.descricao ??
                  (opcoes ?? []).find((o) => String(o.id) === String(a.idOpcao))?.descricao ??
                  "Opção desconhecida";

                return (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4 transition-all hover:bg-muted/30"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <p className="font-semibold text-foreground">
                        {a.usuario?.nome ?? `Usuário #${a.idUsuario}`}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="font-medium">Opção:</span> {opcaoDescricao}
                      </p>
                      {a.criadoEm && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.criadoEm).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>

                    <Badge tone={status.tone} className="gap-1 px-3 py-1">
                      {status.icon}
                      {status.label}
                    </Badge>

                    {a.comprovante ? (
                      <a
                        href={
                          a.comprovante.startsWith("http")
                            ? a.comprovante
                            : `${import.meta.env.VITE_API_URL}${a.comprovante}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-secondary hover:underline"
                      >
                        Ver comprovante
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem comprovante</span>
                    )}

                    <div className="flex gap-2 ml-auto">
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1"
                        disabled={a.status === "CONFIRMADA" || a.status === "REJEITADA"}
                        onClick={() => handleStatusChange(a, "CONFIRMADA")}
                      >
                        <Check className="h-4 w-4" /> Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        disabled={a.status === "CONFIRMADA" || a.status === "REJEITADA"}
                        onClick={() => handleStatusChange(a, "REJEITADA")}
                      >
                        <X className="h-4 w-4" /> Rejeitar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}