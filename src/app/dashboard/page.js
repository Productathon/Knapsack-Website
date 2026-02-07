'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  ArrowUpRight, ChevronRight, Flame, Clock, FileText, 
  Calendar, TrendingUp, Users, Target, Award,
  Factory, Truck, Building2, Monitor, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import PriorityLeadsModal from "@/components/ui/PriorityLeadsModal";



export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(null);

  // Local state for leads
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard Stats State
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    conversionRate: 0,
    avgScore: 0
  });

  // Dashboard aggregated data
  const [leadTrends, setLeadTrends] = useState([]);
  const [trendInsight, setTrendInsight] = useState("");
  const [industries, setIndustries] = useState([]);
  const [priorityData, setPriorityData] = useState({ overdueCount: 0, newLeadsToday: 0 });

  const [dateRange, setDateRange] = useState(30);

  // Fetch leads and dashboard stats from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch leads
        const leadsRes = await fetch(`http://127.0.0.1:5001/api/leads?days=${dateRange}`);
        if (!leadsRes.ok) throw new Error("Failed to connect to backend");
        
        const leadsData = await leadsRes.json();
        
        if (leadsData.success) {
          const formattedLeads = leadsData.data.map(lead => ({
            id: lead._id,
            name: lead.company || lead.name,
            industry: lead.industry || 'Technology',
            score: lead.matchScore,
            confidence: lead.matchScore > 85 ? "High" : "Med",
            status: lead.status === 'new' ? 'New' : lead.status.charAt(0).toUpperCase() + lead.status.slice(1),
            createdAt: lead.createdAt
          }));
          setLeads(formattedLeads);
        }

        // Fetch dashboard stats with date filter
        const statsRes = await fetch(`http://127.0.0.1:5001/api/dashboard/stats?days=${dateRange}`);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          // console.log("Stats Data Received:", statsData); // Debug log
          if (statsData.success && statsData.data) {
            setStats({
              totalLeads: statsData.data.totalLeads || 0,
              activeLeads: statsData.data.activeLeads || 0,
              conversionRate: statsData.data.conversionRate || 0,
              avgScore: statsData.data.avgScore || 0
            });
            setLeadTrends(statsData.data.leadTrends || []);
            setTrendInsight(statsData.data.trendInsight || "Start generating leads to see trends.");
            setPriorityData(statsData.data.priorities || { overdueCount: 0, newLeadsToday: 0 });
            
            // Format industries with icons
            const industryIcons = { Manufacturing: Factory, Logistics: Truck, Technology: Monitor, Construction: Building2 };
            const industryColors = ['bg-indigo-600', 'bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-orange-600'];
            const industryLabels = ['Highest converting', 'Fastest growing', 'High potential', 'Emerging', 'Growing'];
            
            const formattedIndustries = (statsData.data.industryDistribution || []).slice(0, 4).map((ind, idx) => ({
              name: ind.name,
              value: ind.percentage,
              label: industryLabels[idx] || 'Active',
              icon: industryIcons[ind.name] || Building2,
              color: industryColors[idx] || 'bg-slate-600'
            }));
            setIndustries(formattedIndustries);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]); // Refetch when dateRange changes

  // ... (keeping kpis and other state code same) ... 
  // (Redacted for brevity in tool call, but strictly replacing lines 56-200 roughly)
  // Wait, I need to be careful with replace_file_content.
  // I will just replace the useEffect block and state init.


  // Derived KPIs
  const kpis = [
    { 
      label: "Total Leads", 
      value: stats.totalLeads.toLocaleString(), 
      change: "+12.5%", 
      context: "Last 30 days",
      isPositive: true,
      icon: Users
    },
    { 
      label: "Active Leads", 
      value: stats.activeLeads, 
      change: "+4.3%", 
      context: "Awaiting action",
      isPositive: true,
      icon: Target
    },
    { 
      label: "Avg. Lead Score", 
      value: stats.avgScore, 
      change: "+2.1%", 
      context: "Quality indicator",
      isPositive: true,
      icon: TrendingUp
    },
    { 
      label: "Conversion Rate", 
      value: `${stats.conversionRate}%`, 
      change: "+0.8%", 
      context: "Closed / contacted",
      isPositive: true,
      icon: Award
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Derived Priorities based on backend data
  const newLeadsInList = leads.filter(l => l.status.toLowerCase() === 'new');
  
  // Date helpers for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Precise filtering to match backend definitions
  const overdueLeads = leads.filter(l => 
    l.status.toLowerCase() === 'new' && 
    new Date(l.createdAt || l.lastUpdated) < threeDaysAgo
  );

  const newLeadsToday = leads.filter(l => 
    l.status.toLowerCase() === 'new' && 
    new Date(l.createdAt || l.lastUpdated) >= today
  );

  const priorities = [
    { 
      icon: Flame, 
      text: `${priorityData.overdueCount} follow-ups are overdue`, 
      color: "text-orange-700 dark:text-orange-600", 
      bg: "bg-orange-100 dark:bg-orange-900/30", 
      count: priorityData.overdueCount,
      filterUrl: "/dashboard/leads?status=overdue",
      previewLeads: overdueLeads.length > 0 ? overdueLeads : leads.slice(0, priorityData.overdueCount)
    },
    { 
      icon: FileText, 
      text: `${priorityData.newLeadsToday} new leads today`, 
      color: "text-blue-700 dark:text-blue-600", 
      bg: "bg-blue-100 dark:bg-blue-900/30", 
      count: priorityData.newLeadsToday,
      filterUrl: "/dashboard/leads?status=new&days=1",
      previewLeads: newLeadsToday.length > 0 ? newLeadsToday : newLeadsInList.slice(0, priorityData.newLeadsToday)
    }
  ];

  // Filter leads by search
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePriorityClick = (priority) => {
    setSelectedPriority(priority);
    setModalOpen(true);
  };
  
  const handleLeadConverted = async (convertedLead) => {
    try {
      // Call backend to convert lead
      const res = await fetch('http://127.0.0.1:5001/api/leads/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId: convertedLead.id }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Remove the converted lead from the list
        setLeads(prev => prev.filter(l => l.id !== convertedLead.id));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          activeLeads: prev.activeLeads - 1,
          conversionRate: (parseFloat(prev.conversionRate) + 0.1).toFixed(1),
        }));

        // Update priority counts
        setPriorityData(prev => ({
          ...prev,
          newLeadsToday: Math.max(0, prev.newLeadsToday - 1),
          // Check if it was also overdue (simple heuristic or check lead data if available)
          overdueCount: convertedLead.createdAt && new Date(convertedLead.createdAt) < new Date(Date.now() - 3 * 86400000) 
            ? Math.max(0, prev.overdueCount - 1) 
            : prev.overdueCount
        }));
      } else {
        console.error("Conversion failed:", data.error);
      }
    } catch (err) {
      console.error("Error converting lead:", err);
    }
  };

  const handleGenerateLeads = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('http://127.0.0.1:5001/api/leads/generate', {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        const newLead = {
          id: data.data._id,
          name: data.data.company,
          industry: data.data.industry,
          score: data.data.matchScore,
          confidence: data.data.matchScore > 85 ? "High" : "Med",
          status: "New"
        };
        
        setLeads(prev => [newLead, ...prev]);
        setStats(prev => ({
          ...prev,
          totalLeads: prev.totalLeads + 1,
          activeLeads: prev.activeLeads + 1
        }));
      }
    } catch (err) {
      console.error("Failed to generate lead:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedPriority({
      text: "Lead Details",
      previewLeads: [lead],
      initialLead: lead 
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sales Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Rahul. Here are your top signals for today.</p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 text-red-700 rounded text-sm font-medium">
              Error: {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 3 months</option>
              <option value={365}>Last 1 year</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button 
            onClick={handleGenerateLeads}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-lg leading-none">+</span>
                Generate Leads
              </>
            )}
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div 
            key={kpi.label} 
            className="group rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-muted/50">
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-foreground tracking-tight">{kpi.value}</p>
                <span className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                  kpi.isPositive 
                    ? "text-green-700 bg-green-50" 
                    : "text-red-700 bg-red-50"
                )}>
                  <TrendingUp className="h-3 w-3" />
                  {kpi.change}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{kpi.context}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Priorities Strip */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
              <Flame className="h-4 w-4 text-orange-600 dark:text-orange-500" />
            </div>
            <span className="text-sm font-semibold text-foreground">Today's Priorities</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {priorities.map((priority, index) => (
              <button
                key={index}
                onClick={() => handlePriorityClick(priority)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all cursor-pointer group hover:shadow-sm"
              >
                <div className={cn("p-2 rounded-md group-hover:scale-110 transition-transform", priority.bg)}>
                  <priority.icon className={cn("h-5 w-5 stroke-[2.5]", priority.color)} />
                </div>
                <span className="text-sm text-foreground">
                  <span className="font-bold">{priority.count}</span> {priority.text.replace(/^\d+\s/, '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lead Inbox Preview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="font-semibold text-foreground text-lg">Lead Inbox</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{filteredLeads.length} prioritized leads matching current filters</p>
              </div>
              <Link 
                href="/dashboard/leads"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors group"
              >
                View all leads
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/20 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">Leads</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-3 text-center">Confidence</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            {/* Lead Rows */}
            <div className="divide-y divide-border">
              {filteredLeads.map((lead, index) => {
                const isTopPriority = index < 3;
                const needsAction = lead.status === "Action needed";
                
                return (
                  <div 
                    key={lead.id} 
                    onClick={() => handleLeadClick(lead)}
                    className={cn(
                      "grid grid-cols-12 gap-4 items-center px-6 py-4 transition-all group relative cursor-pointer hover:bg-muted/50",
                      isTopPriority && "border-l-4 border-l-blue-500"
                    )}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold text-foreground bg-muted border border-border">
                        {lead.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {lead.name}
                          </p>
                          {needsAction && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400 whitespace-nowrap border border-orange-200 dark:border-orange-500/20">
                              <Flame className="h-3 w-3" />
                              Action needed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{lead.industry}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="inline-flex flex-col items-center">
                        <p className="text-lg font-bold text-foreground mb-0.5">{lead.score}%</p>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          lead.confidence === 'High' ? "text-green-600" : "text-blue-600"
                        )}>
                          {lead.confidence}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-3 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide",
                        lead.confidence === 'High' && "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
                        lead.confidence === 'Med' && "bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                      )}>
                        {lead.confidence === 'High' ? 'HIGH' : 'MEDIUM'}
                      </span>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                        lead.status === 'Action needed' && "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
                        lead.status === 'Contacted' && "bg-slate-800 text-slate-100 dark:bg-slate-700 dark:text-slate-100",
                        lead.status === 'New' && "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                      )}>
                        {lead.status}
                      </span>
                    </div>
                    
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Trend + Industries */}
        <div className="space-y-6">
          {/* Lead Trends */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-foreground text-lg mb-1">Leads Trend</h3>
            <p className="text-xs text-muted-foreground mb-5">Last 7 days</p>
            
            <div className="h-40 flex items-end justify-between gap-2 mb-3">
              {(leadTrends.length > 0 ? leadTrends : [
                { day: 'Mon', count: 10 },
                { day: 'Tue', count: 15 },
                { day: 'Wed', count: 12 },
                { day: 'Thu', count: 20 },
                { day: 'Fri', count: 18 },
                { day: 'Sat', count: 8 },
                { day: 'Sun', count: 14 }
              ]).map((bar, i) => {
                const maxCount = Math.max(...(leadTrends.length > 0 ? leadTrends : [{ count: 20 }]).map(t => t.count), 1);
                const heightPercent = Math.max(15, (bar.count / maxCount) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                    <div 
                      className="w-full bg-indigo-500 hover:bg-indigo-600 transition-all duration-300 rounded-t-md relative cursor-pointer" 
                      style={{ height: `${heightPercent}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-all">
                        {bar.count}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {bar.day}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {trendInsight}
              </p>
            </div>
          </div>

          {/* Top Industries */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-foreground text-lg mb-1">Top Industries</h3>
            <p className="text-xs text-muted-foreground mb-5">By lead volume</p>
            
            <div className="space-y-4">
              {industries.map((industry, index) => (
                <div key={industry.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "p-1.5 rounded-md",
                        industry.color.replace('bg-', 'bg-') + '/10'
                      )}>
                        <industry.icon className={cn(
                          "h-3.5 w-3.5",
                          industry.color.replace('bg-', 'text-')
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{industry.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{industry.label}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">{industry.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        industry.color
                      )} 
                      style={{ width: `${industry.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Leads Modal */}
      {selectedPriority && (
        <PriorityLeadsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedPriority.text}
          leads={selectedPriority.previewLeads}
          priorityType={selectedPriority.text}
          initialLead={selectedPriority.initialLead}
          onConvertSuccess={handleLeadConverted}
        />
      )}
    </div>
  );
}
