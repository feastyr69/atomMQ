import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./hero/Scene";
import { Terminal, Copy, Check, Activity, Box, AlertCircle, Play, Database, Server } from "lucide-react";

// --- Worker Grid Component ---
const GIFS = {
  working: "https://media1.tenor.com/m/k-zb5eircoYAAAAC/cat-ouch.gif",
  idle: "https://media1.tenor.com/m/JZqbcZi8jwoAAAAC/cat-kitten.gif",
  failed: "https://media1.tenor.com/m/Pq5EqV3tfrMAAAAC/cat-scream-cat-screaming.gif"
};

function WorkerGrid() {
  const [workers, setWorkers] = useState([
    { id: 1, name: "Worker-Alpha", state: "working" },
    { id: 2, name: "Worker-Beta", state: "idle" },
    { id: 3, name: "Worker-Gamma", state: "failed" }
  ]);

  useEffect(() => {
    // Randomly change worker states every few seconds to simulate live pipeline
    const interval = setInterval(() => {
      setWorkers(prev => prev.map(w => {
        const rand = Math.random();
        let newState = "working";
        if (rand < 0.2) newState = "failed";
        else if (rand < 0.5) newState = "idle";
        
        return { ...w, state: newState };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (state) => {
    switch (state) {
      case "working": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "idle": return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
      case "failed": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
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
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            {/* Scanline overlay for that "terminal" feel */}
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
  );
}

export function Hero() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Stage 0: Main intro (0% to 30%)
  const stage0Opacity = useTransform(scrollYProgress, [0, 0.25, 0.3], [1, 1, 0]);
  const stage0Y = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  // Stage 1: Pipeline Flow intro (35% to 65%)
  const stage1Opacity = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const stage1Y = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [50, 0, 0, -50]);

  // Stage 2: Telemetry/Workers (70% to 100%)
  const stage2Opacity = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);
  const stage2Y = useTransform(scrollYProgress, [0.7, 0.8], [50, 0]);

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText("npm install @atommq/engine");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-[#010204]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        
        {/* 3D Canvas */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
            <Scene scrollYProgress={scrollYProgress} />
          </Canvas>
        </div>

        {/* --- HTML UI Overlays --- */}
        <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
          
          {/* Stage 0 */}
          <motion.div 
            style={{ opacity: stage0Opacity, y: stage0Y }}
            className="absolute w-full px-6 text-center pointer-events-auto flex flex-col items-center"
          >
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              THE DATA PIPELINE
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white leading-tight font-serif italic mb-6 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
              Your Pipeline, <br/>
              <span className="italic text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                Perfected.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400/80 leading-relaxed font-light mb-10 max-w-2xl font-serif italic mx-auto">
              Replace brittle cron jobs and messy queues with a unified, high-throughput pipeline engine. Built on Redis.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="px-8 py-3.5 rounded-lg bg-white text-black font-serif italic tracking-wide transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] flex items-center gap-2">
                <Play className="w-4 h-4 fill-black" /> See the Flow
              </button>
              
              <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-5 py-3 font-mono text-sm text-zinc-300 backdrop-blur-md">
                <Terminal className="w-4 h-4 mr-3 text-zinc-500" />
                <span>npm install @atommq/engine</span>
                <button onClick={handleCopy} className="ml-5 text-zinc-400 hover:text-white transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stage 1 */}
          <motion.div 
            style={{ opacity: stage1Opacity, y: stage1Y }}
            className="absolute w-full px-6 text-center pointer-events-auto flex flex-col items-center"
          >
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-white leading-tight mb-6 font-serif italic drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Producer &rarr; Redis &rarr; Consumer
            </h2>
            <p className="text-xl md:text-2xl text-zinc-400/80 leading-relaxed font-light font-serif italic max-w-3xl mx-auto mb-12">
              Jobs are pushed into resilient Redis streams, multiplexed, and instantly dispatched to available worker nodes with zero contention. 
            </p>

            <div className="flex items-center justify-center gap-4 text-sm font-mono text-zinc-500 bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-3xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <span>Producer</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent relative">
                 <div className="absolute top-1/2 left-0 w-2 h-2 -mt-1 bg-orange-400 rounded-full shadow-[0_0_10px_orange] animate-[ping_2s_linear_infinite]" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                  <Database className="w-8 h-8 text-orange-400" />
                </div>
                <span className="text-orange-200">Redis Stream</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent relative">
                <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 bg-orange-400 rounded-full shadow-[0_0_10px_orange] animate-[ping_2s_linear_infinite_0.5s]" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span>Consumer</span>
              </div>
            </div>
          </motion.div>

          {/* Stage 2 - Telemetry Dashboard with Cats */}
          <motion.div 
            style={{ opacity: stage2Opacity, y: stage2Y }}
            className="absolute w-full px-6 pointer-events-auto flex flex-col items-center hidden md:flex"
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl font-medium tracking-tight text-white mb-3 font-serif italic drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Live Worker Telemetry
              </h2>
              <p className="text-lg text-zinc-400 font-serif italic">
                Monitor your highly productive (and occasionally catastrophic) workforce in real-time.
              </p>
            </div>
            
            <WorkerGrid />
            
          </motion.div>

        </div>
      </div>
    </section>
  );
}
