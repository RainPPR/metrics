import { useEffect, useState } from "react";
import { 
  Github, 
  Star, 
  GitCommit, 
  GitPullRequest, 
  ExternalLink,
  Users,
  Activity,
  Laptop
} from "lucide-react";
import { motion } from "framer-motion";
import { BentoGrid, BentoCard } from "./components/BentoGrid";
import { ActivityCalendar } from "./components/ActivityCalendar";
import { cn } from "./lib/utils";

interface Data {
  users: any[];
  repos: any[];
  pages: any[];
  contributors: any[];
  languageStats: any[];
  totalStats: {
    stars: number;
    commits: number;
    prs: number;
    issues: number;
  };
  updatedAt: string;
}

function App() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch("./data.json")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => {
        console.error("Failed to load data:", err);
        setData(null);
      });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA] font-sans">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="text-slate-400 font-mono"
        >
          Loading Metrics...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-pink-100 selection:text-slate-900 pb-20 relative overflow-hidden font-sans">
      {/* Background Blobs (Healing Style) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-200/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 pt-20 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-end justify-between gap-8"
        >
          <div className="space-y-4">
            <div className="flex -space-x-4">
              {data.users.map((u) => (
                <div key={u.login} className="relative group/user">
                  <img 
                    src={u.avatarUrl} 
                    className="w-16 h-16 rounded-full border-4 border-[#FAFAFA] shadow-sm hover:z-50 transition-transform hover:scale-110 cursor-pointer"
                    alt={u.login}
                  />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/user:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                    {u.login}
                  </div>
                </div>
              ))}
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">
              Metrics <span className="text-pink-400 animate-pulse">Dashboard</span>
            </h1>
            <p className="text-slate-500 max-w-md font-medium">
              A healing metrics collection for RainPPR and friends. 
              <br />
              <span className="text-xs text-slate-400 font-mono mt-2 block">
                Last updated: {new Date(data.updatedAt).toLocaleDateString()}
              </span>
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

      {/* Bento Grid Content */}
      <BentoGrid>
        {/* GitHub Pages Showcase */}
        <BentoCard 
          title="Live Showcases" 
          description="Deployed projects and Github Pages"
          icon={<ExternalLink size={24} />}
          className="md:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {data.pages.slice(0, 4).map((p) => (
              <a 
                key={p.url || p.homepageUrl}
                href={p.homepageUrl || p.url} 
                target="_blank"
                className="group/item relative flex items-center gap-4 p-4 rounded-2xl bg-[#FAFAFA] border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300"
              >
                <div className="p-2 rounded-xl bg-white shadow-sm group-hover/item:text-blue-500 transition-colors">
                  <Laptop size={18} />
                </div>
                <div className="truncate">
                  <div className="text-sm font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500 font-mono truncate">{p.owner}</div>
                </div>
                <ExternalLink size={14} className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </BentoCard>

        {/* Global Languages */}
        <BentoCard 
          title="Core Stack" 
          description="Most used languages across repos"
          icon={<Activity size={24} />}
        >
          <div className="space-y-4 mt-6">
            {data.languageStats.slice(0, 5).map((lang) => (
              <div key={lang.name} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>{lang.name}</span>
                  <span className="text-slate-400">{Math.round((lang.size / data.languageStats.reduce((acc:any, l:any)=> acc + l.size, 0)) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((lang.size / data.languageStats.reduce((acc:any, l:any)=> acc + l.size, 0)) * 100)}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: lang.color || '#eee' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Trending Repositories */}
        <BentoGrid className="md:col-span-3 !p-0 !py-0 !max-w-none gap-6">
          <BentoCard 
            title="Trending Repos" 
            description="Most starred and recently pushed projects"
            icon={<Star size={24} />}
            className="md:col-span-1"
          >
            <div className="space-y-4 mt-4">
              {data.repos.slice(0, 6).map((repo) => (
                <div key={repo.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group/repo">
                  <div className="flex items-center gap-3 truncate">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.primaryLanguage?.color || '#333' }} />
                      <span className="text-sm font-bold text-slate-700 truncate font-mono">{repo.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <Star size={12} className="group-hover/repo:text-yellow-400 transition-colors" />
                      {repo.stargazerCount}
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Activity Calendar (Healing heatmap) */}
          <BentoCard 
            title="Activity Pulse" 
            description="Daily commitment to code and love"
            icon={<Activity size={24} />}
            className="md:col-span-3"
          >
            <div className="mt-6 flex flex-col gap-8">
               {data.users.map((u) => (
                 <div key={u.login} className="space-y-3">
                    <div className="flex items-center gap-2">
                       <img src={u.avatarUrl} className="w-5 h-5 rounded-full" />
                       <span className="text-xs font-bold text-slate-600 font-mono">{u.login}</span>
                       <span className="text-[10px] text-slate-300 font-mono">{u.calendar.totalContributions} contributions</span>
                    </div>
                    <ActivityCalendar data={u.calendar} />
                 </div>
               ))}
            </div>
          </BentoCard>

          {/* Contributor Universe */}
          <BentoCard 
            title="Contributor Universe" 
            description="Lovely contributors who support our code"
            icon={<Users size={24} />}
            className="md:col-span-2"
          >
            <div className="flex flex-wrap gap-3 mt-6">
              {data.contributors?.map((c: any) => (
                <motion.div 
                  key={c.login}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  className="relative group/avatar"
                >
                  <img 
                    src={c.avatarUrl} 
                    alt={c.login} 
                    className={cn(
                      "rounded-full border-2 border-white shadow-sm cursor-pointer transition-all duration-300",
                      c.commits > 100 ? "w-14 h-14 ring-2 ring-pink-100" : (c.commits > 20 ? "w-10 h-10 ring-1 ring-blue-50" : "w-8 h-8")
                    )} 
                  />
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-xl">
                      {c.login} ({c.commits} commits)
                  </div>
                </motion.div>
              ))}
              {(!data.contributors || data.contributors.length === 0) && (
                <div className="h-32 w-full flex items-center justify-center text-slate-300 font-mono italic">
                    Waiting for star clusters...
                </div>
              )}
            </div>
          </BentoCard>
        </BentoGrid>
      </BentoGrid>

      
      <footer className="mt-20 text-center text-slate-400 font-mono text-xs">
         Made with <span className="text-pink-300">❤</span> by RainPPR & AI Dashboard
      </footer>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[80px]">
      <div className="p-2 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors">
        {icon}
      </div>
      <span className="text-2xl font-bold text-slate-900 font-mono">
        {value > 1000 ? `${(value/1000).toFixed(1)}k` : value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</span>
    </div>
  )
}

export default App;
