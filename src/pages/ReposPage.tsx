import { motion } from "framer-motion";
import { Star, Search, Filter, GitBranch } from "lucide-react";
import { useState } from "react";

export const ReposPage = ({ repos }: { repos: any[] }) => {
  const [search, setSearch] = useState("");

  const filtered = repos.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
      <header className="mb-12 space-y-4">
        <h2 className="text-4xl font-bold text-slate-900 font-mono tracking-tight">Full <span className="text-blue-400">Inventory.</span></h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Filter repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-gray-100 text-slate-400 font-mono text-xs font-bold">
            <Filter size={14} />
            <span>{filtered.length} Repos discovered</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((repo, i) => (
          <motion.div
            key={repo.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="group p-6 rounded-3xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-100/20 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                  <GitBranch size={16} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-[10px] font-bold font-mono text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                  <Star size={10} /> {repo.stargazerCount}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-mono mb-2 group-hover:text-blue-500 transition-colors">{repo.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed mb-6">{repo.description || "No description provided."}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.primaryLanguage?.color || '#eee' }} />
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">{repo.primaryLanguage?.name || 'Unknown'}</span>
              </div>
              <div className="text-[10px] font-bold text-slate-300 font-mono uppercase">{repo.owner}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
