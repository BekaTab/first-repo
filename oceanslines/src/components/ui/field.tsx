import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FieldProps {
  id: string;
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Label + control + optional hint, with the hint wired to the control via aria-describedby by the caller. */
export function Field({ id, label, hint, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="min-h-[1rem] text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
