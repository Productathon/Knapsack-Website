"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, Calendar, ArrowUpRight, TrendingUp, Users, Award, MoreHorizontal, AlertCircle } from "lucide-react";
import { SalesFunnel } from "@/components/dashboard/SalesFunnel";

export default function AnalyticsPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('6m'); // default to 6 months
  const [rangeLabel, setRangeLabel] = useState('Last 6 Months');
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    leadsIncrease: '+0%',
    totalLeads: '0',
    avgPerMonth: '0',
    bestMonth: 'Loading...',
    industryPerformance: [],
    statusDistribution: [],
    funnelData: [],
    monthlyTrends: []
  });

  // Fetch analytics stats from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:5001/api/analytics/stats?range=${dateRange}`);
        if (!res.ok) throw new Error("Failed to connect to backend");
        
        const data = await res.json();
        
        if (data.success) {
          setAnalyticsData(data.data);
        } else {
          setError("Failed to load analytics data");
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Could not connect to backend. Is it running on port 5001?");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const handleRangeChange = (value, label) => {
    setDateRange(value);
    setRangeLabel(label);
    setShowHistory(false);
  };

  const handleExport = () => {
    // Simple export simulation
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" +
      `Total Leads,${analyticsData.totalLeads}\n` +
      `Avg Per Month,${analyticsData.avgPerMonth}\n` +
      `Best Month,${analyticsData.bestMonth}\n` +
      `Growth,${analyticsData.leadsIncrease}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_export_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  // Industry icons mapping
  const industryColorsMap = {
    'Manufacturing': 'bg-orange-100/50 text-orange-600',
    'Logistics': 'bg-blue-100/50 text-blue-600',
    'Technology': 'bg-green-100/50 text-green-600',
    'Oil & Gas': 'bg-yellow-100/50 text-yellow-600',
    'Construction': 'bg-orange-50/50 text-orange-500',
    'Finance': 'bg-purple-100/50 text-purple-600',
    'Healthcare': 'bg-pink-100/50 text-pink-600',
    'Retail': 'bg-cyan-100/50 text-cyan-600'
  };

  if (loading && !analyticsData.totalLeads) { // Only full load screen on first load
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#F5F3FF]/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 tracking-wide">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  // ... error state handled same ...

  const industries = analyticsData.industryPerformance || [];
  const statusData = analyticsData.statusDistribution || [];
  const monthlyTrends = analyticsData.monthlyTrends || [];

  // Calculate max value for chart scaling
  const maxTrendValue = Math.max(...monthlyTrends.map(t => t.value), 10);

  return (
    <div className="min-h-screen bg-[#F5F3FF]/30 p-8 space-y-8 font-sans text-slate-800">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for anything..." 
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border-none shadow-sm text-sm focus:ring-2 focus:ring-purple-100 focus:outline-none placeholder:text-slate-400"
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          <button className="h-10 px-4 rounded-lg bg-white shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50 border border-slate-100">
            <span className="text-slate-400">☰</span> {rangeLabel} ({dateRange})
          </button>
          <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-white">
            <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
              <span className="text-orange-600 text-xs font-bold">👤</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-500">Review system performance. <span className="font-semibold text-slate-700">Evaluate Intelligence</span> effectiveness.</p>
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Metrics & Charts */}
        <div className="xl:col-span-12 space-y-6">
          
          {/* KPI Strip */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center divide-x divide-slate-50">
              {/* KPI 1 - Leads Increase */}
              <div className="px-6 first:pl-2 flex-1">
                <div className="flex items-center gap-3 mb-1">
                   <div className="p-1.5 rounded-md bg-green-50">
                      <ArrowUpRight className="h-4 w-4 text-green-600" /> 
                   </div>
                   <span className="text-2xl font-bold text-slate-900 tracking-tight">{analyticsData.leadsIncrease}</span>
                </div>
                <p className="text-xs font-medium text-slate-400 pl-1">Leads increase</p>
              </div>
              {/* KPI 2 - Total Leads */}
              <div className="px-6 flex-1">
                <div className="flex items-center gap-3 mb-1">
                   <div className="p-1.5 rounded-md bg-blue-50">
                      <Users className="h-4 w-4 text-blue-600" />
                   </div>
                   <span className="text-2xl font-bold text-slate-900 tracking-tight">{analyticsData.totalLeads}</span>
                </div>
                <p className="text-xs font-medium text-slate-400 pl-1">Total leads</p>
              </div>
              {/* KPI 3 - Avg per Month */}
              <div className="px-6 flex-1">
                <div className="flex items-center gap-3 mb-1">
                   <div className="p-1.5 rounded-md bg-indigo-50">
                      <Users className="h-4 w-4 text-indigo-500" />
                   </div>
                   <span className="text-2xl font-bold text-slate-900 tracking-tight">{analyticsData.avgPerMonth}</span>
                </div>
                <p className="text-xs font-medium text-slate-400 pl-1">Avg month</p>
              </div>
              {/* KPI 4 - Best Month */}
              <div className="px-6 last:pr-2 flex-1">
                <div className="flex items-center gap-3 mb-1">
                   <div className="p-1.5 rounded-md bg-green-50">
                       <Award className="h-4 w-4 text-green-600" />
                   </div>
                   <span className="text-xl font-bold text-slate-900 tracking-tight">{analyticsData.bestMonth}</span>
                   <span className="h-1.5 w-1.5 rounded-full bg-green-500 align-top -ml-1" />
                </div>
                <p className="text-xs font-medium text-slate-400 pl-1">Best month</p>
              </div>
            </div>

            {/* Sales Funnel Small Card */}
            <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
               <div className="absolute right-4 top-4 text-slate-200">
                  <TrendingUp className="h-10 w-10 opacity-20" />
               </div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="font-bold text-slate-900">Sales Funnel</h3>
                <button className="text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-500 font-medium">{rangeLabel}</button>
              </div>
              
              <div className="mt-4 relative z-10">
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-bold text-slate-900">
                     {analyticsData.funnelData.find(f => f.label === 'Converted')?.percent || '0%'}
                   </span>
                   <span className="text-sm font-medium text-slate-500">Conversion Rate</span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-700">
                    {analyticsData.funnelData.find(f => f.label === 'Converted')?.value || '0'}
                  </span> leads converted to deals
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Section: Lead Generation + Funnel */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Lead Generation Over Time</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Monthly trend of leads generated</p>
              </div>
              <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowHistory(!showHistory); }}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-full px-4 py-1.5 hover:bg-slate-50 bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="h-2 w-2 rounded-full border-[2px] border-slate-300" /> {rangeLabel} <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  
                  {showHistory && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                      {[
                        { label: "Last 30 Days", value: "30d" },
                        { label: "Last 3 Months", value: "3m" },
                        { label: "Last 6 Months", value: "6m" },
                        { label: "Year to Date", value: "1y" },
                        { label: "All Time", value: "all" }
                      ].map((opt) => (
                        <button 
                          key={opt.value} 
                          onClick={() => handleRangeChange(opt.value, opt.label)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-0">
              {/* Left: Bar Chart */}
              <div className="w-full lg:w-[25%] shrink-0 pt-4 pr-6 border-r border-slate-100/50">
                <div className="relative h-64 w-full">
                   {/* Y Axis Labels (Dynamic based on max) */}
                   <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-medium text-slate-400 w-6">
                      <span>{Math.ceil(maxTrendValue * 1.2)}</span>
                      <span>{Math.ceil(maxTrendValue * 0.9)}</span>
                      <span>{Math.ceil(maxTrendValue * 0.6)}</span>
                      <span>{Math.ceil(maxTrendValue * 0.3)}</span>
                      <span>0</span>
                   </div>
                   
                   {/* Grid Lines */}
                    <div className="absolute left-8 right-0 top-0 h-full flex flex-col justify-between">
                       {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-t border-slate-100 w-full h-0" />)}
                    </div>

                   {/* Bars (Dynamic) */}
                   {monthlyTrends.length > 0 ? (
                     <div className="absolute left-8 right-0 bottom-6 top-4 flex justify-around px-2 gap-2 items-end">
                        {monthlyTrends.map((trend, idx) => (
                          <div key={idx} className="relative flex flex-col justify-end items-center gap-2 group cursor-pointer w-full h-full">
                             <div 
                               className="w-full bg-blue-500 rounded-t-md opacity-90 group-hover:opacity-100 transition-all shadow-sm hover:shadow-md" 
                               style={{ height: `${(trend.value / (maxTrendValue * 1.2)) * 100}%` }}
                             />
                             <span className="text-[9px] text-slate-500 font-semibold truncate w-full text-center">{trend.label}</span>
                             
                             {/* Tooltip */}
                             <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                               {trend.fullLabel}: {trend.value} leads
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                       No data for this period
                     </div>
                   )}
                </div>
              </div>


              {/* Right: Funnel Visualization */}
              <div className="flex-1 pl-6 pt-4">
                  <SalesFunnel className="h-64 w-full" funnelData={analyticsData.funnelData} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Industry Performance */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="mb-6 flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-slate-900 tracking-tight">Industry-wise Performance</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Lead volume and conversion rates</p>
               </div>
               <div className="relative">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                   className="p-1 hover:bg-slate-50 rounded"
                 >
                   <MoreHorizontal className="h-5 w-5 text-slate-400" />
                 </button>
                 {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={handleExport}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                      >
                        <ArrowUpRight className="h-4 w-4" /> Export Data
                      </button>
                    </div>
                  )}
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {industries.map((ind) => (
                <div key={ind.name} className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-slate-50 hover:border-slate-100 transition-colors group">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform", industryColorsMap[ind.name]?.split(' ')[1] || 'text-slate-600')}>
                     {ind.icon || '📊'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-semibold text-slate-700 text-sm truncate">{ind.name}</span>
                      <span className="font-bold text-slate-900">{ind.value}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">{ind.value.replace(',','')} leads</span>
                      <span className="text-green-600 font-bold flex items-center bg-green-50 px-1.5 py-0.5 rounded-full">
                        <TrendingUp className="h-3 w-3 mr-1" /> {ind.growth}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 tracking-tight">Status Distribution</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Current lead status breakdown</p>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Donut Chart */}
              <div className="relative h-44 w-44 shrink-0">
                 <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <defs>
                      <linearGradient id="gradNew" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#3B82F6" />
                         <stop offset="100%" stopColor="#60A5FA" />
                      </linearGradient>
                      <linearGradient id="gradContacted" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#A855F7" />
                         <stop offset="100%" stopColor="#C084FC" />
                      </linearGradient>
                      <linearGradient id="gradQualified" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#0EA5E9" />
                         <stop offset="100%" stopColor="#38BDF8" />
                      </linearGradient>
                      <linearGradient id="gradClosed" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#22C55E" />
                         <stop offset="100%" stopColor="#4ADE80" />
                      </linearGradient>
                      <linearGradient id="gradOther" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#94A3B8" />
                         <stop offset="100%" stopColor="#CBD5E1" />
                      </linearGradient>
                    </defs>

                    {/* Background Ring */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />

                    {/* Dynamic Segments */}
                    {(() => {
                      let offset = 0;
                      const gradients = ['gradNew', 'gradContacted', 'gradQualified', 'gradClosed', 'gradOther'];
                      return statusData.map((s, idx) => {
                        const segment = (
                          <circle 
                            key={s.label}
                            cx="50" cy="50" r="40" 
                            fill="transparent" 
                            stroke={`url(#${gradients[idx] || 'gradOther'})`}
                            strokeWidth="12" 
                            strokeLinecap="round"
                            pathLength="100" 
                            strokeDasharray={`${Math.max(s.percent - 1.5, 0)} ${100 - Math.max(s.percent - 1.5, 0)}`}
                            strokeDashoffset={-offset}
                          />
                        );
                        offset += s.percent;
                        return segment;
                      });
                    })()}
                  </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">{analyticsData.totalLeads}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1">
                      <Users className="h-3 w-3" /> Total leads
                    </span>
                 </div>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full space-y-3">
                {statusData.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-xs w-full">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full", s.color)} />
                      <span className="text-slate-600 font-semibold">{s.label}</span>
                    </div>
                    <div className="flex gap-3 text-slate-500">
                        <span>{s.count}</span>
                        <span className="font-bold w-6 text-right">{s.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
