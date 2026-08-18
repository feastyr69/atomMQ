import { Canvas } from "@react-three/fiber";
import { Scene } from "./hero/Scene";
import { Play, Database, Zap } from "lucide-react";
import { useScroll } from "framer-motion";

export function Hero() {
  const { scrollYProgress } = useScroll();

  return (
    <section className="relative w-full h-[90vh] bg-transparent flex items-center justify-center border-b border-white/10">
      {/* 3D Canvas */}
      <div className="fixed inset-0 w-full h-screen z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
          <Scene scrollYProgress={scrollYProgress} />
        </Canvas>
      </div>

      {/* --- Refactored Premium HTML UI --- */}
      <div className="relative z-10 w-full h-full max-w-6xl px-6 flex flex-col items-center justify-start pt-28 md:pt-36 mx-auto">
        
        {/* Top Tag */}
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 border border-white/10 text-[10px] font-mono text-zinc-400 mb-8 backdrop-blur-md uppercase tracking-[0.2em] relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent">
          <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          AtomMQ Engine v2.0
        </div>
        
        {/* Main Heading block with brackets */}
        <div className="relative flex items-center justify-center w-full px-8 md:px-16 mb-8 group">
          {/* Decorative Brackets */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 border-l-2 border-t-2 border-b-2 border-white/10 transition-colors duration-500 group-hover:border-white/30" />
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 border-r-2 border-t-2 border-b-2 border-white/10 transition-colors duration-500 group-hover:border-white/30" />
          
          <div className="flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tighter text-white leading-[1.05] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] text-center">
              Data Pipeline,<br/>
              <span className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.7)]">
                Perfected.
              </span>
            </h1>
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light mb-12 max-w-2xl mx-auto text-center font-display">
          Sub-millisecond latency. Zero task starvation. A highly concurrent job scheduler engineered natively on Redis streams.
        </p>

        {/* Action Button & Metrics Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full max-w-3xl">
          <button 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="group px-8 py-4 bg-white text-black font-display font-semibold tracking-wide transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] flex items-center gap-3 relative overflow-hidden"
          >
            {/* Button Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
            <Play className="w-4 h-4 fill-black" /> View Architecture
          </button>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-8 text-left border-l border-white/10 pl-8">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-1">
                <Zap className="w-3 h-3" /> Latency
              </div>
              <div className="font-display text-white text-lg font-medium">&lt;0.5ms</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-1">
                <Database className="w-3 h-3" /> Storage
              </div>
              <div className="font-display text-white text-lg font-medium">Redis</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
