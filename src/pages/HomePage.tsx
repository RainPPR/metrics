import { motion } from "framer-motion";
import { 
  Star, 
  GitCommit, 
  GitPullRequest, 
  Activity,
  Laptop,
  ArrowRight,
  Rocket,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { BentoGrid, BentoCard } from "../components/BentoGrid";
import { ActivityCalendar } from "../components/ActivityCalendar";
import { AchievementCard } from "../components/AchievementCard";

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
          title="Highlights" 
          description="Recent milestones & achievements"
          icon={<Award className="text-pink-400" size={24} />}
          className="md:col-span-1"
        >
          <div className="space-y-4 mt-6">
            {data.achievements?.slice(0, 2).map((ach: any) => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))}
            <Link to="/achievements" className="flex items-center gap-2 text-xs font-bold text-pink-400 hover:text-pink-500 transition-colors mt-4">
              View All Awards <ArrowRight size={14} />
            </Link>
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
           <div className="mt-6 flex flex-col gap-4">
               {data.users.slice(0, 2).map((u: any) => (
                 <div key={u.login} className="space-y-2">
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
