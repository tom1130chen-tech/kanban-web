import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & {
  decoration?: "tape" | "tack" | "none";
  tilt?: "left" | "right" | "none";
};

export function Card({ className, decoration = "none", tilt = "none", ...props }: Props) {
  const tiltCls = tilt === "left" ? "-rotate-[0.8deg]" : tilt === "right" ? "rotate-[0.8deg]" : "";
  return (
    <div
      className={cn(
        "relative bg-white border-[3px] border-pencil shadow-hard p-4 transition-transform duration-100 hover:shadow-hardLg",
        "[border-radius:var(--r-wobbly-md)]",
        tiltCls,
        className
      )}
      {...props}
    >
      {decoration === "tape" && (
        <div
          className={cn(
            "pointer-events-none absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 border-2 border-pencil/40 bg-muted/80",
            "rotate-[-2deg] rounded-md"
          )}
        />
      )}
      {decoration === "tack" && (
        <div className="pointer-events-none absolute -top-4 left-4 h-4 w-4 rounded-full border-2 border-pencil bg-accent" />
      )}
      {props.children}
    </div>
  );
}
