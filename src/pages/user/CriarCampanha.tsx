import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label, FieldError, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import type { Campanha, TipoCampanhaItem } from "@/types";

const baseSchema = z
  .object({
    nome: z.string().min(3, "Mínimo 3 caracteres"),
    descricao: z.string().optional(),
    codigoConvite: z
      .string()
      .min(4, "Mínimo 4 caracteres")
      .regex(/^[A-Za-z0-9_-]+$/, "Use letras, números, _ ou -"),
    valorAposta: z.coerce.number().min(0.01, "Valor deve ser maior que 0"),
    dt_inicio: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Data/hora inválida",
    }),
    dt_fim: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Data/hora inválida",
    }),
    // No CriarCampanha.tsx, no baseSchema, adicione:
    opcoes: z
      .array(z.object({ descricao: z.string().min(1, "Obrigatório") }))
      .min(2, "Adicione ao menos 2 opções")
      .refine(
        (items) => {
          const descs = items.map(i => i.descricao.trim().toUpperCase());
          return descs.length === new Set(descs).size;
        },
        { message: "Opções não podem ter descrições duplicadas" }
      ),
  })
  .refine(
    (data) => {
      const inicio = new Date(data.dt_inicio);
      const fim = new Date(data.dt_fim);
      const agora = new Date();
      return inicio > agora && fim > inicio;
    },
    {
      message: "Data de início deve ser futura e data de fim deve ser após o início",
      path: ["dt_inicio"],
    }
  );

export function CampanhaForm({
  permitirEscolherTipo,
  onSubmitted,
}: {
  permitirEscolherTipo: boolean;
  onSubmitted?: (c: Campanha) => void;
}) {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<"PUBLICA" | "PRIVADA">("PUBLICA");

  // Buscar tipos de campanha ativos do backend
  const { data: tipos, isLoading: tiposLoading } = useQuery({
    queryKey: ["tipos-campanha"],
    queryFn: async () => {
      const response = await api.get<{ data: TipoCampanhaItem[] }>("/listar-tipos-campanha");
      return response.data.data;
    },
  });

  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      codigoConvite: "",
      valorAposta: 10,
      dt_inicio: "",
      dt_fim: "",
      opcoes: [{ descricao: "" }, { descricao: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "opcoes",
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof baseSchema>) => {
      if (!tipos || tipos.length === 0) {
        throw new Error("Nenhum tipo de campanha cadastrado.");
      }

      let tipoNome: "PUBLICA" | "PRIVADA";
      if (permitirEscolherTipo) {
        tipoNome = tipo; // ADMIN escolheu
      } else {
        tipoNome = "PRIVADA"; // USER forçado
      }

      const tipoSelecionado = tipos.find(
        (t) => t.descricao?.toUpperCase() === tipoNome
      );
      if (!tipoSelecionado) {
        throw new Error(`Tipo "${tipoNome}" não encontrado no banco.`);
      }

      const payload = {
        nome: values.nome,
        dt_inicio: new Date(values.dt_inicio).toISOString(),
        dt_fim: new Date(values.dt_fim).toISOString(),
        taxa_operacional: 0,
        valor_bolao: values.valorAposta,
        codigo_campanha: values.codigoConvite,
        tipo_campanha_id: tipoSelecionado.id, // ID real
        opcoes: values.opcoes.map(o => o.descricao),
      };

      const { data } = await api.post<Campanha>("/campanhas", payload);
      return data;
    },
    onSuccess: (c) => {
      toast.success("Campanha criada!");
      if (onSubmitted) onSubmitted(c);
      else navigate(`/campanhas/codigo/${c.codigoConvite}`);
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Erro ao criar campanha")),
  });

  if (tiposLoading) {
    return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  }

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-5"
    >
      {permitirEscolherTipo ? (
        <div className="space-y-1.5">
          <Label>Tipo da campanha</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["PUBLICA", "PRIVADA"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTipo(t)}
                className={[
                  "rounded-xl border-2 p-3 text-sm font-semibold transition-all",
                  tipo === t
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                ].join(" ")}
              >
                {t === "PUBLICA" ? "Pública" : "Privada"}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Como usuário, sua campanha será criada como <strong>Privada</strong>.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" {...form.register("nome")} />
          <FieldError message={form.formState.errors.nome?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="codigoConvite">Código de convite</Label>
          <Input
            id="codigoConvite"
            className="uppercase tracking-wider font-mono"
            {...form.register("codigoConvite")}
          />
          <FieldError message={form.formState.errors.codigoConvite?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" {...form.register("descricao")} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="valorAposta">Valor da aposta (R$)</Label>
          <Input
            id="valorAposta"
            type="number"
            step="0.01"
            min="0"
            {...form.register("valorAposta")}
          />
          <FieldError message={form.formState.errors.valorAposta?.message} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dt_inicio">Início da campanha</Label>
          <Input
            id="dt_inicio"
            type="datetime-local"
            {...form.register("dt_inicio")}
          />
          <FieldError message={form.formState.errors.dt_inicio?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dt_fim">Fim da campanha</Label>
          <Input
            id="dt_fim"
            type="datetime-local"
            {...form.register("dt_fim")}
          />
          <FieldError message={form.formState.errors.dt_fim?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Opções de aposta</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ descricao: "" })}
          >
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((f, idx) => (
            <div key={f.id} className="flex gap-2">
              <Input
                placeholder={`Opção ${idx + 1}`}
                {...form.register(`opcoes.${idx}.descricao` as const)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fields.length > 2 && remove(idx)}
                disabled={fields.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <FieldError
          message={form.formState.errors.opcoes?.message as string | undefined}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={mutation.isPending}
      >
        Criar campanha
      </Button>
    </form>
  );
}

export default function CriarCampanha() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <CampanhaForm permitirEscolherTipo={false} />
        </CardContent>
      </Card>
    </div>
  );
}