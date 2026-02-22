import { motion, AnimatePresence } from "framer-motion";
import { Laptop, ExternalLink, Globe, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

type ViewMode = 'grid' | 'list';

export const ShowcasePage = ({ pages }: { pages: any[] }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-slate-900 font-mono tracking-tight">Project <span className="text-pink-400">Gallery.</span></h2>
          <p className="text-slate-500 font-medium max-w-sm">Curated selection of live projects and interactive experiments.</p>
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
      </header>

      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" 
          : "flex flex-col gap-4"
      )}>
        <AnimatePresence mode="popLayout">
          {pages.map((page, i) => (
            <ShowcaseItem key={page.url || page.homepageUrl} page={page} viewMode={viewMode} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ShowcaseItem = ({ page, viewMode, index }: { page: any, viewMode: ViewMode, index: number }) => {
  const url = page.homepageUrl || page.url;

  if (viewMode === 'list') {
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.02 }}
        className="group flex items-center justify-between p-6 rounded-3xl bg-white border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-50/50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-all">
            <Laptop size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-mono group-hover:text-pink-600 transition-colors">{page.name}</h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
              <Globe size={12} />
              {page.owner}
            </div>
          </div>
        </div>
        <ExternalLink size={20} className="text-slate-200 group-hover:text-pink-400 transition-colors mx-4" />
      </motion.a>
    );
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group relative h-64 rounded-[2rem] bg-white border border-gray-100 p-8 flex flex-col justify-between overflow-hidden hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-100/20 transition-all duration-500 cursor-pointer"
    >
      <div className="relative z-10 flex items-center justify-between">
         <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-pink-50 transition-colors text-slate-400 group-hover:text-pink-500">
            <Laptop size={24} />
         </div>
         <ExternalLink className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" size={20} />
      </div>

      <div className="relative z-10">
         <h3 className="text-xl font-bold text-slate-800 font-mono mb-1">{page.name}</h3>
         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            <Globe size={12} />
            {page.owner}
         </div>
      </div>

      {/* Decorative background for premium feel */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50/50 blur-3xl rounded-full -translate-y-16 translate-x-16 group-hover:bg-pink-100/50 transition-colors" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50/50 blur-3xl rounded-full translate-y-24 -translate-x-12 group-hover:bg-blue-100/50 transition-colors" />
    </motion.a>
  );
};
