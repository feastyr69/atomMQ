import { motion, AnimatePresence } from "framer-motion";
import { statusConfig, formatTimestamp, truncateId } from "../lib/utils";

export function JobTable({ jobs = [] }) {
  const sortedJobs = [...jobs].sort((a, b) => b.updated_at - a.updated_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-muted/30">
        <h2 className="text-sm font-semibold text-foreground">
          Recent Jobs
        </h2>
        <span className="text-xs font-medium text-muted-foreground bg-background border border-border/50 px-2.5 py-1 rounded-full shadow-sm">
          {jobs.length} total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/10">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Job ID
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Payload
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Attempts
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
              <AnimatePresence>
                {sortedJobs.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-muted-foreground text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                        <span>No jobs in queue — add one to get started</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  sortedJobs.map((job) => {
                    const config = statusConfig[job.status] || statusConfig.pending;
                    return (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                            {truncateId(job.id)}
                          </code>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm text-foreground/80 max-w-[200px] truncate block">
                            {typeof job.payload === "object"
                              ? JSON.stringify(job.payload)
                              : String(job.payload)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${config.color}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
                                job.status === "active" ? "animate-pulse" : ""
                              }`}
                            />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm text-muted-foreground font-mono">
                            {job.attempts}/{job.max_attempts}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(job.updated_at)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
    </motion.div>
  );
}
