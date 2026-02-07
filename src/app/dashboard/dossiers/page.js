"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Newspaper, FileCheck, Radio, X, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const sourceIcons = {
  tender: FileCheck,
  news: Newspaper,
  signal: Radio,
};

const sourceLabels = {
  tender: "Tender",
  news: "News",
  signal: "Signal",
};

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("All");
  const [selectedDossier, setSelectedDossier] = useState(null);

  // Fetch dossiers from backend
  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5001/api/dossiers');
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        
        if (data.success) {
          // Backend: { _id, company, type, title, description, date, industry }
          // Frontend needs: { id, name, industry, lastUpdated, sourceType, summary, sources, signals }
          const formattedDossiers = data.data.map(dossier => ({
            id: dossier._id,
            name: dossier.company,
            industry: dossier.industry || "Technology",
            lastUpdated: dossier.date || "Recently",
            sourceType: dossier.type,
            summary: dossier.description,
            sources: [
              { type: "Source", title: dossier.title, date: dossier.date }
            ],
            signals: [
              { date: "Today", text: dossier.title }
            ]
          }));
          setDossiers(formattedDossiers);
        } else {
             setError("Failed to load dossiers");
        }
      } catch (err) {
        console.error("Failed to fetch dossiers:", err);
        setError("Connection failed");
      } finally {
        setLoading(false);
      }
    };

    fetchDossiers();
  }, []);

  const filteredDossiers = dossiers.filter((dossier) => {
    const matchesSearch = dossier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dossier.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = filterSource === "All" || dossier.sourceType === filterSource.toLowerCase();
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dossiers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Intelligence archive. Read-only research on tracked companies.</p>
        {error && <p className="text-red-500 text-sm font-bold mt-2">Error: {error}. Is backend running on port 5001?</p>}
      </header>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dossiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none"
        >
          <option value="All">All Sources</option>
          <option value="Tender">Tender</option>
          <option value="News">News</option>
          <option value="Signal">Signal</option>
        </select>
        <p className="text-xs text-muted-foreground ml-auto">{filteredDossiers.length} dossiers</p>
      </div>

      {/* Dossiers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDossiers.map((dossier) => {
          const SourceIcon = sourceIcons[dossier.sourceType];
          return (
            <button
              key={dossier.id}
              onClick={() => setSelectedDossier(dossier)}
              className="text-left rounded-xl border border-border bg-card p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  dossier.sourceType === "tender" && "bg-blue-100 text-blue-700",
                  dossier.sourceType === "news" && "bg-purple-100 text-purple-700",
                  dossier.sourceType === "signal" && "bg-green-100 text-green-700"
                )}>
                  <SourceIcon className="h-3 w-3" />
                  {sourceLabels[dossier.sourceType]}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{dossier.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{dossier.industry}</p>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated {dossier.lastUpdated}
              </p>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDossiers.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No dossiers match your search.</p>
        </div>
      )}

      {/* Dossier Detail View (Modal) */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedDossier(null)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-semibold text-foreground">{selectedDossier.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedDossier.industry}</p>
              </div>
              <button onClick={() => setSelectedDossier(null)} className="p-1 rounded hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: "calc(85vh - 80px)" }}>
              {/* Summary */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h3>
                <p className="text-sm text-foreground leading-relaxed">{selectedDossier.summary}</p>
              </div>

              {/* Sources */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Source References</h3>
                <div className="space-y-2">
                  {selectedDossier.sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div>
                        <p className="text-sm font-medium text-foreground">{source.title}</p>
                        <p className="text-xs text-muted-foreground">{source.type} • {source.date}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Signals Timeline */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Signals Timeline</h3>
                <div className="space-y-3">
                  {selectedDossier.signals.map((signal, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-foreground" />
                        {index < selectedDossier.signals.length - 1 && (
                          <div className="w-px h-6 bg-border" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{signal.text}</p>
                        <p className="text-xs text-muted-foreground">{signal.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
