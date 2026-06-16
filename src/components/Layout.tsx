import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const userLinks = [
    { to: "/", label: "Campanhas" },
    { to: "/minhas-campanhas", label: "Minhas campanhas" },
    { to: "/campanhas/nova", label: "Criar campanha" },
  ];
  const adminLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/campanhas/nova", label: "Nova campanha" },
    { to: "/admin/meios-pagamento", label: "Meios de pagamento" },
    { to: "/admin/tipos-campanha", label: "Tipos de campanha" },
  ];
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="container-app flex h-16 items-center justify-between gap-4">
          <Link
            to={isAdmin ? "/admin" : "/"}
            className="flex items-center gap-2 font-display text-2xl tracking-wide"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brasil text-primary-foreground shadow-elegant">
              <Trophy className="h-5 w-5" />
            </span>
            <span>
              Bolão da <span className="text-primary">Copa</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/" || l.to === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold">{user?.nome}</span>
              <span className="text-xs text-muted-foreground">
                {isAdmin ? "Administrador" : "Apostador"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <div className="md:hidden border-t border-border">
          <div className="container-app flex gap-1 overflow-x-auto py-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/" || l.to === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 container-app py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card/60">
        <div className="container-app py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>Bolão da Copa • feito com 💚💛 no Brasil</span>
          <span>v0.1</span>
        </div>
      </footer>
    </div>
  );
}
