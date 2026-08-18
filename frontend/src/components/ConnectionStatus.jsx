import { motion } from "framer-motion";

export function ConnectionStatus({ connected }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <span className="relative flex h-2.5 w-2.5">
        {connected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-completed opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            connected ? "bg-status-completed" : "bg-status-failed"
          }`}
        />
      </span>
      <span className="text-xs text-muted-foreground font-medium">
        {connected ? "Live" : "Disconnected"}
      </span>
    </motion.div>
  );
}
