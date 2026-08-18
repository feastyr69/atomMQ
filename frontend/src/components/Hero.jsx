import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./hero/Scene";
import { AddJobDialog } from "./AddJobDialog";
import { Terminal, Copy, Check, Database, Activity, Zap } from "lucide-react";

export function Hero({ bulkAddJobs }) {
  const containerRef = useRef(null);
  
  // Track scroll progress of this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // HTML Overlay Transforms
  // Stage 0: 0% to 30%
  const stage0Opacity = useTransform(scrollYProgress, [0, 0.25, 0.3], [1, 1, 0]);
  const stage0Y = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  // Stage 1: 35% to 65%
  const stage1Opacity = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const stage1Y = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [50, 0, 0, -50]);

  // Stage 2/3: 70% to 100%
  const stage2Opacity = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);
  const stage2Y = useTransform(scrollYProgress, [0.7, 0.8], [50, 0]);

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText("npm install @atommq/engine");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-[#05070D]">
      {/* Sticky Container for 3D and UI */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        
        {/* 3D Canvas */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
            <Scene scrollYProgress={scrollYProgress} />
          </Canvas>
        </div>

        {/* --- HTML UI Overlays --- */}
        <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
          
          {/* Stage 0 */}
          <motion.div 
            style={{ opacity: stage0Opacity, y: stage0Y }}
            className="absolute max-w-4xl px-6 text-center pointer-events-auto flex flex-col items-center"
          >
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              POWERED BY REDIS
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-medium tracking-tight text-white leading-tight font-serif italic mb-6 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
              Orchestrate millions of jobs with <br/>
              <span className="italic text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
                atomic precision.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400/80 leading-relaxed font-light mb-10 max-w-2xl font-serif italic">
              A lightning-fast, fault-tolerant job scheduler engine engineered for distributed scale, sub-millisecond dispatching, and zero task starvation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="px-8 py-3.5 rounded-lg bg-white text-black font-serif italic tracking-wide transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]">
                Deploy Engine
              </button>
              
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-5 py-3 font-mono text-sm text-zinc-300 backdrop-blur-md">
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
            className="absolute max-w-4xl px-6 text-center pointer-events-auto flex flex-col items-center"
          >
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-white leading-tight mb-6 font-serif italic drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Sub-millisecond Concurrency. <br/>
              <span className="italic text-zinc-500">Zero Bottlenecks.</span>
            </h2>
            <p className="text-xl md:text-2xl text-zinc-400/80 leading-relaxed font-light font-serif italic max-w-2xl">
              Our core engine leverages Redis streams and lock-free data structures, ensuring your background tasks are dispatched the microsecond they're ready.
            </p>
          </motion.div>

          {/* Stage 2/3 - Mockup UI */}
          <motion.div 
            style={{ opacity: stage2Opacity, y: stage2Y }}
            className="absolute w-full max-w-lg px-6 pointer-events-auto flex flex-col items-center hidden lg:flex"
          >
            <div className="w-full bg-[#0A0D14]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl text-left">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-serif italic text-lg tracking-wide flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-400" /> Active Queues
                </h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-mono text-green-400">Connected</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: "video-encoding", waiting: "12,400", active: "150" },
                  { name: "email-notifications", waiting: "450", active: "32" },
                  { name: "webhooks-dispatch", waiting: "8,921", active: "500" },
                ].map((queue) => (
                  <div key={queue.name} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm font-medium text-white/90">{queue.name}</span>
                    </div>
                    <div className="flex gap-6 text-xs font-mono">
                      <span className="text-zinc-500">Wait: <span className="text-zinc-300">{queue.waiting}</span></span>
                      <span className="text-zinc-500">Act: <span className="text-white">{queue.active}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                <div>
                  <div className="text-xs text-zinc-500 mb-1 font-serif italic tracking-wider uppercase">Processed Jobs</div>
                  <div className="text-xl text-white font-medium">14.2M</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1 font-serif italic tracking-wider uppercase">Redis Memory</div>
                  <div className="text-xl text-white font-medium">42 MB</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1 font-serif italic tracking-wider uppercase">Latency</div>
                  <div className="text-xl text-white font-medium flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" /> {"<"}1ms
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <AddJobDialog onSubmit={bulkAddJobs} isHero />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
