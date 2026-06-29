import React from 'react';
import { cn } from "../../lib/utils";

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  ...props
}) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:30s] [--gap:4rem] [gap:var(--gap)] flex-row w-full",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 justify-around [gap:var(--gap)] min-w-full flex-row",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "flex shrink-0 justify-around [gap:var(--gap)] min-w-full flex-row",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
