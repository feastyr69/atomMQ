import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "./hooks/useDashboard";
import { StatsCards } from "./components/StatsCards";
import { QueueVisualizer } from "./components/QueueVisualizer";
import { JobTable } from "./components/JobTable";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { Hero } from "./components/Hero";

export default function App() {
  const { stats, jobs, connected, bulkAddJobs } = useDashboard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-lg shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                {/* Logo */}
                <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" />
                    <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" />
                  </svg>
                </div>

                <div>
                  <h1 className="text-base font-semibold tracking-tight text-foreground">
                    AtomMQ
                  </h1>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-5">
              <ConnectionStatus connected={connected} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero bulkAddJobs={bulkAddJobs} />

      {/* Main Content Area */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto px-6 py-12 space-y-8">
        <StatsCards stats={stats} />
        <QueueVisualizer stats={stats} />
        <JobTable jobs={jobs} />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/30 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">
            AtomMQ — Redis-backed distributed job queue
          </p>
          <p className="text-xs text-muted-foreground/40">
            Built with React + Framer Motion
          </p>
        </div>
      </footer>
    </div>
  );
}
