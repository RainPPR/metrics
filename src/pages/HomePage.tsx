import { motion } from "framer-motion";
import { 
  Star, 
  GitCommit, 
  GitPullRequest, 
  Activity,
  Laptop,
  ArrowRight,
  Rocket,
  Award,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { BentoGrid, BentoCard } from "../components/BentoGrid";
import { ActivityCalendar } from "../components/ActivityCalendar";
import { AchievementCard } from "../components/AchievementCard";
import { cn } from "../lib/utils";

function ImpactMeter({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
        <span className="text-xs font-bold font-mono text-slate-900 leading-none">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-50 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full rounded-full transition-all duration-1000", color)}
        />
      </div>
    </div>
  );
}

export const HomePage = ({ data }: { data: any }) => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Header */}
      <header className="pt-20 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-end justify-between gap-8"
        >
          <div className="space-y-4">
            <div className="flex -space-x-4">
              {data.users.map((u: any) => (
                <div key={u.login} className="relative group/user">
                  <img 
                    src={u.avatarUrl} 
                    className="w-16 h-16 rounded-full border-4 border-[#FAFAFA] shadow-sm hover:z-50 transition-transform hover:scale-110 cursor-pointer"
                    alt={u.login}
                  />
                </div>
              ))}
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 font-mono italic">
              Level <span className="text-pink-400">Up.</span>
            </h1>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
              Synthesizing engineering excellence from RainPPR and the dev collective.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <StatItem icon={<Star size={18} className="text-yellow-400" />} label="Stars" value={data.totalStats.stars} />
            <StatItem icon={<GitCommit size={18} className="text-pink-400" />} label="Commits" value={data.totalStats.commits} />
            <StatItem icon={<GitPullRequest size={18} className="text-blue-400" />} label="PRs" value={data.totalStats.prs} />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-50/10 to-blue-50/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </motion.div>
      </header>

      <BentoGrid>
        {/* Achievements Quick Look */}
        <BentoCard 
          title="Battle Medals" 
          description="Proof of engineering soul"
          icon={<Award className="text-pink-400" size={24} />}
          className="md:col-span-1"
        >
          <div className="space-y-4 mt-6">
            {data.achievements?.slice(0, 3).map((ach: any) => (
              <div key={ach.id} className="transform scale-90 origin-top-left -mb-4">
                <AchievementCard achievement={ach} />
              </div>
            ))}
            <Link to="/achievements" className="flex items-center gap-2 text-xs font-black text-pink-500 hover:text-pink-600 transition-colors mt-6 uppercase tracking-widest pl-2">
              All Commendations <ArrowRight size={14} />
            </Link>
          </div>
        </BentoCard>

        {/* Global Stats - Bragging Version */}
        <BentoCard 
          title="Impact Points" 
          description="Quantifying your digital presence"
          icon={<Zap className="text-yellow-400" size={24} />}
          className="md:col-span-2"
        >
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ImpactMeter 
                label="Social Reach" 
                value={data.users.reduce((acc:any, u:any)=>acc+(u.followers||0), 0)} 
                max={100} 
                color="bg-blue-400" 
              />
              <ImpactMeter 
                label="Code Density" 
                value={data.totalStats.commits} 
                max={5000} 
                color="bg-pink-400" 
              />
              <ImpactMeter 
                label="Trust Factor" 
                value={data.totalStats.stars} 
                max={500} 
                color="bg-yellow-400" 
              />
            </div>
            <div className="flex flex-col justify-center items-center p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Total Influence Score</div>
               <div className="text-6xl font-black text-slate-900 font-mono tracking-tighter">
                 {Math.round((data.totalStats.stars * 10) + (data.totalStats.commits * 0.1))}
               </div>
               <div className="mt-4 px-4 py-1 rounded-full bg-pink-100 text-[10px] font-black text-pink-500 uppercase">Top 1% Developer</div>
            </div>
          </div>
        </BentoCard>

        {/* Live Showcases Summary */}
        <BentoCard 
          title="Deployed" 
          description="Ready-to-use projects"
          icon={<Rocket className="text-blue-400" size={24} />}
          className="md:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {data.pages.slice(0, 4).map((p: any) => (
              <a key={p.url || p.homepageUrl} href={p.homepageUrl || p.url} target="_blank" className="p-4 rounded-2xl bg-[#FAFAFA] border border-transparent hover:border-blue-100 transition-all flex items-center gap-4">
                <Laptop size={18} />
                <div className="truncate font-mono text-xs font-bold">{p.name}</div>
              </a>
            ))}
          </div>
          <Link to="/showcase" className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-500 transition-colors mt-4">
            Gallery View <ArrowRight size={14} />
          </Link>
        </BentoCard>

        {/* Global Languages */}
        <BentoCard 
          title="Tech Stack" 
          description="Primary languages in use"
          icon={<Activity size={24} />}
        >
          <div className="space-y-4 mt-6">
            {data.languageStats.slice(0, 4).map((lang: any) => (
              <div key={lang.name} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span>{lang.name}</span>
                  <span className="text-slate-400">{Math.round((lang.size / data.languageStats.reduce((acc:any, l:any)=> acc + l.size, 0)) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((lang.size / data.languageStats.reduce((acc:any, l:any)=> acc + l.size, 0)) * 100)}%` }} className="h-full rounded-full" style={{ backgroundColor: lang.color || '#eee' }} />
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Activity Summary */}
        <BentoCard 
          title="Activity" 
          description="Contribution commitment"
          icon={<Activity size={24} />}
          className="md:col-span-2"
        >
           <div className="mt-6 flex flex-col gap-8">
               {data.users.slice(0, 2).map((u: any) => (
                 <div key={u.login} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl} alt={u.login} className="w-8 h-8 rounded-full border-2 border-slate-100 shadow-sm" />
                      <span className="text-xs font-bold font-mono text-slate-600">{u.login}'s Universe</span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    <ActivityCalendar data={u.calendar} className="scale-90 origin-left" />
                 </div>
               ))}
           </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
};

function StatItem({ icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[80px]">
      <div className="p-2 rounded-2xl bg-slate-50">{icon}</div>
      <span className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">
        {value > 1000 ? `${(value/1000).toFixed(1)}k` : value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</span>
    </div>
  )
}
