import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { CampanhaCard } from "@/components/CampanhaCard";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import type { Campanha } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function MinhasCampanhas() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["campanhas", "minhas", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await api.get<{ data: Campanha[] }>("/campanhas/minhas");
      return response.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Minhas campanhas</h1>
          <p className="text-sm text-muted-foreground">
            Campanhas que você criou ou está participando.
          </p>
        </div>
        <Link to="/campanhas/nova">
          <Button variant="default">
            <Plus className="h-4 w-4" />
            Nova campanha
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Você ainda não criou nenhuma campanha.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((c) => (
            <CampanhaCard key={c.id} campanha={c} gerenciar={true} />
          ))}
        </div>
      )}
    </div>
  );
}