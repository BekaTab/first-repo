"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldControlClass } from "./input";
import { usePortalContainer } from "./portal-container";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  /** Secondary text shown right-aligned in the menu (e.g. a state's full name). */
  hint?: string;
}

interface SelectProps<T extends string> {
  id: string;
  value: T | null;
  onValueChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  placeholder: string;
  disabled?: boolean;
  "aria-describedby"?: string;
  className?: string;
}

/**
 * Typed single-select. `onValueChange` receives the option's own typed value,
 * so callers never cast Radix's `string`.
 */
export function Select<T extends string>({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className,
  ...aria
}: SelectProps<T>) {
  const container = usePortalContainer();

  const handleChange = (raw: string) => {
    const match = options.find((o) => o.value === raw);
    if (match) onValueChange(match.value);
  };

  return (
    // `value=""` shows the placeholder (Radix Select v2).
    <SelectPrimitive.Root value={value ?? ""} onValueChange={handleChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-describedby={aria["aria-describedby"]}
        className={cn(
          fieldControlClass,
          "justify-between gap-3 text-left data-[placeholder]:text-fg-subtle [&>span]:truncate",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-fg-subtle transition-transform duration-300" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal container={container}>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "relative z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)]",
            "overflow-hidden rounded-xl border border-line bg-surface-raised text-fg shadow-lifted",
            "data-[state=open]:animate-[ol-pop_220ms_cubic-bezier(0.22,1,0.36,1)]",
          )}
        >
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center gap-3 rounded-lg py-2.5 pl-8 pr-3 text-sm outline-none",
                  "transition-colors duration-150 data-[highlighted]:bg-primary/10 data-[highlighted]:text-fg",
                  "data-[state=checked]:font-medium",
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2.5 inline-flex">
                  <Check aria-hidden className="h-4 w-4 text-primary" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                {o.hint ? <span className="ml-auto pl-4 text-xs text-fg-subtle">{o.hint}</span> : null}
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
