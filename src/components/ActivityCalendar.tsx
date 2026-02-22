import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

interface ActivityCalendarProps {
  data: {
    totalContributions: number;
    weeks: {
      contributionDays: ContributionDay[];
    }[];
  };
  className?: string;
}

export const ActivityCalendar = ({ data, className }: ActivityCalendarProps) => {
  // We'll map the GitHub colors to our healing palette
  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-50";
    if (count < 3) return "bg-blue-100";
    if (count < 6) return "bg-blue-300";
    if (count < 10) return "bg-pink-300";
    return "bg-pink-500";
  };

  return (
    <div className={cn("overflow-x-auto pb-2 scrollbar-hide", className)}>
      <div className="flex gap-1 min-w-max">
        {data.weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.contributionDays.map((day) => (
              <motion.div
                key={day.date}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                className={cn(
                  "w-3 h-3 rounded-[2px] cursor-help transition-colors duration-500",
                  getColor(day.contributionCount)
                )}
                title={`${day.date}: ${day.contributionCount} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
         <span>Last 12 Months</span>
         <div className="flex items-center gap-1">
            <span>Less</span>
            <div className="w-2 h-2 rounded-[1px] bg-gray-50" />
            <div className="w-2 h-2 rounded-[1px] bg-blue-100" />
            <div className="w-2 h-2 rounded-[1px] bg-blue-300" />
            <div className="w-2 h-2 rounded-[1px] bg-pink-300" />
            <div className="w-2 h-2 rounded-[1px] bg-pink-500" />
            <span>More</span>
         </div>
      </div>
    </div>
  );
};
