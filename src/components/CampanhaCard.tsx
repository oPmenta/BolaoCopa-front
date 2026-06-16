import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, KeyRound, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  StatusCampanhaBadge,
  TipoCampanhaBadge,
} from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { Campanha } from "@/types";

export function CampanhaCard({ campanha }: { campanha: Campanha }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link to={`/campanhas/codigo/${campanha.codigoConvite}`} className="block group">
        <Card className="overflow-hidden transition-all group-hover:shadow-elegant group-hover:-translate-y-0.5">
          <div className="h-24 bg-gradient-brasil bg-stripes-brasil relative">
            <div className="absolute inset-0 flex items-center justify-between px-5">
              <Trophy className="h-10 w-10 text-primary-foreground/80" />
              <div className="flex gap-2">
                <TipoCampanhaBadge tipo={campanha.tipo} />
                <StatusCampanhaBadge status={campanha.status} />
              </div>
            </div>
          </div>
          <CardContent className="pt-5 space-y-3">
            <div>
              <h3 className="text-xl">{campanha.nome}</h3>
              {campanha.descricao ? (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {campanha.descricao}
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" />
                <code className="font-mono text-xs">{campanha.codigoConvite}</code>
              </span>
              {campanha.criador?.nome ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {campanha.criador.nome}
                </span>
              ) : null}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Valor da aposta
              </span>
              <span className="font-display text-xl text-primary">
                {formatCurrency(campanha.valorAposta ?? 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
