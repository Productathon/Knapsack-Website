'use client';

import { X, Building2, User, Calendar, MapPin, Mail, Phone, TrendingUp, FileText, CheckCircle2, ChevronRight, Loader2, Plus, Send } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import SendContractModal from './SendContractModal';

export default function AccountDetailsModal({ isOpen, onClose, account: initialAccount }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  
  // Local state for account data to support real-time updates
  const [accountData, setAccountData] = useState(initialAccount);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const router = useRouter();

  // Reset local state when modal opens with a new account
  useEffect(() => {
    setAccountData(initialAccount);
  }, [initialAccount]);

  // Fetch Latest Account Data & Activities
  const fetchData = useCallback(async () => {
    if (!accountData?._id) return;
    
    // Fetch latest account details (for status updates)
    try {
      const accRes = await fetch(`http://127.0.0.1:5001/api/accounts/${accountData._id}`);
      const accJson = await accRes.json();
      if (accJson.success) {
        setAccountData(prev => ({ ...prev, ...accJson.data }));
      }
    } catch (err) {
      console.error("Failed to fetch fresh account data:", err);
    }

    // Fetch activities if on activity tab
    if (activeTab === 'activity') {
        try {
        const res = await fetch(`http://127.0.0.1:5001/api/activities/${accountData._id}`);
        const data = await res.json();
        if (data.success) {
            setActivities(data.data);
        }
        } catch (err) {
        console.error("Failed to fetch activities:", err);
        }
    }
  }, [accountData?._id, activeTab]);

  // Initial fetch on tab change
  useEffect(() => {
    if (isOpen && activeTab === 'activity') {
      setLoadingActivities(true);
      fetchData().finally(() => setLoadingActivities(false));
    }
  }, [isOpen, activeTab]);

  // Polling for Real-Time Updates (Every 3 seconds)
  useEffect(() => {
    if (!isOpen) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isOpen, fetchData]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isContractModalOpen) onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isContractModalOpen]);

  if (!isOpen || !accountData) return null;

  return (
    <>
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
                {accountData.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{accountData.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-300",
                    accountData.status === "Active" && "bg-green-100 text-green-700 border border-green-200",
                    accountData.status === "Dormant" && "bg-yellow-100 text-yellow-700 border border-yellow-200",
                    accountData.status === "Closed" && "bg-blue-100 text-blue-700 border border-blue-200"
                  )}>
                    {accountData.status}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {accountData.industry}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsContractModalOpen(true)}
                className="px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                disabled={accountData.status === "Closed"}
              >
                <Send className="h-4 w-4" />
                {accountData.status === "Closed" ? "Contract Signed" : "Send Contract"}
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-6">
              
              {/* Left Column: Key Info */}
              <div className="col-span-1 space-y-6">
                <div className={cn(
                  "transition-all duration-500",
                  accountData.status === "Closed" ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden"
                )}>
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Account Value</p>
                    <p className="text-2xl font-bold text-blue-900">${accountData.value?.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      Revenue Secured
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Account Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Owner</p>
                        <p className="text-sm font-medium text-foreground">{accountData.owner}</p>
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
                        <p className="text-sm font-medium text-foreground">contact@{accountData.name.toLowerCase().replace(/\s+/g, '')}.com</p>
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
                    {/* Live Indicator */}
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
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
                        Based on recent interactions, {accountData.name} is showing interest in our premium enterprise tier. Suggest scheduling a demo for the Q3 roadmap.
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
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {loadingActivities && activities.length === 0 ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : activities.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground">
                        No recent activity found.
                      </div>
                    ) : (
                      <div className="relative pl-6 border-l-2 border-border space-y-6">
                        {activities.slice(0, 10).map((activity, i) => (
                           <div key={i} className="relative group animate-in slide-in-from-left-2 duration-300">
                            <div className={cn(
                              "absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-background transition-all group-hover:scale-125",
                              activity.type === 'Contract Signed' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" :
                              activity.type === 'Contract Sent' ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
                              "bg-muted"
                            )} />
                            <p className="text-sm font-medium text-foreground">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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

      {/* Nested Modal */}
      <SendContractModal 
        isOpen={isContractModalOpen} 
        onClose={() => setIsContractModalOpen(false)}
        account={accountData}
        onSuccess={() => {
          fetchData();
          setActiveTab('activity');
        }}
      />
    </>
  );
}
