import { motion } from "framer-motion";
import { AddJobDialog } from "./AddJobDialog";

export function Hero({ bulkAddJobs }) {
  return (
    <section className="relative w-full min-h-[60vh] flex flex-col items-center justify-center overflow-hidden border-b border-border/40 py-16">
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left: Copy & Actions */}
        <div className="flex-1 text-left space-y-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Distributed Scale. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Atomic Precision.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            AtomMQ is a high-performance, resilient job scheduling engine. Built on Redis, it handles millions of asynchronous tasks, retries, and distributed workloads with zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-4"
          >
            <AddJobDialog onSubmit={bulkAddJobs} isHero />
          </motion.div>
        </div>

        {/* Right: Immersive "Atom" Animation */}
        <div className="flex-1 relative h-[400px] w-full max-w-[400px] flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-72" style={{ perspective: "1000px" }}>
            {/* Nucleus */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 30px 5px rgba(167, 139, 250, 0.4)",
                  "0 0 50px 15px rgba(167, 139, 250, 0.6)",
                  "0 0 30px 5px rgba(167, 139, 250, 0.4)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-primary rounded-full blur-[2px]"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]" />

            {/* Orbit 1 */}
            <div className="absolute inset-0" style={{ transform: "rotateX(75deg) rotateY(20deg)" }}>
              <motion.div
                animate={{ rotateZ: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[3px] border-primary/20 rounded-full"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,1)]" />
              </motion.div>
            </div>

            {/* Orbit 2 */}
            <div className="absolute inset-0" style={{ transform: "rotateX(75deg) rotateY(-40deg)" }}>
              <motion.div
                animate={{ rotateZ: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[3px] border-primary/20 rounded-full"
              >
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(192,132,252,1)]" />
              </motion.div>
            </div>

            {/* Orbit 3 */}
            <div className="absolute inset-0" style={{ transform: "rotateX(60deg) rotateY(50deg)" }}>
              <motion.div
                animate={{ rotateZ: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[3px] border-primary/20 rounded-full"
              >
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,1)]" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
