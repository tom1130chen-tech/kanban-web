"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-white text-pencil text-lg font-body px-3 py-2 border-[3px] border-pencil",
        "[border-radius:var(--r-wobbly)]",
        "focus:outline-none focus:border-penblue focus:ring-2 focus:ring-penblue/20",
        className
      )}
      {...props}
    />
  );
}
