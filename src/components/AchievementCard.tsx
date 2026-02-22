import { motion } from "framer-motion";
import { Star, Award, Cpu, Zap, Trophy, Moon, Rocket, Users } from "lucide-react";
import { cn } from "../lib/utils";

const ICON_MAP: Record<string, any> = {
  Star: <Star size={24} />,
  Award: <Award size={24} />,
  Cpu: <Cpu size={24} />,
  Zap: <Zap size={24} />,
  Trophy: <Trophy size={24} />,
  Moon: <Moon size={24} />,
  Rocket: <Rocket size={24} />,
  Users: <Users size={24} />
};

const LEVEL_COLORS: Record<string, string> = {
  Gold: "text-yellow-500 bg-yellow-50 border-yellow-100 shadow-yellow-100/50",
  Silver: "text-slate-400 bg-slate-50 border-slate-100 shadow-slate-100/50",
  Bronze: "text-orange-400 bg-orange-50 border-orange-100 shadow-orange-100/50"
};

export const AchievementCard = ({ achievement }: { achievement: any }) => {
  const levelClass = LEVEL_COLORS[achievement.level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.Bronze;

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "p-6 rounded-3xl bg-white border flex items-start gap-4 transition-all hover:shadow-2xl",
        achievement.level === 'Gold' ? 'border-yellow-200 shadow-xl shadow-yellow-50' : 'border-gray-100 shadow-sm'
      )}
    >
      <div className={cn("p-4 rounded-2xl flex-shrink-0 flex items-center justify-center", levelClass)}>
        {ICON_MAP[achievement.icon] || <Award size={24} />}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-bold text-slate-900 font-mono leading-none">{achievement.title}</h4>
          {achievement.level === 'Gold' && <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-[8px] font-black text-white uppercase tracking-tighter">Mythic</span>}
        </div>
        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed tracking-tight">{achievement.description}</p>
      </div>
    </motion.div>
  );
};
