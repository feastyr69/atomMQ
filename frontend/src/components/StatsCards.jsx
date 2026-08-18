import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export function StatsCards({ stats }) {
  const cards = [
    {
      label: "Pending",
      value: stats.pending,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      gradient: "from-yellow-500/20 to-amber-500/5",
      iconColor: "text-status-pending",
      borderColor: "border-status-pending/20",
      glowColor: "shadow-status-pending/10",
    },
    {
      label: "Processing",
      value: stats.processing,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" />
        </svg>
      ),
      gradient: "from-blue-500/20 to-cyan-500/5",
      iconColor: "text-status-active",
      borderColor: "border-status-active/20",
      glowColor: "shadow-status-active/10",
      pulse: stats.processing > 0,
    },
    {
      label: "Delayed",
      value: stats.delayed,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2h4" /><path d="M12 14v-4" /><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6" /><path d="M9 17H4v5" />
        </svg>
      ),
      gradient: "from-orange-500/20 to-amber-500/5",
      iconColor: "text-status-delayed",
      borderColor: "border-status-delayed/20",
      glowColor: "shadow-status-delayed/10",
    },
    {
      label: "Dead Letter",
      value: stats.deadLetter,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
        </svg>
      ),
      gradient: "from-red-500/20 to-rose-500/5",
      iconColor: "text-status-failed",
      borderColor: "border-status-failed/20",
      glowColor: "shadow-status-failed/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
          className={cn(
            "rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/10",
            card.pulse && "pulse-soft ring-1 ring-status-active/30"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              {card.label}
            </span>
            <div className={cn(card.iconColor)}>
              {card.icon}
            </div>
          </div>
          <motion.div
            key={card.value}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="text-3xl font-semibold tracking-tight text-foreground"
          >
            {card.value}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
