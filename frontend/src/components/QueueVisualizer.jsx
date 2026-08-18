import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Box, AlertCircle, Server } from "lucide-react";
import { AddJobDialog } from "./AddJobDialog";

const GIFS = {
  working: "https://media1.tenor.com/m/k-zb5eircoYAAAAC/cat-ouch.gif",
  idle: "https://media1.tenor.com/m/JZqbcZi8jwoAAAAC/cat-kitten.gif",
  failed: "https://media1.tenor.com/m/Pq5EqV3tfrMAAAAC/cat-scream-cat-screaming.gif"
};

export function QueueVisualizer({ stats, bulkAddJobs }) {
  const [workers, setWorkers] = useState([
    { id: 1, name: "Worker-Alpha", state: "idle" },
    { id: 2, name: "Worker-Beta", state: "idle" },
    { id: 3, name: "Worker-Gamma", state: "idle" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers(prev => prev.map(w => {
        const rand = Math.random();
        let newState = "working";
        
        // If nothing is pending/processing in actual stats, mostly idle
        if (stats.processing === 0 && stats.pending === 0) {
           newState = rand < 0.1 ? "failed" : "idle";
        } else {
           if (rand < 0.1) newState = "failed";
           else if (rand < 0.4) newState = "idle";
        }
        
        return { ...w, state: newState };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [stats]);

  const getStatusColor = (state) => {
    switch (state) {
      case "working": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "idle": return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
      case "failed": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full mt-4">
      
      {/* Central Pipeline Info / Add Job */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between bg-[#0A0D14]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
         {/* Subtle scanline overlay for the container */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none mix-blend-overlay opacity-30"></div>
         
         <div className="flex flex-col mb-4 md:mb-0 text-left relative z-10">
           <h3 className="text-2xl font-serif italic text-white mb-2">Live Pipeline Simulation</h3>
           <p className="text-zinc-400 text-sm max-w-sm">Monitor job flow through the Redis streams and inject massive bursts to test concurrency.</p>
         </div>
         
         <div className="flex items-center gap-8 relative z-10">
           {/* Summary Stats */}
           <div className="flex gap-6">
             <div className="text-center">
               <div className="text-3xl font-medium text-yellow-500">{stats.pending}</div>
               <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-serif italic">Pending</div>
             </div>
             <div className="text-center">
               <div className="text-3xl font-medium text-blue-500">{stats.processing}</div>
               <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-serif italic">Active</div>
             </div>
           </div>
           
           <div className="pl-6 border-l border-white/10">
             <AddJobDialog onSubmit={bulkAddJobs} />
           </div>
         </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {workers.map((worker) => (
          <div key={worker.id} className="bg-[#0A0D14]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center shadow-2xl transition-all duration-300 hover:border-white/20">
            <div className="w-full flex justify-between items-center mb-4">
              <span className="font-mono text-sm text-zinc-300 flex items-center gap-2">
                <Server className="w-4 h-4 text-zinc-500" />
                {worker.name}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border ${getStatusColor(worker.state)} flex items-center gap-1.5 transition-colors`}>
                {worker.state === "working" && <Activity className="w-3 h-3" />}
                {worker.state === "idle" && <Box className="w-3 h-3" />}
                {worker.state === "failed" && <AlertCircle className="w-3 h-3" />}
                {worker.state}
              </span>
            </div>
            <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/5 bg-black/80 relative mb-4 shadow-inner">
              <img 
                src={GIFS[worker.state]} 
                alt={worker.state} 
                className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-lighten"
              />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none mix-blend-overlay"></div>
            </div>
            <div className="w-full text-left font-mono text-[10px] text-zinc-500 overflow-hidden h-12 bg-black/40 p-2 rounded-lg border border-white/5">
              {worker.state === "working" && <>
                <div className="text-orange-300/90">{`> Processing Job_#${Math.floor(Math.random()*90000)}`}</div>
                <div className="animate-pulse">{`> Extracting payload...`}</div>
              </>}
              {worker.state === "idle" && <>
                <div>{`> Waiting for queue...`}</div>
                <div className="animate-pulse">{`> Poll interval: 50ms`}</div>
              </>}
              {worker.state === "failed" && <>
                <div className="text-red-400">{`> FATAL: Worker crashed`}</div>
                <div className="text-red-400/70">{`> Stack trace dumped.`}</div>
              </>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
