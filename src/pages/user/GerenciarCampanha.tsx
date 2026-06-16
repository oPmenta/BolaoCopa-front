import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Check, X, Trophy } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusApostaBadge, StatusCampanhaBadge } from "@/components/StatusBadge";
import type { Aposta, Campanha, OpcaoAposta } from "@/types";

export default function GerenciarCampanha() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: campanha } = useQuery({
    queryKey: ["campanha", "codigo", codigo],
    enabled: !!codigo,
    queryFn: async () => {
      const response = await api.get<{ data: Campanha }>(`/campanhas/codigo/${codigo}`);
      return response.data.data;
    },
  });

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

  const { data: apostas, isError: apostasErro } = useQuery({
    queryKey: ["campanha", campanha?.id, "apostas"],
    enabled: !!campanha?.id,
    queryFn: async () => {
      if (!campanha) throw new Error("Campanha não carregada");
      const response = await api.get<{ data: Aposta[] }>(
        `/campanhas/${campanha.id}/apostas`
      );
      return response.data.data;
    },
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: async (vars: { idAposta: Aposta["id"]; status: Aposta["status"] }) => {
      const { data } = await api.patch(`/apostas/${vars.idAposta}/status`, {
        status: vars.status,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Status atualizado.");
      qc.invalidateQueries({ queryKey: ["campanha", campanha?.id, "apostas"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro ao atualizar")),
  });

  const resultadoMutation = useMutation({
    mutationFn: async (idOpcao: OpcaoAposta["id"]) => {
      if (!campanha) throw new Error("Campanha não carregada");
      const { data } = await api.patch(
        `/campanhas/${campanha.id}/definir-resultado`,
        { idOpcao }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Resultado definido!");
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
      toast.success("Status da campanha atualizado.");
      qc.invalidateQueries({ queryKey: ["campanha", "codigo", codigo] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro")),
  });

  if (!campanha) return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>{campanha.nome}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Código: <code className="font-mono">{campanha.codigoConvite}</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusCampanhaBadge status={campanha.status} />
            {campanha.status === "ABERTA" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusCampanhaMutation.mutate("EM_APURACAO")}
              >
                Encerrar apostas
              </Button>
            ) : campanha.status === "EM_APURACAO" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => statusCampanhaMutation.mutate("ENCERRADA")}
              >
                Encerrar campanha
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Definir resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {(opcoes ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem opções cadastradas.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {(opcoes ?? []).map((op) => (
                <button
                  key={op.id}
                  onClick={() => resultadoMutation.mutate(op.id)}
                  className={[
                    "rounded-xl border-2 p-3 text-left transition-all flex items-center justify-between",
                    op.ehVencedora
                      ? "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)]"
                      : "border-border hover:border-primary/50",
                  ].join(" ")}
                >
                  <span className="font-semibold">{op.descricao}</span>
                  {op.ehVencedora ? (
                    <Trophy className="h-4 w-4 text-[hsl(var(--success))]" />
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apostas recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          {apostasErro ? (
            <p className="text-sm text-muted-foreground">
              O backend ainda não tem <code>GET /campanhas/:id/apostas</code>. Implemente esse endpoint para listar aqui.
            </p>
          ) : !apostas?.length ? (
            <p className="text-sm text-muted-foreground">Nenhuma aposta ainda.</p>
          ) : (
            <div className="space-y-2">
              {apostas.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-semibold">{a.usuario?.nome ?? `Usuário #${a.idUsuario}`}</p>
                    <p className="text-xs text-muted-foreground">
                      Opção:{" "}
                      {a.opcao?.descricao ??
                        (opcoes ?? []).find((o) => String(o.id) === String(a.idOpcao))?.descricao ??
                        "—"}
                    </p>
                  </div>
                  <StatusApostaBadge status={a.status} />
                  {a.comprovante ? (
                    <a
                      href={
                        a.comprovante.startsWith("http")
                          ? a.comprovante
                          : `${import.meta.env.VITE_API_URL}/uploads/${a.comprovante}`
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default" // <-- alterado de "primary" para "default"
                      disabled={a.status === "CONFIRMADA"}
                      onClick={() =>
                        statusMutation.mutate({ idAposta: a.id, status: "CONFIRMADA" })
                      }
                    >
                      <Check className="h-4 w-4" /> Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={a.status === "REJEITADA"}
                      onClick={() =>
                        statusMutation.mutate({ idAposta: a.id, status: "REJEITADA" })
                      }
                    >
                      <X className="h-4 w-4" /> Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        <Link to={`/campanhas/codigo/${campanha.codigoConvite}`} className="hover:underline">
          ← Voltar para a página pública da campanha
        </Link>
      </p>
    </div>
  );
}