import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export function AddJobDialog({ onSubmit, isHero = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState('{ "task": "example", "data": "hello" }');
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [jobCount, setJobCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        parsedPayload = payload;
      }

      if (jobCount > 1) {
        const results = await onSubmit(parsedPayload, jobCount, maxAttempts);
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        setFeedback({ type: successCount === jobCount ? "success" : "error", message: `Successfully queued ${successCount}/${jobCount} jobs` });
      } else {
        const result = await onSubmit(parsedPayload, maxAttempts);
        // Note: bulkAddJobs array or single addJob object difference needs handling, assuming onSubmit is always bulkAddJobs here since we passed it in Hero
        // Wait, if it's bulkAddJobs, it returns Promise.allSettled array. Let's unify.
        if (Array.isArray(result)) {
           setFeedback({ type: "success", message: `Job ${result[0]?.value?.jobId?.slice(0, 8)}… created` });
        } else {
           setFeedback({ type: "success", message: `Job ${result.jobId?.slice(0, 8)}… created` });
        }
      }

      setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
      }, 1500);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isHero ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg transition-all hover:shadow-[0_0_20px_rgba(167,139,250,0.4)] cursor-pointer"
        >
          Simulate Load
          <svg className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm transition-all hover:shadow-lg hover:shadow-primary/25 cursor-pointer"
          id="add-job-button"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" /><path d="M5 12h14" />
          </svg>
          Add Job
        </motion.button>
      )}

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />

              {/* Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
              >
                <div
                  className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 shrink-0 bg-muted/30">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Add New Job
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Submit a new task to the queue
                      </p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 -mr-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {/* Payload */}
                    <div className="space-y-3">
                      <label
                        htmlFor="payload-input"
                        className="text-sm font-medium text-foreground"
                      >
                        Payload
                      </label>
                      <textarea
                        id="payload-input"
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        rows={5}
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all resize-none shadow-sm"
                        placeholder='{ "key": "value" }'
                      />
                    </div>

                    {/* Max Attempts */}
                    <div className="space-y-3">
                      <label
                        htmlFor="max-attempts-input"
                        className="text-sm font-medium text-foreground flex items-center justify-between"
                      >
                        <span>Max Attempts</span>
                        <span className="text-muted-foreground">{maxAttempts}</span>
                      </label>
                      <input
                        id="max-attempts-input"
                        type="range"
                        min={1}
                        max={10}
                        value={maxAttempts}
                        onChange={(e) =>
                          setMaxAttempts(parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full accent-primary"
                      />
                    </div>

                    {/* Concurrent Jobs */}
                    <div className="space-y-3">
                      <label
                        htmlFor="job-count-input"
                        className="text-sm font-medium text-foreground flex items-center justify-between"
                      >
                        <span>Concurrent Jobs</span>
                        <span className="text-primary font-bold">{jobCount}</span>
                      </label>
                      <input
                        id="job-count-input"
                        type="range"
                        min={1}
                        max={50}
                        value={jobCount}
                        onChange={(e) =>
                          setJobCount(parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full accent-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        Simulate bulk insertion to test queue concurrency.
                      </p>
                    </div>

                    {/* Feedback */}
                    <AnimatePresence>
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`text-sm px-3 py-2 rounded-md ${
                            feedback.type === "success"
                              ? "bg-status-completed/10 text-status-completed border border-status-completed/20"
                              : "bg-status-failed/10 text-status-failed border border-status-failed/20"
                          }`}
                        >
                          {feedback.message}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border/50 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-border/50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                        id="submit-job-button"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" />
                            </svg>
                            Submitting…
                          </>
                        ) : (
                          "Submit Job"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
