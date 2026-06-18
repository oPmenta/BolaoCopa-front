import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Settings2, Upload, Trophy } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Form";
import {
  StatusCampanhaBadge,
  TipoCampanhaBadge,
} from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { Aposta, Campanha, OpcaoAposta } from "@/types";

export default function CampanhaDetalhe() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [idOpcao, setIdOpcao] = useState<string | number | "">("");
  const [comprovante, setComprovante] = useState<File | null>(null);

  const { data: campanha, isLoading, isError } = useQuery({
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

  const { data: minhasApostas, refetch: refetchMinhasApostas } = useQuery({
    queryKey: ["apostas", "usuario", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: Aposta[] }>(
        `/apostas/usuario/${user.id}`
      );
      return response.data.data;
    },
  });

  const minhasNestaCampanha = (minhasApostas ?? []).filter(
    (a) => String(a.idCampanha) === String(campanha?.id)
  );

  const apostaConfirmada = minhasNestaCampanha.find(
    (a) => a.status === "CONFIRMADA"
  );
  const apostaRejeitada = minhasNestaCampanha.find(
    (a) => a.status === "REJEITADA"
  );
  const apostaAtiva = minhasNestaCampanha.find(
    (a) => a.status === "PENDENTE" || a.status === "AGUARDANDO_VALIDACAO"
  );

  useEffect(() => {
    if (apostaAtiva) {
      setIdOpcao(apostaAtiva.idOpcao);
    } else {
      setIdOpcao("");
    }
  }, [apostaAtiva]);

  const criarMutation = useMutation({
    mutationFn: async () => {
      if (!campanha) throw new Error("Campanha não carregada");
      if (!idOpcao) throw new Error("Escolha uma opção");
      const form = new FormData();
      form.append("campanha_opcao_id", String(idOpcao));
      if (comprovante) form.append("comprovante", comprovante);
      const { data } = await api.post("/apostas", form);
      return data;
    },
    onSuccess: () => {
      toast.success("Aposta criada com sucesso!");
      setIdOpcao("");
      setComprovante(null);
      refetchMinhasApostas();
      qc.invalidateQueries({ queryKey: ["apostas", "usuario", user?.id] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro ao criar aposta")),
  });

  const editarMutation = useMutation({
    mutationFn: async () => {
      if (!campanha) throw new Error("Campanha não carregada");
      if (!apostaAtiva) throw new Error("Nenhuma aposta ativa para editar");
      if (!idOpcao) throw new Error("Escolha uma opção");
      const form = new FormData();
      form.append("campanha_opcao_id", String(idOpcao));
      if (comprovante) form.append("comprovante", comprovante);
      const { data } = await api.patch(`/apostas/${apostaAtiva.id}`, form);
      return data;
    },
    onSuccess: () => {
      toast.success("Aposta atualizada com sucesso!");
      setComprovante(null);
      refetchMinhasApostas();
      qc.invalidateQueries({ queryKey: ["apostas", "usuario", user?.id] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro ao editar aposta")),
  });

  const handleSubmit = () => {
    if (apostaAtiva) {
      editarMutation.mutate();
    } else {
      criarMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  }
  if (isError || !campanha) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              Campanha não encontrada. Confira o código de convite.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eOCriador =
    user?.id !== undefined && String(campanha.criadorId ?? campanha.criador?.id) === String(user.id);
  const opcoesLista = opcoes ?? campanha.opcoes ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        {eOCriador ? (
          <Link to={`/campanhas/${campanha.codigoConvite}/gerenciar`}>
            <Button
              variant="secondary"
              size="sm"
              className="hover:bg-secondary hover:text-secondary-foreground hover:opacity-100"
            >
              <Settings2 className="h-4 w-4" />
              Gerenciar campanha
            </Button>
          </Link>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-brasil bg-stripes-brasil flex items-end p-5">
          <div className="flex gap-2">
            <TipoCampanhaBadge tipo={campanha.tipo} />
            <StatusCampanhaBadge status={campanha.status} />
          </div>
        </div>
        <CardContent className="pt-5 space-y-3">
          <h1 className="text-4xl">{campanha.nome}</h1>
          {campanha.descricao ? (
            <p className="text-muted-foreground">{campanha.descricao}</p>
          ) : null}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span>
              <span className="text-muted-foreground">Código:</span>{" "}
              <code className="font-mono">{campanha.codigoConvite}</code>
            </span>
            <span>
              <span className="text-muted-foreground">Valor:</span>{" "}
              <strong className="text-primary">{formatCurrency(campanha.valorAposta ?? 0)}</strong>
            </span>
            {campanha.criador?.nome ? (
              <span>
                <span className="text-muted-foreground">Criador:</span> {campanha.criador.nome}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {apostaConfirmada
                ? "Aposta confirmada"
                : apostaAtiva
                  ? "Editar aposta"
                  : "Fazer aposta"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {eOCriador && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                🔧 Você é o criador da campanha. Use o botão <strong>"Gerenciar campanha"</strong> no topo para administrar as apostas.
              </div>
            )}

            {campanha.status !== "ABERTA" ? (
              <p className="text-sm text-muted-foreground">
                Esta campanha não está aceitando novas apostas.
              </p>
            ) : apostaConfirmada ? (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50 text-green-700">
                <p className="font-semibold">✅ Sua aposta foi confirmada!</p>
                <p className="text-sm">
                  Você já apostou nesta campanha e não pode fazer uma nova aposta.
                </p>
                {apostaConfirmada.opcao?.descricao && (
                  <div className="mt-2 text-xs">
                    Opção escolhida: <strong>{apostaConfirmada.opcao.descricao}</strong>
                  </div>
                )}
              </div>
            ) : (
              <>
                {apostaRejeitada && (
                  <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-red-700 mb-3">
                    <p className="font-semibold">❌ Sua aposta anterior foi rejeitada.</p>
                    <p className="text-sm">Você pode fazer uma nova aposta.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Escolha sua opção</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {opcoesLista.map((op) => {
                      const selected = String(idOpcao) === String(op.id);
                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => setIdOpcao(op.id)}
                          className={[
                            "rounded-xl border-2 p-3 text-left transition-all",
                            selected
                              ? "border-primary bg-primary/5 shadow-elegant"
                              : "border-border hover:border-primary/50",
                          ].join(" ")}
                        >
                          <span className="font-semibold">{op.descricao}</span>
                          {op.ehVencedora ? (
                            <Trophy className="h-4 w-4 text-yellow-500 ml-2" />
                          ) : null}
                        </button>
                      );
                    })}
                    {!opcoesLista.length && (
                      <p className="text-sm text-muted-foreground col-span-full">
                        O criador ainda não cadastrou opções de aposta.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="chavePix">Chave PIX do criador</Label>
                  <Input
                    id="chavePix"
                    value={campanha.meio_pagamento?.chave || "Chave não cadastrada"}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Realize o pagamento para esta chave e anexe o comprovante.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="comprovante">
                    <span className="inline-flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" />{" "}
                      {apostaAtiva ? "Novo comprovante (opcional)" : "Comprovante (opcional)"}
                    </span>
                  </Label>
                  <Input
                    id="comprovante"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setComprovante(e.target.files?.[0] ?? null)}
                  />
                </div>

                {apostaAtiva && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>Status atual: </span>
                    <StatusApostaInline status={apostaAtiva.status} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="lg"
                    className="flex-1"
                    loading={criarMutation.isPending || editarMutation.isPending}
                    disabled={!idOpcao}
                    onClick={handleSubmit}
                  >
                    {apostaAtiva ? "Salvar alterações" : "Confirmar aposta"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minha aposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {minhasNestaCampanha.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você ainda não apostou.</p>
            ) : (
              minhasNestaCampanha.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-border p-3 text-sm space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {a.opcao?.descricao ??
                        opcoesLista.find((o) => String(o.id) === String(a.idOpcao))?.descricao ??
                        "Opção"}
                    </span>
                    <StatusApostaInline status={a.status} />
                  </div>

                  {!a.comprovante && a.status === "PENDENTE" && (
                    <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800">
                      ⚠️ Você precisa anexar um comprovante de pagamento para que sua aposta seja validada pelo criador da campanha.
                    </div>
                  )}

                  {!a.comprovante && a.status === "PENDENTE" && (
                    <ReanexarComprovante apostaId={a.id} />
                  )}

                  {a.comprovante && (
                    <a
                      href={
                        a.comprovante.startsWith("http")
                          ? a.comprovante
                          : `${import.meta.env.VITE_API_URL}${a.comprovante}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-primary hover:underline block mt-1"
                    >
                      Ver comprovante
                    </a>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusApostaInline({ status }: { status: Aposta["status"] }) {
  const labels: Record<Aposta["status"], string> = {
    PENDENTE: "Pendente",
    AGUARDANDO_VALIDACAO: "Aguardando validação",
    CONFIRMADA: "Confirmada",
    REJEITADA: "Rejeitada",
  };
  const classes: Record<Aposta["status"], string> = {
    PENDENTE: "text-muted-foreground",
    AGUARDANDO_VALIDACAO: "text-[hsl(var(--warning))]",
    CONFIRMADA: "text-[hsl(var(--success))]",
    REJEITADA: "text-destructive",
  };
  return <span className={`text-xs font-semibold ${classes[status]}`}>{labels[status]}</span>;
}

function ReanexarComprovante({ apostaId }: { apostaId: Aposta["id"] }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const m = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("comprovante", file);
      const { data } = await api.patch(`/apostas/${apostaId}/comprovante`, form);
      return data;
    },
    onSuccess: () => {
      toast.success("Comprovante enviado.");
      qc.invalidateQueries({ queryKey: ["apostas", "usuario", user?.id] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro ao enviar")),
  });
  return (
    <Input
      type="file"
      accept="image/*,application/pdf"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) m.mutate(f);
      }}
    />
  );
}