"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePortalContainer } from "./portal-container";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

interface DialogContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DialogContent({ title, description, children, className }: DialogContentProps) {
  const container = usePortalContainer();
  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-[ol-fade_250ms_ease-out]" />
      <DialogPrimitive.Content
        className={cn(
          // Centered with inset-0 + m-auto (not translate) so the pop keyframe's transform can't displace it.
          "fixed inset-0 z-50 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto",
          "rounded-2xl border border-line bg-surface-raised p-6 text-fg shadow-lifted sm:p-7",
          "data-[state=open]:animate-[ol-pop_280ms_cubic-bezier(0.22,1,0.36,1)]",
          className,
        )}
      >
        <DialogPrimitive.Title className="font-serif text-xl">{title}</DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="mt-1.5 text-sm text-fg-muted">{description}</DialogPrimitive.Description>
        ) : (
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        )}
        <div className="mt-6">{children}</div>
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-surface-sunken hover:text-fg"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
