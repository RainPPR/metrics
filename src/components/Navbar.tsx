import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, List, Rocket, Award } from "lucide-react";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { path: "/", icon: <LayoutGrid size={20} />, label: "Grid" },
  { path: "/repos", icon: <List size={20} />, label: "Repos" },
  { path: "/showcase", icon: <Rocket size={20} />, label: "Show" },
  { path: "/achievements", icon: <Award size={20} />, label: "Awards" },
];

export const Navbar = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-pink-100/30 rounded-full"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "relative flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-pink-50 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              {isActive && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  className="relative z-10 text-xs font-bold font-mono overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
};
