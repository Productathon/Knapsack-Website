'use client';

import { X, TrendingUp, Flame, Mail, Phone, Building, MapPin, Calendar, ChevronLeft, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PriorityLeadsModal({ isOpen, onClose, title, leads, priorityType, initialLead = null }) {
  const [selectedLead, setSelectedLead] = useState(initialLead);
  const [showConvertDialog, setShowConvertDialog] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const [starredLeads, setStarredLeads] = useState([]);

  // Load starred leads from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('starred_leads');
    if (saved) {
      setStarredLeads(JSON.parse(saved));
    }
  }, []);

  // Update starred state
  const toggleStar = (leadId) => {
    const isStarred = starredLeads.includes(leadId);
    let newStarred;

    if (isStarred) {
      newStarred = starredLeads.filter(id => id !== leadId);
    } else {
      newStarred = [...starredLeads, leadId];
    }

    setStarredLeads(newStarred);
    localStorage.setItem('starred_leads', JSON.stringify(newStarred));

    // Dispatch event for other components to update if needed
    window.dispatchEvent(new Event('storage'));
  };

  // Update selected lead if initialLead changes when modal opens
  useEffect(() => {
    if (isOpen && initialLead) {
      setSelectedLead(initialLead);
    }
  }, [isOpen, initialLead]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedLead) {
          setSelectedLead(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, selectedLead]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'hot':
      case 'overdue':
      case 'action needed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warm':
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cold':
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityBadge = (score) => {
    if (score >= 85) return { text: 'High Priority', color: 'bg-red-500' };
    if (score >= 70) return { text: 'Medium Priority', color: 'bg-amber-500' };
    return { text: 'Low Priority', color: 'bg-blue-500' };
  };

  const handleConvert = (lead) => {
    setShowConvertDialog(lead);
  };

  const confirmConvert = async () => {
    setIsConverting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConverting(false);
    setConversionSuccess(true);
  };

  if (!isOpen) return null;

  // Lead Detail View
  if (selectedLead) {
    const priority = getPriorityBadge(selectedLead.score);
    const isHighPriority = selectedLead.score >= 85;
    const isStarred = starredLeads.includes(selectedLead.id);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedLead(null)}
        />

        <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in-95 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="h-12 w-12 rounded-lg bg-muted border border-border flex items-center justify-center text-lg font-bold text-foreground">
                {selectedLead.name[0]}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedLead.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                    getStatusColor(selectedLead.status)
                  )}>
                    {selectedLead.status}
                  </span>
                  {isHighPriority && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100">
                      <TrendingUp className="h-3 w-3 text-red-600" />
                      <span className="text-[10px] font-semibold text-red-700">URGENT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Lead Details */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Score & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Lead Score</p>
                  <p className="text-3xl font-bold text-foreground">{selectedLead.score}%</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Priority Level</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={cn("h-3 w-3 rounded-full", priority.color)} />
                    <span className="text-sm font-semibold text-foreground">{priority.text}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-foreground">contact@{selectedLead.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm font-medium text-foreground">{selectedLead.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium text-foreground">New York, NY</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last Activity</p>
                      <p className="text-sm font-medium text-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">AI Insights</h3>
                <div className="p-4 rounded-lg border border-border bg-blue-50/30 dark:bg-blue-950/10">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Recommendation:</span> This lead shows high engagement and is ready for conversion.
                    Best time to contact: Weekdays 2-4 PM EST. Decision maker recently viewed pricing page 3 times.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
            <button
              onClick={() => setSelectedLead(null)}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Back to List
            </button>
            <button
              onClick={() => toggleStar(selectedLead.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                isStarred
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Star className={cn("h-4 w-4", isStarred && "fill-amber-700")} />
              {isStarred ? "Starred" : "Star Lead"}
            </button>
          </div>
        </div>
      </div>
    );
  }



  // Main Lead List View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{leads.length} leads require attention</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors group">
            <X className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {leads.map((lead, index) => {
              const priority = getPriorityBadge(lead.score);
              const isHighPriority = lead.score >= 85;
              const isStarred = starredLeads.includes(lead.id);

              return (
                <div
                  key={index}
                  className={cn(
                    "relative p-4 rounded-lg border bg-card transition-all duration-200 hover:shadow-md",
                    isHighPriority && "border-red-200 bg-red-50/30 dark:bg-red-950/10 shadow-sm"
                  )}
                >
                  {isHighPriority && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/5 to-orange-500/5 animate-pulse" />
                  )}

                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground flex-shrink-0">
                        {lead.name[0]}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground truncate">{lead.name}</h3>
                          {isHighPriority && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30">
                              <TrendingUp className="h-3 w-3 text-red-600" />
                              <span className="text-[10px] font-semibold text-red-700 dark:text-red-500">URGENT</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Score:</span>
                            <span className="text-sm font-bold text-foreground">{lead.score}%</span>
                          </div>
                          <div className="h-3 w-px bg-border" />
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                            getStatusColor(lead.status)
                          )}>
                            {lead.status}
                          </span>
                          <div className="h-3 w-px bg-border" />
                          <div className="flex items-center gap-1">
                            <div className={cn("h-2 w-2 rounded-full", priority.color)} />
                            <span className="text-[10px] text-muted-foreground">{priority.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => toggleStar(lead.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isStarred
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-muted-foreground hover:text-amber-500 hover:bg-muted"
                        )}
                        title={isStarred ? "Unstar Lead" : "Star Lead"}
                      >
                        <Star className={cn("h-4 w-4", isStarred && "fill-amber-500")} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.score >= 85).length} high-priority leads require immediate action
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
