import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-luxe " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-surface active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45";

const variants = {
  // Portal (role-themed tokens)
  primary: "bg-primary text-primary-fg shadow-soft hover:bg-primary-hover",
  secondary: "border border-line bg-surface-raised text-fg hover:border-line-strong hover:bg-surface-sunken",
  ghost: "text-fg-muted hover:bg-surface-sunken hover:text-fg",
  danger: "text-danger hover:bg-danger/10",
  // Landing (brand tokens)
  luxe: "bg-charcoal text-cashmere shadow-soft hover:bg-black hover:shadow-lifted focus-visible:ring-gold focus-visible:ring-offset-cashmere",
  "luxe-outline":
    "border border-charcoal/15 bg-white/60 text-charcoal hover:border-gold hover:bg-white/70 focus-visible:ring-gold focus-visible:ring-offset-cashmere",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
  icon: "h-9 w-9",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Class string for anything that should look like a button (e.g. a Next `<Link>`). */
export const buttonVariants = ({ variant = "primary", size = "md", className }: ButtonStyleProps = {}) =>
  cn(base, variants[variant], sizes[size], className);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonVariants({ variant, size, className })} {...props} />;
});
