import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CampanhaCard } from "@/components/CampanhaCard";
import { BuscaPorCodigo } from "@/components/BuscaPorCodigo";
import { Card, CardContent } from "@/components/ui/Card";
import { Label, Select } from "@/components/ui/Form";
import type { Campanha, TipoCampanha } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<"TODAS" | TipoCampanha>("TODAS");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "campanhas", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await api.get<{ data: Campanha[] }>("/campanhas");
      return response.data.data;
    },
  });

  const lista = useMemo(() => {
    if (!data) return [];
    if (filtro === "TODAS") return data;
    return data.filter((c) => c.tipo === filtro);
  }, [data, filtro]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl">Painel Administrativo</h1>
        <p className="text-sm text-muted-foreground">
          Visualize todas as campanhas e acesse qualquer uma pelo código de convite.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5 grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <Label className="mb-1 block">Buscar por código</Label>
            <BuscaPorCodigo placeholder="Acessar qualquer campanha pelo código" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filtro">Tipo</Label>
            <Select
              id="filtro"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as typeof filtro)}
              className="w-44"
            >
              <option value="TODAS">Todas</option>
              <option value="PUBLICA">Públicas</option>
              <option value="PRIVADA">Privadas</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !lista.length ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Nenhuma campanha encontrada.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((c) => (
            <CampanhaCard key={c.id} campanha={c} />
          ))}
        </div>
      )}
    </div>
  );
}
