import type { ReactNode } from "react";

interface PortalPageHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PortalPageHeading({ eyebrow, title, description, actions }: PortalPageHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-eyebrow text-accent">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-3xl text-fg sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-fg-muted">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
