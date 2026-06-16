import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CampanhaForm } from "@/pages/user/CriarCampanha";

export default function CriarCampanhaAdmin() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova campanha (Admin)</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Você pode criar campanhas públicas ou privadas.
          </p>
        </CardHeader>
        <CardContent>
          <CampanhaForm permitirEscolherTipo />
        </CardContent>
      </Card>
    </div>
  );
}
