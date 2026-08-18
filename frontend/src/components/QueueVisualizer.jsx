import { motion } from "framer-motion";
import { useMemo } from "react";

const NODE_LABELS = ["Pending", "Processing", "Completed"];
const BRANCH_LABELS = { delayed: "Delayed", failed: "Dead Letter" };

const nodeColors = {
  Pending: { bg: "bg-status-pending/20", border: "border-status-pending/50", text: "text-status-pending", dot: "#facc15" },
  Processing: { bg: "bg-status-active/20", border: "border-status-active/50", text: "text-status-active", dot: "#3b82f6" },
  Completed: { bg: "bg-status-completed/20", border: "border-status-completed/50", text: "text-status-completed", dot: "#22c55e" },
  Delayed: { bg: "bg-status-delayed/20", border: "border-status-delayed/50", text: "text-status-delayed", dot: "#f97316" },
  "Dead Letter": { bg: "bg-status-failed/20", border: "border-status-failed/50", text: "text-status-failed", dot: "#ef4444" },
};

function FlowDot({ color, delay, duration, pathVariant }) {
  if (pathVariant === "main") {
    return (
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        initial={{ left: "0%", opacity: 0 }}
        animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    );
  }
  return null;
}

export function QueueVisualizer({ stats }) {
  const hasProcessing = stats.processing > 0;
  const hasPending = stats.pending > 0;

  const particles = useMemo(() => {
    const dots = [];
    const count = Math.min(hasPending ? 3 : 1, 3);
    for (let i = 0; i < count; i++) {
      dots.push({ id: i, delay: i * 1.2, duration: 2.5 });
    }
    return dots;
  }, [hasPending]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="rounded-xl border border-border bg-card shadow-sm p-6 overflow-x-auto"
    >
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
        Queue Pipeline
      </h2>

      {/* Main flow */}
      <div className="flex items-center gap-0 min-w-max">
        {NODE_LABELS.map((label, i) => {
          const colors = nodeColors[label];
          const count =
            label === "Pending"
              ? stats.pending
              : label === "Processing"
              ? stats.processing
              : "✓";
          return (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`relative flex flex-col items-center justify-center rounded-lg border ${colors.bg} ${colors.border} px-5 py-4 min-w-[120px]`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text} mb-1.5`}>
                  {label}
                </span>
                <motion.span
                  key={count}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-2xl font-semibold ${colors.text}`}
                >
                  {count}
                </motion.span>
              </div>

              {/* Connector line with flowing dots */}
              {i < NODE_LABELS.length - 1 && (
                <div className="relative w-16 h-[1px] mx-2 shrink-0">
                  <div className="absolute inset-0 bg-border" />
                  {(hasPending || hasProcessing) &&
                    particles.map((p) => (
                      <FlowDot
                        key={p.id}
                        color={i === 0 ? nodeColors.Pending.dot : nodeColors.Processing.dot}
                        delay={p.delay}
                        duration={p.duration}
                        pathVariant="main"
                      />
                    ))}
                  {/* Arrow */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Branch flows: Delayed and Dead Letter */}
      <div className="flex justify-center gap-24 mt-6 min-w-max">
        {Object.entries(BRANCH_LABELS).map(([key, label]) => {
          const colors = nodeColors[label];
          const count = key === "delayed" ? stats.delayed : stats.deadLetter;
          return (
            <div key={key} className="flex flex-col items-center gap-3">
              <div className="w-[1px] h-8 bg-border" />
              <div
                className={`flex flex-col items-center justify-center rounded-lg border ${colors.bg} ${colors.border} px-5 py-4 min-w-[120px]`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text} mb-1.5`}>
                  {label}
                </span>
                <motion.span
                  key={count}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-2xl font-semibold ${colors.text}`}
                >
                  {count}
                </motion.span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
