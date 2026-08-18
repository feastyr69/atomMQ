import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const WS_URL = API_URL.replace(/^http/, "ws");

export function useDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    delayed: 0,
    deadLetter: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("[ws] connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "dashboard_update") {
          setStats(data.stats);
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("[ws] parse error:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("[ws] disconnected, reconnecting in 3s...");
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const addJob = useCallback(async (payload, maxAttempts = 3) => {
    const res = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, max_attempts: maxAttempts }),
    });

    if (!res.ok) {
      throw new Error(`Failed to add job: ${res.statusText}`);
    }

    return res.json();
  }, []);

  const bulkAddJobs = useCallback(async (basePayload, count, maxAttempts = 3) => {
    const promises = [];
    for (let i = 0; i < count; i++) {
      const payload = typeof basePayload === 'object' 
        ? { ...basePayload, _bulkId: i, _timestamp: Date.now() }
        : `${basePayload} (Bulk ${i + 1}/${count})`;
        
      promises.push(
        fetch(`${API_URL}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload, max_attempts: maxAttempts }),
        }).then(res => {
          if (!res.ok) throw new Error(`Failed job ${i}`);
          return res.json();
        })
      );
    }
    return Promise.allSettled(promises);
  }, []);

  return { stats, jobs, connected, addJob, bulkAddJobs };
}
