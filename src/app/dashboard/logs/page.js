"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, Terminal, RefreshCw, XCircle, CheckCircle2, AlertTriangle, 
  ExternalLink, Globe, Server, Activity, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

// Format date to: Feb 07 14:32:01
const formatTerminalDate = (dateString) => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n) => n.toString().padStart(2, '0');
  return `${months[date.getMonth()]} ${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5001/api/logs');
      const data = await res.json();
      if (data.success) {
        // Sort by date ascending for terminal view (oldest top, newest bottom)
        const sortedLogs = data.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setLogs(sortedLogs);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Simulate real-time polling every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // Filtering logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.domain.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === "All" || log.sourceType === filterType;

      return matchesSearch && matchesType;
    });
  }, [logs, searchQuery, filterType]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'News': return 'text-blue-400';
      case 'Tender': return 'text-purple-400';
      case 'Signal': return 'text-yellow-400';
      case 'Govt Portal': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processed': return 'text-emerald-500';
      case 'Failed': return 'text-red-500';
      case 'Pending': return 'text-amber-500';
      default: return 'text-slate-500';
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Connection
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

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-500" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#0d1117] border border-slate-700 text-slate-300 text-xs rounded-md pl-8 pr-8 py-1 focus:outline-none focus:border-slate-500 appearance-none cursor-pointer hover:border-slate-600"
            >
              <option value="All">All Sources</option>
              <option value="News">News</option>
              <option value="Tender">Tender</option>
              <option value="Govt Portal">Govt Portal</option>
              <option value="Signal">Signal</option>
            </select>
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
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 animate-pulse">
            <span className="text-emerald-500">$</span>
            <span>Initializing log stream...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic px-2">No logs found matching criteria.</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log._id} className="group flex items-start gap-3 hover:bg-[#161b22] px-2 py-0.5 rounded transition-colors">
              {/* Timestamp */}
              <span className="text-slate-500 shrink-0 select-none w-36">
                {formatTerminalDate(log.createdAt)}
              </span>

              {/* Status Indicator */}
              <span className={cn("shrink-0 font-bold w-20", getStatusColor(log.status))}>
                {log.status.toUpperCase()}
              </span>

              {/* Source Type */}
              <span className={cn("shrink-0 w-24", getTypeColor(log.sourceType))}>
                [{log.sourceType}]
              </span>

              {/* Domain & Title */}
              <div className="flex-1 break-all">
                <span className="text-purple-300 mr-2">{log.domain}</span>
                <span className="text-slate-300">{log.title}</span>
                
                {/* Expand on hover/click details could go here but keeping it simple terminal style */}
                {log.errorMessage && (
                  <span className="text-red-400 ml-2">- {log.errorMessage}</span>
                )}
                
                {log.signalStrength && (
                   <span className="ml-2 text-xs text-slate-600 bg-slate-900 px-1 rounded border border-slate-800">
                     Sig: {log.signalStrength}
                   </span>
                )}
              </div>
              
              <a 
                href={log.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-blue-400 transition-opacity"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
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
