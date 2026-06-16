import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function BuscaPorCodigo({ placeholder = "Buscar por código de convite..." }: { placeholder?: string }) {
  const [codigo, setCodigo] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const c = codigo.trim();
    if (!c) return;
    navigate(`/campanhas/codigo/${encodeURIComponent(c)}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder={placeholder}
          className="pl-9 uppercase tracking-wider"
        />
      </div>
      <Button type="submit" variant="default">
        Buscar
      </Button>
    </form>
  );
}
