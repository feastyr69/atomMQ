import { motion } from "framer-motion";
import { Server, Cpu, Database, Zap, ShieldCheck, RotateCcw, FileWarning, Layers } from "lucide-react";

const ARCHITECTURE = [
  {
    icon: <Server className="w-5 h-5 text-zinc-300" />,
    title: "Producer",
    description: "Express API that ingests work, stores job metadata, and pushes jobs to a pending queue."
  },
  {
    icon: <Cpu className="w-5 h-5 text-zinc-300" />,
    title: "Consumer",
    description: "Worker Node process that polls Redis for work and executes jobs in the background."
  },
  {
    icon: <Database className="w-5 h-5 text-zinc-300" />,
    title: "Data Store (Redis)",
    description: "Job Metadata: Hashes (job:{jobId}). Pending Queue: List. Processing Queue: List."
  }
];

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5 text-white" />,
    title: "Atomic Queue Operations",
    description: "Uses Redis MULTI/EXEC and BLMOVE for safe, blocking queue pops without race conditions."
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-white" />,
    title: "Idempotency",
    description: "Ensures jobs are not processed multiple times, even in the event of network partitions or retries."
  },
  {
    icon: <RotateCcw className="w-5 h-5 text-white" />,
    title: "Crash Recovery",
    description: "Maintains an active processing queue to guarantee zero data loss if workers crash mid-execution."
  },
  {
    icon: <FileWarning className="w-5 h-5 text-white" />,
    title: "Dead-Letter Queue",
    description: "Implements exponential backoff and safe isolation for handling and analyzing failed jobs."
  }
];

export function ArchitectureSection() {
  return (
    <section className="w-full mt-24 mb-16 px-4 md:px-0 relative z-10">
      
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-zinc-400 mb-6 uppercase tracking-widest backdrop-blur-md">
          <Layers className="w-3.5 h-3.5" />
          System Architecture
        </div>
        <h2 className="text-3xl md:text-5xl font-serif italic text-white tracking-wide mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          Built on Redis Primitives
        </h2>
        <p className="text-sm md:text-base text-zinc-400 max-w-2xl font-light leading-relaxed">
          AtomMQ leverages native Redis data structures to deliver a highly concurrent, reliable, and horizontally scalable job queue architecture without the overhead of heavy message brokers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Architecture Stack */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2">Core Components</h3>
          {ARCHITECTURE.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="p-5 md:p-6 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-[#111] transition-all flex gap-4 items-start shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            >
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-zinc-200 font-medium mb-1.5">{item.title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed font-light">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2">Key Capabilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 flex flex-col hover:border-white/30 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                <div className="p-2.5 bg-white/10 rounded-lg border border-white/10 self-start mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-white font-medium mb-2">{feature.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light mt-auto">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
    </section>
  );
}
