import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  Search, 
  Filter, 
  GitBranch, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Folders, 
  Clock,
  User,
  Tags
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "../lib/utils";

type ViewMode = 'grid' | 'list';
type SortKey = 'name' | 'stars' | 'updated' | 'created';
type GroupKey = 'none' | 'owner' | 'language' | 'time';

export const ReposPage = ({ repos }: { repos: any[] }) => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [groupKey, setGroupKey] = useState<GroupKey>('none');

  // Filtering
  const filtered = useMemo(() => {
    return repos.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [repos, search]);

  // Sorting Logic
  const sorted = useMemo(() => {
    const list = [...filtered];
    return list.sort((a, b) => {
      if (sortKey === 'stars') return b.stargazerCount - a.stargazerCount;
      if (sortKey === 'updated') return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
      if (sortKey === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });
  }, [filtered, sortKey]);

  // Grouping Logic
  const groups = useMemo(() => {
    if (groupKey === 'none') return [{ id: 'all', name: 'All Repositories', items: sorted }];

    const map: Record<string, { name: string, items: any[] }> = {};

    sorted.forEach(repo => {
      let key = 'Other';
      let label = 'Other';

      if (groupKey === 'owner') {
        key = repo.owner;
        label = repo.owner;
      } else if (groupKey === 'language') {
        key = repo.primaryLanguage?.name || 'Unknown';
        label = key;
      } else if (groupKey === 'time') {
        const diff = Date.now() - new Date(repo.pushedAt).getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        if (days < 7) { key = '1_week'; label = 'This Week'; }
        else if (days < 30) { key = '2_month'; label = 'This Month'; }
        else if (days < 365) { key = '3_year'; label = 'This Year'; }
        else { key = '4_older'; label = 'A Long Time Ago'; }
      }

      if (!map[key]) map[key] = { name: label, items: [] };
      map[key].items.push(repo);
    });

    return Object.keys(map).sort().map(k => ({ id: k, ...map[k] }));
  }, [sorted, groupKey]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
      <header className="mb-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 font-mono tracking-tight">Repo <span className="text-blue-400">Armory.</span></h2>
            <p className="text-sm text-slate-400 font-medium font-mono">Exploring {repos.length} works of engineering.</p>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white/50 backdrop-blur-xl border border-gray-100 rounded-3xl p-4 flex flex-col lg:flex-row gap-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="Filter repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Sort Dropdown Simulation */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100">
               <ArrowUpDown size={14} className="text-slate-400" />
               <select 
                 className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                 value={sortKey}
                 onChange={(e) => setSortKey(e.target.value as SortKey)}
               >
                 <option value="name">Name (A-Z)</option>
                 <option value="stars">Popularity</option>
                 <option value="updated">Recent Activity</option>
                 <option value="created">Newest First</option>
               </select>
            </div>

            {/* Group Dropdown Simulation */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100">
               <Folders size={14} className="text-slate-400" />
               <select 
                 className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                 value={groupKey}
                 onChange={(e) => setGroupKey(e.target.value as GroupKey)}
               >
                 <option value="none">No Grouping</option>
                 <option value="owner">By Owner</option>
                 <option value="language">By Language</option>
                 <option value="time">By Time Range</option>
               </select>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
              <Filter size={14} />
              <span>{filtered.length} Matched</span>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {groups.map((group) => (
            <motion.section 
              key={group.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {groupKey !== 'none' && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 font-mono flex items-center gap-2 whitespace-nowrap">
                    {groupKey === 'owner' && <User size={12} />}
                    {groupKey === 'language' && <Tags size={12} />}
                    {groupKey === 'time' && <Clock size={12} />}
                    {group.name}
                  </span>
                  <div className="h-px w-full bg-slate-100" />
                </div>
              )}

              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "flex flex-col gap-3"
              )}>
                {group.items.map((repo, i) => (
                  <RepoItem key={repo.name} repo={repo} viewMode={viewMode} index={i} />
                ))}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RepoItem = ({ repo, viewMode, index }: { repo: any, viewMode: ViewMode, index: number }) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.01 }}
        className="group flex items-center justify-between p-4 px-6 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all cursor-default"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
            <GitBranch size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-mono group-hover:text-blue-500 transition-colors">{repo.name}</h3>
            <p className="text-[10px] text-slate-400 font-medium font-mono line-clamp-1">{repo.description || "Project intelligence report pending."}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.primaryLanguage?.color || '#eee' }} />
            <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-widest">{repo.primaryLanguage?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-[10px] font-black font-mono text-slate-400 group-hover:text-blue-500 transition-colors">
            <Star size={10} /> {repo.stargazerCount}
          </div>
          <div className="hidden sm:block text-[10px] font-black text-slate-200 font-mono uppercase tracking-[0.2em]">{repo.owner}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group p-6 rounded-3xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-100/20 transition-all duration-300 flex flex-col justify-between aspect-video md:aspect-auto"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
            <GitBranch size={18} />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/50 text-[10px] font-black font-mono text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
            <Star size={10} /> {repo.stargazerCount}
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-mono mb-2 group-hover:text-blue-500 transition-colors">{repo.name}</h3>
        <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed mb-6">{repo.description || "This repository carries the essence of silent commits and engineering dreams."}</p>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: repo.primaryLanguage?.color || '#eee' }} />
          <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-widest">{repo.primaryLanguage?.name || 'Unknown'}</span>
        </div>
        <div className="text-[10px] font-black text-slate-300 font-mono uppercase tracking-widest">{repo.owner}</div>
      </div>
    </motion.div>
  );
};
