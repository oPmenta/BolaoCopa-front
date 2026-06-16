import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { CampanhaCard } from "@/components/CampanhaCard";
import { BuscaPorCodigo } from "@/components/BuscaPorCodigo";
import type { Campanha } from "@/types";

export default function Home() {
  const { data: campanhas, isLoading, isError } = useQuery({
    queryKey: ["campanhas", "publicas"],
    queryFn: async () => {
      const response = await api.get<{ data: Campanha[] }>("/campanhas/publicas");
      return response.data.data;
    },
  });

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl overflow-hidden border border-border bg-gradient-brasil bg-stripes-brasil text-primary-foreground p-8 sm:p-12 shadow-elegant"
      >
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-yellow-300 border border-yellow-500/30">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Edição Mundial
          </span>
          <h1 className="font-display text-4xl sm:text-6xl leading-none text-shadow">
            Aposte com a galera. <br />
            <span className="text-[#FFDF00]">Vibre a cada gol.</span>
          </h1>
          <p className="text-white max-w-lg text-shadow-lg font-semibold">
            Participe de bolões públicos ou entre num bolão privado usando o código de
            convite enviado pelo seu amigo.
          </p>
          <div className="max-w-md pt-2">
            <BuscaPorCodigo placeholder="Tem um código de convite? Cole aqui" />
          </div>
        </div>
      </motion.section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl">Bolões públicos</h2>
            <p className="text-sm text-muted-foreground">
              Escolha um e entre na disputa.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Não foi possível carregar as campanhas.</p>
        ) : !campanhas?.length ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Nenhuma campanha pública disponível no momento.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campanhas.map((c) => (
              <CampanhaCard key={c.id} campanha={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
