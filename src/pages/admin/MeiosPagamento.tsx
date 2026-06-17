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
import type { MeioPagamento } from "@/types";

const schema = z.object({
  descricao: z.string().min(2, "Informe a descrição"),
  chave: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function MeiosPagamento() {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "meios-pagamento"],
    queryFn: async () => {
      const response = await api.get<{ data: MeioPagamento[] }>("/meios-pagamento");
      // Mapeia para incluir 'nome' (derivado de descricao) e 'ativo' (derivado de status)
      return response.data.data.map((item) => ({
        ...item,
        nome: item.descricao,
        ativo: item.status === "ATIVO",
      }));
    },
  });

  const createM = useMutation({
    mutationFn: async (v: FormData) => {
      const { data } = await api.post("/meios-pagamento", { descricao: v.descricao });
      return data;
    },
    onSuccess: () => {
      toast.success("Meio de pagamento criado.");
      reset({ descricao: "", chave: "" });
      qc.invalidateQueries({ queryKey: ["admin", "meios-pagamento"] });
      qc.invalidateQueries({ queryKey: ["meios-pagamento"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro")),
  });

  const toggleM = useMutation({
    mutationFn: async (m: MeioPagamento & { ativo: boolean }) => {
      // Envia o status correto (ATIVO ou INATIVO)
      const novoStatus = m.ativo ? "INATIVO" : "ATIVO";
      const { data } = await api.patch(`/meios-pagamento/${m.id}`, { status: novoStatus });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "meios-pagamento"] });
      qc.invalidateQueries({ queryKey: ["meios-pagamento"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro")),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-4xl">Meios de pagamento</h1>
        <p className="text-sm text-muted-foreground">
          Adicione chaves PIX, contas bancárias ou outros métodos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar novo</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) => createM.mutate(v))}
            className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
          >
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Nome</Label>
              <Input id="descricao" placeholder="Ex: PIX, Banco X" {...register("descricao")} />
              <FieldError message={errors.descricao?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chave">Chave / detalhe</Label>
              <Input id="chave" placeholder="chave-pix@email.com" {...register("chave")} />
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
            <p className="text-sm text-muted-foreground">Nenhum meio cadastrado.</p>
          ) : (
            data.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-semibold">{m.nome}</p>
                  {m.chave ? <p className="text-xs text-muted-foreground">{m.chave}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={m.ativo ? "success" : "neutral"}>
                    {m.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleM.mutate(m)}>
                    {m.ativo ? "Inativar" : "Ativar"}
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