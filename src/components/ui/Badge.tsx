import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "destructive" | "info" | "neutral";

const tones: Record<Tone, string> = {
  default: "bg-primary/15 text-primary border-primary/30",
  success: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.35)]",
  warning: "bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.4)]",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-secondary/15 text-secondary border-secondary/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
