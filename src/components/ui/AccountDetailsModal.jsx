'use client';

import { X, Building2, User, Calendar, MapPin, Mail, Phone, TrendingUp, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AccountDetailsModal({ isOpen, onClose, account }) {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20">
              {account.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{account.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  account.status === "Active" && "bg-green-100 text-green-700 border border-green-200",
                  account.status === "Dormant" && "bg-yellow-100 text-yellow-700 border border-yellow-200",
                  account.status === "Closed" && "bg-gray-100 text-gray-600 border border-gray-200"
                )}>
                  {account.status}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {account.industry}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            
            {/* Left Column: Key Info */}
            <div className="col-span-1 space-y-6">
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Account Value</p>
                <p className="text-2xl font-bold text-foreground">{account.value}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs last year
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Account Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="text-sm font-medium text-foreground">{account.owner}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium text-foreground">Mumbai, India</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-foreground">contact@{account.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-foreground">+91 98765 43210</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Activity & Notes */}
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-1 border-b border-border">
                <button 
                  className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'overview' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'activity' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-white mb-2 flex items-center gap-2">
                       <TrendingUp className="h-4 w-4" />
                       Growth Opportunity
                    </h4>
                    <p className="text-sm font-medium text-blue-950 dark:text-blue-50 leading-relaxed">
                      Based on recent interactions, {account.name} is showing interest in our premium enterprise tier. Suggest scheduling a demo for the Q3 roadmap.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Recent Projects</h4>
                    <div className="space-y-3">
                      <button 
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all group text-left cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
                            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Q2 Expansion Plan</p>
                            <p className="text-xs text-muted-foreground">Updated 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">On Track</span>
                        </div>
                      </button>

                      <button 
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all group text-left cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
                            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Annual Contract Renewal</p>
                            <p className="text-xs text-muted-foreground">Due in 45 days</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">Pending</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="relative pl-6 border-l-2 border-border space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-green-500 border-4 border-background" />
                      <p className="text-sm font-medium text-foreground">Meeting with Procurement Team</p>
                      <p className="text-xs text-muted-foreground">Today at 10:00 AM • with {account.owner}</p>
                      <p className="text-sm text-muted-foreground mt-1">Discussed pricing for the new add-ons. Positive feedback.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-background" />
                      <p className="text-sm font-medium text-foreground">Email Sent: Q3 Update</p>
                      <p className="text-xs text-muted-foreground">2 days ago • sent by {account.owner}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-muted border-4 border-background" />
                      <p className="text-sm font-medium text-foreground">Contract Signed</p>
                      <p className="text-xs text-muted-foreground">3 months ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => {
              onClose();
              router.push('/dashboard/dossiers');
            }}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
          >
            View Full CRM Profile
          </button>
        </div>
      </div>
    </div>
  );
}
