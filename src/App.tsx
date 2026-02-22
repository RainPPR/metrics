import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { HomePage } from "./pages/HomePage";
import { ReposPage } from "./pages/ReposPage";
import { ShowcasePage } from "./pages/ShowcasePage";
import { AchievementPage } from "./pages/AchievementPage";
import { Navbar } from "./components/Navbar";

interface Data {
  users: any[];
  repos: any[];
  pages: any[];
  contributors: any[];
  languageStats: any[];
  achievements: any[];
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
          Synthesizing Engineering Soul...
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#FAFAFA] selection:bg-pink-100 selection:text-slate-900 pb-20 relative overflow-hidden font-sans">
        {/* Background Blobs (Healing Style) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-200/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute middle-0 left-1/2 w-[20%] h-[20%] bg-yellow-100/10 blur-[100px] rounded-full pointer-events-none translate-x-[-150%]" />
        
        <Navbar />

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageWrapper><HomePage data={data} /></PageWrapper>} />
            <Route path="/repos" element={<PageWrapper><ReposPage repos={data.repos} /></PageWrapper>} />
            <Route path="/showcase" element={<PageWrapper><ShowcasePage pages={data.pages} /></PageWrapper>} />
            <Route path="/achievements" element={<PageWrapper><AchievementPage achievements={data.achievements} stats={data.totalStats} /></PageWrapper>} />
          </Routes>
        </AnimatePresence>

        <footer className="mt-20 mb-32 text-center text-slate-400 font-mono text-[10px] uppercase tracking-widest opacity-50">
           Distributed Engineering Dashboard // Built with Code & Soul
        </footer>
      </div>
    </Router>
  );
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default App;
