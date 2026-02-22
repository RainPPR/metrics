import { motion } from "framer-motion";
import { Star, Award, Cpu, Zap, Trophy } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Star: <Star className="text-yellow-400" />,
  Award: <Award className="text-blue-400" />,
  Cpu: <Cpu className="text-pink-400" />,
  Zap: <Zap className="text-purple-400" />,
  Trophy: <Trophy className="text-orange-400" />
};

export const AchievementCard = ({ achievement }: { achievement: any }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-3xl bg-white border border-gray-100 flex items-start gap-4 transition-all hover:shadow-xl hover:shadow-pink-100/30"
    >
      <div className="p-4 rounded-2xl bg-slate-50 flex-shrink-0">
        {ICON_MAP[achievement.icon] || <Award />}
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-slate-900 font-mono">{achievement.title}</h4>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{achievement.description}</p>
      </div>
    </motion.div>
  );
};
