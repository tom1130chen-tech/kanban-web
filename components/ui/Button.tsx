"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-lg font-body " +
    "border-[3px] border-pencil bg-white text-pencil " +
    "transition-transform duration-100 " +
    "shadow-hard active:shadow-none " +
    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hardSm " +
    "active:translate-x-[4px] active:translate-y-[4px] " +
    "disabled:opacity-60 disabled:cursor-not-allowed";
  const shape = "[border-radius:var(--r-wobbly)]";
  const color =
    variant === "secondary"
      ? "bg-muted hover:bg-penblue hover:text-white"
      : "hover:bg-accent hover:text-white";

  return <button className={cn(base, shape, color, className)} {...props} />;
}
