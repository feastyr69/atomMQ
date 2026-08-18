import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Terminal, Server, ArrowRight, Play } from "lucide-react";
import { AddJobDialog } from "./AddJobDialog";
import { statusConfig, truncateId, formatTimestamp } from "../lib/utils";

const GIFS = {
  working: "https://media1.tenor.com/m/k-zb5eircoYAAAAC/cat-ouch.gif",
  idle: "https://media1.tenor.com/m/JZqbcZi8jwoAAAAC/cat-kitten.gif",
  failed: "https://media1.tenor.com/m/Pq5EqV3tfrMAAAAC/cat-scream-cat-screaming.gif"
};

const WORKER_COUNT = 3;

function AnimatedStat({ value }) {
  const [deltas, setDeltas] = useState([]);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && prevValue.current !== undefined) {
      const diff = value - prevValue.current;
      if (diff !== 0) {
        const id = Date.now() + Math.random();
        setDeltas((d) => [...d, { id, diff }]);
        setTimeout(() => {
          setDeltas((d) => d.filter((item) => item.id !== id));
        }, 1200);
      }
    }
    prevValue.current = value;
  }, [value]);

  return (
    <div className="relative inline-flex justify-center items-center">
      <span>{value}</span>
      <AnimatePresence>
        {deltas.map(({ id, diff }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -25, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute font-mono text-xs md:text-sm font-bold pointer-events-none drop-shadow-md whitespace-nowrap ${
              diff > 0 ? "text-white" : "text-zinc-400"
            }`}
            style={{ left: "120%", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            {diff > 0 ? `+${diff}` : diff}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function SystemGraph({ stats, jobs, bulkAddJobs }) {
  const [workers, setWorkers] = useState(
    Array.from({ length: WORKER_COUNT }).map((_, i) => ({
      id: i,
      name: `Worker-${String.fromCharCode(65 + i)}`,
      state: "idle",
    }))
  );

  const prevStats = useRef(stats);
  const constraintsRef = useRef(null);

  // Sync worker states with real stats
  useEffect(() => {
    const processing = stats.processing;
    const deadLetterIncreased = stats.deadLetter > prevStats.current.deadLetter;
    const delayedIncreased = stats.delayed > prevStats.current.delayed;
    const hasFailure = deadLetterIncreased || delayedIncreased;

    setWorkers(prev => {
      let next = prev.map(w => ({ ...w }));

      // Handle crashes if a job fails (either dead letter or delayed retry)
      if (hasFailure) {
        const failIdx = Math.floor(Math.random() * WORKER_COUNT);
        next[failIdx].state = "failed";

        // Revert fastly to create a quick flashing effect for the error
        setTimeout(() => {
          setWorkers(curr => {
            const copy = curr.map(w => ({ ...w }));
            if (copy[failIdx].state === "failed") {
              copy[failIdx].state = "idle";
              return copy;
            }
            return curr;
          });
        }, 800);
      }

      let assigned = 0;
      for (let i = 0; i < next.length; i++) {
        if (next[i].state === "failed" && !hasFailure) {
          next[i].state = "idle";
        }

        if (next[i].state !== "failed") {
          if (assigned < processing) {
            next[i].state = "working";
            assigned++;
          } else {
            next[i].state = "idle";
          }
        }
      }
      return next;
    });

    prevStats.current = stats;
  }, [stats]);

  return (
    <div className="relative w-full min-h-[850px] bg-[#010204]/90 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col mt-4">
      {/* Background Grid & FX */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,100,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-8 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-white tracking-wide">Live Queue Simulation</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] mt-1">Graph Based Visualization</p>
        </div>
      </div>

      {/* Main Graph Area */}
      <div ref={constraintsRef} className="relative z-10 flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div
          drag
          dragConstraints={constraintsRef}
          className="relative flex items-center justify-between min-w-[750px] lg:min-w-[1000px] w-full h-full p-4 md:p-8 lg:px-16 pb-8 md:pb-16 mx-auto"
        >

          {/* SVG Connectors - Background Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.15)" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
                </marker>
                <marker id="arrow-fail" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#a1a1aa" />
                </marker>
              </defs>

              {/* Producer to Queue */}
              <g>
                <motion.path
                  d="M 18 45 L 35 45"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                  markerEnd="url(#arrow)"
                  fill="none"
                />
              </g>

              {/* Queue to Workers */}
              {workers.map((w, i) => {
                const yPositions = [15, 45, 75];
                const targetY = yPositions[i];
                const isWorking = w.state === "working";

                return (
                  <g key={`flow-${i}`}>
                    <motion.path
                      d={`M 55 45 C 65 45, 65 ${targetY}, 75 ${targetY}`}
                      fill="none"
                      stroke={isWorking ? "#ffffff" : "rgba(255,255,255,0.15)"}
                      strokeWidth={isWorking ? 2 : 2}
                      strokeDasharray="2 2"
                      vectorEffect="non-scaling-stroke"
                      initial={{ strokeDashoffset: 0 }}
                      animate={isWorking ? { strokeDashoffset: -10 } : { strokeDashoffset: 0 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      markerEnd={isWorking ? "url(#arrow-active)" : "url(#arrow)"}
                      className="transition-colors duration-500"
                    />
                  </g>
                );
              })}

              {/* Delayed Queue to Redis Hub (Vertical Edge) */}
              <g>
                <motion.path
                  d="M 45 75 L 45 60"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                  markerEnd="url(#arrow)"
                  fill="none"
                />
              </g>
            </svg>
          </div>

          {/* Node 1: Producer */}
          <div className="relative z-10 w-[15%] flex flex-col items-center">
            <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 md:p-5 shadow-2xl text-center relative overflow-hidden group hover:border-white/30 transition-colors">
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 mb-3 md:mb-4 font-bold">Client / Producer</div>
              <div className="flex justify-center mb-3 md:mb-4">
                <Server className="w-8 h-8 md:w-10 md:h-10 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <AddJobDialog onSubmit={bulkAddJobs} />
            </div>
          </div>

          {/* Middle Column: Queues */}
          <div className="relative z-10 w-[20%] flex flex-col items-center">

            {/* Node 2: Redis Hub */}
            <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 md:p-6 shadow-[0_0_40px_rgba(255,255,255,0.03)] text-center relative overflow-hidden">
              {stats.processing > 0 && (
                <div className="absolute top-0 left-0 w-full h-1 bg-white shadow-[0_0_20px_#ffffff]" />
              )}
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-200 mb-4 md:mb-6 font-bold flex justify-center items-center gap-2">
                <Database className="w-3 h-3 md:w-4 md:h-4" /> Redis Queue
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="bg-black/50 p-2 md:p-3 rounded-lg border border-white/5">
                  <div className="text-xl md:text-3xl font-light text-white">
                    <AnimatedStat value={stats.pending} />
                  </div>
                  <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase mt-1">Pending</div>
                </div>
                <div className="bg-black/50 p-2 md:p-3 rounded-lg border border-white/5">
                  <div className="text-xl md:text-3xl font-light text-white">
                    <AnimatedStat value={stats.processing} />
                  </div>
                  <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase mt-1">Active</div>
                </div>
              </div>

              <div className="flex gap-2 justify-center mt-3 md:mt-4">
                <div className="px-2 py-1 bg-zinc-800/50 border border-white/10 text-zinc-400 text-[9px] md:text-[10px] rounded-md font-mono flex items-center gap-1">
                  Dead: <AnimatedStat value={stats.deadLetter} />
                </div>
              </div>
            </div>

            {/* Node 4: Delayed Queue */}
            <div className="absolute top-[130%] w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 md:p-6 shadow-2xl text-center overflow-hidden group hover:border-white/30 transition-colors flex flex-col items-center">
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-400 mb-3 md:mb-4 font-bold flex items-center justify-center gap-2">
                Delayed Queue
              </div>
              <div className="bg-black/50 p-2 md:p-3 rounded-lg border border-white/5 w-full">
                <div className="text-xl md:text-3xl font-light text-white">
                  <AnimatedStat value={stats.delayed} />
                </div>
                <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase mt-1">Waiting Retry</div>
              </div>
            </div>

          </div>

          {/* Node 3 Column: Workers */}
          <div className="relative z-10 w-[22%] flex flex-col gap-6 md:gap-8">
            {workers.map((worker) => {
              const isWorking = worker.state === "working";
              const isFailed = worker.state === "failed";

              return (
                <div
                  key={worker.id}
                  className={`relative w-full aspect-square md:aspect-auto md:h-56 rounded-xl border flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300
                  ${isWorking ? "border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)]" : ""}
                  ${isFailed ? "border-zinc-500/50 shadow-[0_0_30px_rgba(255,255,255,0.05)]" : ""}
                  ${!isWorking && !isFailed ? "border-white/10 bg-[#0a0a0a]" : ""}
                `}
                >
                  {/* Big Square Cat Avatar (No Scanlines) */}
                  <img
                    src={GIFS[worker.state]}
                    alt={worker.state}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300
                    ${worker.state === "idle" ? "object-top" : "object-center"}
                    ${isWorking ? "opacity-90 mix-blend-lighten" : isFailed ? "opacity-100 mix-blend-normal" : "opacity-60 grayscale-[50%]"}
                  `}
                  />

                  {/* Worker Header Info */}
                  <div className="relative z-10 p-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-serif italic text-sm md:text-base text-white tracking-wide">{worker.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5">PID: 9{worker.id}34</span>
                    </div>
                    <span className={`px-2 py-1 text-[9px] uppercase tracking-wider font-bold rounded-md bg-black/60 backdrop-blur-md border border-white/10
                    ${isWorking ? "text-zinc-200 border-white/30" : isFailed ? "text-zinc-400 border-zinc-500/30" : "text-zinc-400"}`}>
                      {worker.state}
                    </span>
                  </div>

                  {/* Status Terminal Overlay at Bottom */}
                  <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/80 to-transparent mt-auto">
                    <div className="w-full bg-black/80 rounded border border-white/10 p-2 flex flex-col font-mono text-[10px] shadow-inner">
                      {isWorking ? (
                        <>
                          <span className="text-zinc-300">{`> RECV job_payload`}</span>
                          <span className="text-white/60 animate-pulse">{`> processing...`}</span>
                        </>
                      ) : isFailed ? (
                        <>
                          <span className="text-zinc-400">{`> FATAL_EXCEPTION`}</span>
                          <span className="text-zinc-500">{`> core dumped`}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-zinc-500">{`> idled`}</span>
                          <span className="text-zinc-600">{`> waiting on queue`}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Embedded Job Feed (System Log) */}
      <div className="relative shrink-0 w-full h-40 border-t border-white/10 bg-black/60 backdrop-blur-xl p-4 md:p-6 flex flex-col z-30">
        <div className="flex items-center gap-2 mb-3 text-zinc-400 text-xs font-mono tracking-widest uppercase">
          <Terminal className="w-4 h-4" />
          Event Log
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence>
            {jobs.length === 0 && (
              <div className="text-zinc-600 text-xs font-mono py-2">No recent system events.</div>
            )}
            {jobs.slice(0, 10).map((job) => {
              const config = statusConfig[job.status] || statusConfig.pending;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-6 text-xs font-mono border-b border-white/5 pb-2"
                >
                  <span className="text-zinc-500 w-16 shrink-0">{formatTimestamp(job.updated_at).split(" ")[1]}</span>
                  <span className="text-zinc-300 w-24 shrink-0 truncate">{truncateId(job.id)}</span>
                  <span className={`w-20 shrink-0 ${config.color.replace('border-', 'text-').replace('/20', '')} flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                  <span className="text-zinc-500 flex-1 truncate">
                    {typeof job.payload === "object" ? JSON.stringify(job.payload) : String(job.payload)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
