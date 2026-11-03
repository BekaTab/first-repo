import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const fieldControlClass =
  "flex h-12 w-full items-center rounded-xl border border-line bg-surface-raised px-4 text-[15px] text-fg " +
  "transition-[border-color,box-shadow,background-color] duration-300 ease-luxe placeholder:text-fg-subtle " +
  "hover:border-line-strong focus:outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(fieldControlClass, className)} {...props} />;
});
