import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2",
        {
          "border-transparent bg-[var(--color-primary)] text-[var(--color-foreground)] hover:bg-[var(--color-primary)]/80": variant === "default",
          "border-transparent bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]/80": variant === "secondary",
          "border-transparent bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive)]/80": variant === "destructive",
          "border-transparent bg-amber-500 text-white hover:bg-amber-600": variant === "warning",
          "border-transparent bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/80 glow-box": variant === "success",
          "text-[var(--color-foreground)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
