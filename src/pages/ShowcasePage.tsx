import { motion } from "framer-motion";
import { Laptop, ExternalLink, Globe } from "lucide-react";

export const ShowcasePage = ({ pages }: { pages: any[] }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
       <header className="mb-12 space-y-4">
        <h2 className="text-4xl font-bold text-slate-900 font-mono tracking-tight">Project <span className="text-pink-400">Gallery.</span></h2>
        <p className="text-slate-500 font-medium max-w-sm">Curated selection of live projects and interactive experiments.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {pages.map((page, i) => (
          <motion.a
            key={page.url || page.homepageUrl}
            href={page.homepageUrl || page.url}
            target="_blank"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group relative h-64 rounded-[2rem] bg-white border border-gray-100 p-8 flex flex-col justify-between overflow-hidden hover:border-pink-200 transition-all duration-500"
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
        ))}
      </div>
    </div>
  );
};
