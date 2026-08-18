import { useState, useEffect, useRef, useCallback } from "react";

const WS_URL = "ws://localhost:3000";

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
    const res = await fetch("http://localhost:3000/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, max_attempts: maxAttempts }),
    });

    if (!res.ok) {
      throw new Error(`Failed to add job: ${res.statusText}`);
    }

    return res.json();
  }, []);

  return { stats, jobs, connected, addJob };
}
