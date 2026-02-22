import { motion } from "framer-motion";
import { Zap, TrendingUp, Heart } from "lucide-react";
import { AchievementCard } from "../components/AchievementCard";

export const AchievementPage = ({ achievements, stats }: { achievements: any[], stats: any }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
       <header className="mb-12 space-y-4">
        <h2 className="text-4xl font-bold text-slate-900 font-mono tracking-tight">Hall of <span className="text-yellow-400 animate-pulse">Fame.</span></h2>
        <p className="text-slate-500 font-medium max-w-sm">Automatically detected milestones based on code contribution patterns.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
         {achievements?.map((ach, i) => (
           <motion.div 
             key={ach.id}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
           >
             <AchievementCard achievement={ach} />
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <MetricBrag 
           icon={<Zap className="text-orange-400" />} 
           value={stats.commits} 
           label="Impact Points" 
           desc="Total commits across all aggregated repositories." 
         />
         <MetricBrag 
           icon={<TrendingUp className="text-blue-400" />} 
           value={stats.stars} 
           label="Community Trust" 
           desc="Star gaze count representing public recognition." 
         />
         <MetricBrag 
           icon={<Heart className="text-pink-400" />} 
           value={stats.prs} 
           label="Team Player" 
           desc="Successfully merged pull requests." 
         />
      </div>
    </div>
  );
};

const MetricBrag = ({ icon, value, label, desc }: any) => (
  <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 space-y-4 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">{icon}</div>
    <div>
       <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
       <div className="text-4xl font-bold text-slate-900 font-mono italic">{value}</div>
    </div>
    <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
  </div>
);
