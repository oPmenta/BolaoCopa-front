import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label, FieldError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { TipoCampanhaItem } from "@/types";

const schema = z.object({ nome: z.string().min(2, "Informe o nome") });
type FormData = z.infer<typeof schema>;

export default function TiposCampanha() {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tipos-campanha"],
    queryFn: async () => {
      const response = await api.get<{ data: TipoCampanhaItem[] }>("/listar-tipos-campanha");
      return response.data.data;
    },
  });

  const createM = useMutation({
    mutationFn: async (v: FormData) => {
      const { data } = await api.post("/tipos-campanha", v);
      return data;
    },
    onSuccess: () => {
      toast.success("Tipo criado.");
      reset({ nome: "" });
      qc.invalidateQueries({ queryKey: ["admin", "tipos-campanha"] });
      qc.invalidateQueries({ queryKey: ["tipos-campanha"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro")),
  });

  const toggleM = useMutation({
    mutationFn: async (t: TipoCampanhaItem) => {
      const { data } = await api.patch(`/tipos-campanha/${t.id}`, { ativo: !t.ativo });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tipos-campanha"] });
      qc.invalidateQueries({ queryKey: ["tipos-campanha"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro")),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-4xl">Tipos de campanha</h1>
        <p className="text-sm text-muted-foreground">
          Categorias usadas para classificar os bolões (Ex: Copa, Libertadores).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar novo</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) => createM.mutate(v))}
            className="grid sm:grid-cols-[1fr_auto] gap-3 items-end"
          >
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Ex: Copa do Mundo" {...register("nome")} />
              <FieldError message={errors.nome?.message} />
            </div>
            <Button type="submit" variant="default" loading={createM.isPending}>
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum tipo cadastrado.</p>
          ) : (
            data.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <p className="font-semibold">{t.nome}</p>
                <div className="flex items-center gap-3">
                  <Badge tone={t.ativo ? "success" : "neutral"}>
                    {t.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleM.mutate(t)}>
                    {t.ativo ? "Inativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
