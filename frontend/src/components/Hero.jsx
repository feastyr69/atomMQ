import { Canvas } from "@react-three/fiber";
import { Scene } from "./hero/Scene";
import { Play } from "lucide-react";
import { useScroll } from "framer-motion";

export function Hero() {
  const { scrollYProgress } = useScroll();

  return (
    <section className="relative w-full h-[90vh] bg-[#010204] overflow-hidden flex items-center justify-center border-b border-white/10">
      {/* 3D Canvas */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
          <Scene scrollYProgress={scrollYProgress} />
        </Canvas>
      </div>

      {/* --- Static HTML UI --- */}
      <div className="relative z-10 w-full h-full max-w-5xl px-6 flex flex-col items-center justify-start pt-24 md:pt-32 mx-auto text-center">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          ENTERPRISE GRADE
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          Data Pipeline, <br/>
          <span className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.8)]">
            Perfected.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light mb-10 max-w-2xl mx-auto drop-shadow-md">
          Replace brittle cron jobs and messy queues with a unified, high-throughput pipeline engine engineered on top of Redis.
        </p>

        <button 
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="px-8 py-3.5 rounded-xl bg-white text-black font-semibold tracking-wide transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.7)] hover:-translate-y-1 flex items-center gap-3"
        >
          <Play className="w-4 h-4 fill-black" /> See the Flow
        </button>
      </div>
    </section>
  );
}
