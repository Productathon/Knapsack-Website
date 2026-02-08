"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, Terminal, RefreshCw, XCircle, CheckCircle2, AlertTriangle, 
  ExternalLink, Globe, Server, Activity, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getWilUrl } from "@/lib/api-client";

// Format date to: Feb 07 14:32:01
const formatTerminalDate = (dateString) => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n) => n.toString().padStart(2, '0');
  return `${months[date.getMonth()]} ${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // connecting, connected, error
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Connect to SSE stream
  useEffect(() => {
    const connectToStream = () => {
      setConnectionStatus("connecting");
      const url = `${getWilUrl()}/logs/stream`;
      
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnectionStatus("connected");
        // Add a system log indicating connection
        addLog({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Connected to WIL log stream',
          system: true
        });
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog(data);
        } catch (err) {
          console.error("Failed to parse log message:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource error:", err);
        setConnectionStatus("error");
        eventSource.close();
        
        // Retry connection after 5 seconds
        setTimeout(() => {
            if (active) connectToStream();
        }, 5000);
      };
    };

    let active = true;
    connectToStream();

    return () => {
      active = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const addLog = (logData) => {
      setLogs(prevLogs => {
          // Keep last 500 logs to prevent memory issues
          const newLogs = [...prevLogs, logData];
          if (newLogs.length > 500) {
              return newLogs.slice(newLogs.length - 500);
          }
          return newLogs;
      });
  };

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // Filtering logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Map WIL log fields to search terms
      // WIL logs have: timestamp, level, message, ...meta
      const message = log.message || "";
      const metaStr = JSON.stringify(log); 
      
      const matchesSearch = 
        message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        metaStr.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by level if specified (mapping backend types to levels for now if needed, or stick to 'All')
      // Original UI had specific types (News, Tender etc). 
      // WIL logs are technical logs. We might want to filter by 'level' instead?
      // For now, let's keep 'All' working and maybe adapt if WIL sends 'sourceType' in meta.
      const matchesType = true; // defaulting to true for now as WIL logs are generic

      return matchesSearch && matchesType;
    });
  }, [logs, searchQuery]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'warn': return 'text-yellow-400';
      case 'error': return 'text-red-500';
      case 'debug': return 'text-slate-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-300 font-mono text-sm overflow-hidden">
      
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#161b22]">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-emerald-500" />
          <h1 className="font-semibold text-slate-100 tracking-tight">System Logs</h1>
          <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                connectionStatus === 'connected' ? "bg-emerald-500" : 
                connectionStatus === 'connecting' ? "bg-yellow-500" : "bg-red-500"
            )}></span>
            {connectionStatus === 'connected' ? "Live Connection" : 
             connectionStatus === 'connecting' ? "Connecting..." : "Disconnected"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
            <input 
              type="text" 
              placeholder="grep..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0d1117] border border-slate-700 text-slate-300 text-xs rounded-md pl-8 pr-3 py-1 w-48 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="h-4 w-[1px] bg-slate-700"></div>

          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "text-xs px-2 py-1 rounded transition-colors",
              autoScroll ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic px-2">
            {connectionStatus === 'connecting' ? "Waiting for logs..." : "No logs found."}
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="group flex items-start gap-3 hover:bg-[#161b22] px-2 py-0.5 rounded transition-colors">
              {/* Timestamp */}
              <span className="text-slate-500 shrink-0 select-none w-36">
                {formatTerminalDate(log.timestamp)}
              </span>

              {/* Status Indicator */}
              <span className={cn("shrink-0 font-bold w-16 uppercase", getLevelColor(log.level))}>
                {log.level}
              </span>

              {/* Message */}
              <div className="flex-1 break-all">
                <span className="text-slate-300">{log.message}</span>
                
                {/* Meta details if any */}
                {Object.keys(log).filter(k => !['timestamp', 'level', 'message', 'traceId', 'system'].includes(k)).length > 0 && (
                   <span className="ml-2 text-xs text-slate-600 font-normal">
                     {JSON.stringify(
                         Object.fromEntries(
                             Object.entries(log).filter(([k]) => !['timestamp', 'level', 'message', 'traceId', 'system'].includes(k))
                         )
                     )}
                   </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
        
        {/* Terminal Cursor */}
        <div className="flex items-center gap-2 text-slate-500 pt-2 px-2">
           <span className="text-emerald-500 font-bold">➜</span>
           <span className="w-2.5 h-5 bg-slate-500 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}
