import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label, FieldError } from "@/components/ui/Form";
import { Card, CardContent } from "@/components/ui/Card";

const schema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormData = z.infer<typeof schema>;

export default function Cadastro() {
  const { cadastro, login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await cadastro(data);
      toast.success("Conta criada! Entrando...");
      const user = await login(data.email, data.senha);
      navigate(user.tipo_usuario === "ADMIN" ? "/admin" : "/", { replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stripes-brasil">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brasil text-primary-foreground shadow-elegant mb-3">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl tracking-wide">Cadastro</h1>
          <p className="text-sm text-muted-foreground">Crie sua conta para apostar</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" {...register("nome")} />
                <FieldError message={errors.nome?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register("email")} />
                <FieldError message={errors.email?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" {...register("senha")} />
                <FieldError message={errors.senha?.message} />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Criar conta
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
