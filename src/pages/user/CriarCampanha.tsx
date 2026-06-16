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
import { Label, FieldError, Select, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import type { Campanha, TipoCampanhaItem } from "@/types";

const baseSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres"),
  descricao: z.string().optional(),
  codigoConvite: z
    .string()
    .min(4, "Mínimo 4 caracteres")
    .regex(/^[A-Za-z0-9_-]+$/i, "Use letras, números, _ ou -"),
  valorAposta: z.coerce.number().min(0, "Valor inválido"),
  opcoes: z
    .array(z.object({ descricao: z.string().min(1, "Obrigatório") }))
    .min(2, "Adicione ao menos 2 opções"),
});

export function CampanhaForm({
  permitirEscolherTipo,
  onSubmitted,
}: {
  permitirEscolherTipo: boolean;
  onSubmitted?: (c: Campanha) => void;
}) {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<"PUBLICA" | "PRIVADA">("PUBLICA");

  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      codigoConvite: "",
      valorAposta: 10,
      opcoes: [{ descricao: "" }, { descricao: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "opcoes" });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof baseSchema>) => {
      const tipoCampanhaId = tipo === "PUBLICA" ? 1 : 2;
      const payload = { ...values, tipo_campanha_id: tipoCampanhaId };
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

  return (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
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
          Como usuário, sua campanha será criada como <strong>Pública</strong>.
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
        <FieldError message={form.formState.errors.opcoes?.message as string | undefined} />
      </div>

      <Button type="submit" size="lg" className="w-full">
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
