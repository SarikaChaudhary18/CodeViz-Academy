import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "../../lib/utils";

const StreakBadge = React.forwardRef(({ className, size = "default", length = 0, frequency = "daily", subtitle = "streak", icon, ...props }, ref) => {
  const streakLength = length;
  
  const frequencyLabel = {
    daily: "day",
    weekly: "week",
    monthly: "month",
  }[frequency] || "day";

  const pluralLabel = streakLength === 1 ? frequencyLabel : `${frequencyLabel}s`;

  const sizeClasses = {
    sm: "w-28 gap-1 p-2 bg-[#070b19]/20 border-white/5 shadow-md",
    default: "w-40 gap-2 p-4 bg-[#070b19]/40 border-white/10 shadow-lg",
    lg: "w-52 gap-3 p-5 bg-[#070b19]/50 border-white/10 shadow-xl",
  }[size] || "w-40 gap-2 p-4 bg-[#070b19]/40 border-white/10 shadow-lg";

  const iconSize = {
    sm: "h-5 w-5",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  }[size] || "h-8 w-8";

  const valueSize = {
    sm: "text-lg",
    default: "text-3xl",
    lg: "text-5xl",
  }[size] || "text-3xl";

  const subtitleSize = {
    sm: "text-[8px]",
    default: "text-[10px]",
    lg: "text-[12px]",
  }[size] || "text-[10px]";

  const subtitleText = subtitle;
  const valueUnit = pluralLabel;
  const ariaLabel = `${streakLength} ${pluralLabel} streak`;

  return (
    <div
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex flex-col items-center justify-center rounded-2xl border text-center text-white transition-all duration-500",
        sizeClasses,
        className
      )}
      {...props}
    >
      {icon ?? (
        <Flame
          className={cn(iconSize, streakLength > 0 ? "text-amber-500 animate-pulse" : "text-gray-500")}
          aria-hidden="true"
        />
      )}
      <span
        className={cn("font-bold font-mono tracking-tight", valueSize)}
        aria-hidden="true"
      >
        {streakLength}
        <span className="text-zinc-500 ml-1.5 font-normal text-xs lowercase">
          {valueUnit}
        </span>
      </span>
      <span
        className={cn("text-zinc-400 font-mono font-bold uppercase tracking-wider", subtitleSize)}
        aria-hidden="true"
      >
        {subtitleText}
      </span>
    </div>
  );
});

StreakBadge.displayName = "StreakBadge";

export { StreakBadge };
