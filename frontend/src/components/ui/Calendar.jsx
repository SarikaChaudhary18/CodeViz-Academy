import React, { useMemo } from "react";
import { cn } from "../../lib/utils";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useStore } from "../../hooks/useStore";
import {
  Button,
  CalendarCell as CalendarCellRac,
  CalendarGridBody as CalendarGridBodyRac,
  CalendarGridHeader as CalendarGridHeaderRac,
  CalendarGrid as CalendarGridRac,
  CalendarHeaderCell as CalendarHeaderCellRac,
  Calendar as CalendarRac,
  Heading as HeadingRac,
  RangeCalendar as RangeCalendarRac,
  composeRenderProps,
} from "react-aria-components";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

const CalendarHeader = () => (
  <header className="flex w-full items-center gap-1 pb-1 mb-2">
    <Button
      slot="previous"
      className="flex size-8 items-center justify-center rounded-lg text-gray-400 outline-offset-2 transition-colors hover:bg-white/5 hover:text-white focus:outline-none border border-white/5 cursor-pointer"
    >
      <ChevronLeftIcon size={16} strokeWidth={2} />
    </Button>
    <HeadingRac className="grow text-center text-xs font-mono font-bold uppercase tracking-wider text-white" />
    <Button
      slot="next"
      className="flex size-8 items-center justify-center rounded-lg text-gray-400 outline-offset-2 transition-colors hover:bg-white/5 hover:text-white focus:outline-none border border-white/5 cursor-pointer"
    >
      <ChevronRightIcon size={16} strokeWidth={2} />
    </Button>
  </header>
);

const CalendarGridComponent = ({ isRange = false }) => {
  const { user } = useStore();
  const now = today(getLocalTimeZone());

  // Compute active streak dates (consecutive S days ending at user.lastActiveDate)
  const streakDates = useMemo(() => {
    if (!user || !user.streak || user.streak <= 0 || !user.lastActiveDate) {
      return [];
    }
    const dates = [];
    try {
      const lastActive = new Date(user.lastActiveDate);
      for (let i = 0; i < user.streak; i++) {
        const d = new Date(lastActive);
        d.setDate(lastActive.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
    } catch (err) {
      console.error("Calendar: Error parsing streak dates:", err);
    }
    return dates;
  }, [user?.streak, user?.lastActiveDate]);

  return (
    <CalendarGridRac className="w-full">
      <CalendarGridHeaderRac>
        {(day) => (
          <CalendarHeaderCellRac className="size-8 rounded-lg p-0 text-[10px] font-mono font-bold uppercase text-zinc-500 text-center select-none">
            {day}
          </CalendarHeaderCellRac>
        )}
      </CalendarGridHeaderRac>
      <CalendarGridBodyRac className="[&_td]:px-0">
        {(date) => {
          const dateStr = date.toString();
          const isStreakActive = streakDates.includes(dateStr);
          const isToday = date.compare(now) === 0;

          return (
            <CalendarCellRac
              date={date}
              className={cn(
                "relative flex size-8 items-center justify-center whitespace-nowrap rounded-lg border border-transparent p-0 text-xs font-mono font-medium text-gray-300 outline-offset-2 duration-150 [transition-property:color,background-color,border-radius,box-shadow] focus:outline-none data-[disabled]:pointer-events-none data-[unavailable]:pointer-events-none data-[hovered]:bg-white/5 data-[hovered]:text-white data-[unavailable]:line-through data-[disabled]:opacity-30 data-[unavailable]:opacity-30",
                isStreakActive && "bg-amber-500/10 border-amber-500/25 text-amber-400 font-bold",
                isRange &&
                  "data-[selected]:rounded-none data-[selection-end]:rounded-e-lg data-[selection-start]:rounded-s-lg data-[selected]:bg-white/10 data-[selected]:text-white data-[selection-end]:bg-violet-600 data-[selection-start]:bg-violet-600",
                !isStreakActive && !isRange && "data-[selected]:bg-violet-600/30 data-[selected]:text-white data-[selected]:border-violet-500/25",
                isToday && "border-cyan-500/30 text-cyan-400"
              )}
            >
              {({ formattedDate }) => (
                <div className="relative flex items-center justify-center w-full h-full select-none">
                  <span>{formattedDate}</span>
                  {isStreakActive && (
                    <span className="absolute -top-1 -right-1 text-[8px]" title="Active Streak 🔥">
                      🔥
                    </span>
                  )}
                </div>
              )}
            </CalendarCellRac>
          );
        }}
      </CalendarGridBodyRac>
    </CalendarGridRac>
  );
};

const Calendar = ({ className, ...props }) => {
  return (
    <CalendarRac
      {...props}
      className={composeRenderProps(className, (className) =>
        cn("w-fit bg-[#070b19]/25 border border-white/5 p-4 rounded-2xl backdrop-blur-md", className)
      )}
    >
      <CalendarHeader />
      <CalendarGridComponent />
    </CalendarRac>
  );
};

const RangeCalendar = ({ className, ...props }) => {
  return (
    <RangeCalendarRac
      {...props}
      className={composeRenderProps(className, (className) =>
        cn("w-fit bg-[#070b19]/25 border border-white/5 p-4 rounded-2xl backdrop-blur-md", className)
      )}
    >
      <CalendarHeader />
      <CalendarGridComponent isRange />
    </RangeCalendarRac>
  );
};

export { Calendar, RangeCalendar };
