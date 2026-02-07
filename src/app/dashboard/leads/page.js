"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, Eye, MoreHorizontal, X, Phone, Mail, Calendar, 
  CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  LayoutList, LayoutGrid, AlertCircle, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusOptions = ["New", "Contacted", "Qualified", "Closed"];
const industryOptions = ["Steel Manufacturing", "Transportation", "Construction", "Chemicals", "Logistics", "Oil & Gas", "Infrastructure", "Technology"];
const companySizeOptions = ["All", "Small", "Medium", "Large"];
const confidenceOptions = ["All", "High", "Medium", "Low"];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch leads from backend
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5001/api/leads');
        if (!res.ok) throw new Error("Connection Failed");
        const data = await res.json();
        
        if (data.success) {
          const formattedLeads = data.data.map(lead => ({
            id: lead._id,
            name: lead.company,
            industry: lead.industry || "Technology", 
            score: lead.matchScore,
            confidence: lead.matchScore > 85 ? "High" : (lead.matchScore > 70 ? "Medium" : "Low"),
            status: lead.status.charAt(0).toUpperCase() + lead.status.slice(1),
            reason: "AI Signal Detected",
            source: "CRM Backend",
            product: "B2B Solutions",
            companySize: lead.companySize || "Medium",
            location: lead.location || "International",
            lastUpdated: new Date(lead.createdAt || lead.lastUpdated)
          }));
          setLeads(formattedLeads);
        } else {
          setError("Data invalid");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not connect to backend (127.0.0.1:5001)");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const [selectedLead, setSelectedLead] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Filter panel state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [filters, setFilters] = useState({
    industries: [],
    scoreRange: [60, 100],
    confidence: "All",
    statuses: [],
    companySize: "All",
    location: "",
    lastUpdated: "All",
    keyword: ""
  });
  
  // Bulk selection state
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'compact'
  
  // Saved filters
  const [savedFilters, setSavedFilters] = useState([
    { id: 1, name: "High Score – Manufacturing", filters: { industries: ["Steel Manufacturing"], scoreRange: [85, 100], confidence: "High", statuses: ["New"], companySize: "All", location: "", lastUpdated: "All", keyword: "" } },
    { id: 2, name: "New High Priority", filters: { industries: [], scoreRange: [80, 100], confidence: "High", statuses: ["New"], companySize: "All", location: "", lastUpdated: "Today", keyword: "" } },
  ]);

  // Filter logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            lead.industry.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIndustry = filters.industries.length === 0 || filters.industries.includes(lead.industry);
      const matchesScore = lead.score >= filters.scoreRange[0] && lead.score <= filters.scoreRange[1];
      const matchesConfidence = filters.confidence === "All" || lead.confidence === filters.confidence;
      const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(lead.status);
      const matchesCompanySize = filters.companySize === "All" || lead.companySize === filters.companySize;
      const matchesLocation = !filters.location || lead.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesKeyword = !filters.keyword || 
        lead.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        lead.industry.toLowerCase().includes(filters.keyword.toLowerCase());
      
      // Last updated filter
      let matchesLastUpdated = true;
      if (filters.lastUpdated !== "All") {
        const today = new Date();
        const leadDate = new Date(lead.lastUpdated);
        const daysDiff = Math.floor((today - leadDate) / (1000 * 60 * 60 * 24));
        
        if (filters.lastUpdated === "Today") {
          matchesLastUpdated = daysDiff === 0;
        } else if (filters.lastUpdated === "Last 7 days") {
          matchesLastUpdated = daysDiff <= 7;
        } else if (filters.lastUpdated === "Last 30 days") {
          matchesLastUpdated = daysDiff <= 30;
        }
      }
      
      return matchesSearch && matchesIndustry && matchesScore && matchesConfidence && 
             matchesStatus && matchesCompanySize && matchesLocation && matchesKeyword && matchesLastUpdated;
    });
  }, [leads, searchQuery, filters]);

  // Sort: High score + New first
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      if (a.status === "New" && b.status !== "New") return -1;
      if (a.status !== "New" && b.status === "New") return 1;
      return b.score - a.score;
    });
  }, [filteredLeads]);

  // Top 3 leads
  const top3LeadIds = useMemo(() => {
    return sortedLeads.slice(0, 3).map(lead => lead.id);
  }, [sortedLeads]);

  const updateStatus = (id, newStatus) => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
    setFeedbackSubmitted(false);
    setOpenMenuId(null);
  };

  const handleMenuAction = (action, lead) => {
    setOpenMenuId(null);
    if (action === "view") {
      handleView(lead);
    } else if (action === "mark-contacted") {
      updateStatus(lead.id, "Contacted");
    } else if (action === "mark-qualified") {
      updateStatus(lead.id, "Qualified");
    } else if (action === "mark-closed") {
      updateStatus(lead.id, "Closed");
    }
  };

  const handleBulkAction = (action) => {
    if (selectedLeads.length === 0) return;
    
    // Determine the new status based on action
    let newStatus;
    if (action === "contacted") newStatus = "Contacted";
    else if (action === "qualified") newStatus = "Qualified";
    else if (action === "closed") newStatus = "Closed";
    else return;
    
    // Update all selected leads at once using functional state update
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        selectedLeads.includes(lead.id) 
          ? { ...lead, status: newStatus }
          : lead
      )
    );
    
    // Update selectedLead if it's one of the updated leads
    if (selectedLead && selectedLeads.includes(selectedLead.id)) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    
    // Clear selection
    setSelectedLeads([]);
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === sortedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(sortedLeads.map(lead => lead.id));
    }
  };

  const resetFilters = () => {
    setFilters({
      industries: [],
      scoreRange: [60, 100],
      confidence: "All",
      statuses: [],
      companySize: "All",
      location: "",
      lastUpdated: "All",
      keyword: ""
    });
  };

  const applySavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.industries.length > 0) count++;
    if (filters.scoreRange[0] !== 60 || filters.scoreRange[1] !== 100) count++;
    if (filters.confidence !== "All") count++;
    if (filters.statuses.length > 0) count++;
    if (filters.companySize !== "All") count++;
    if (filters.location) count++;
    if (filters.lastUpdated !== "All") count++;
    if (filters.keyword) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const removeFilter = (filterType) => {
    if (filterType === 'industries') setFilters({ ...filters, industries: [] });
    else if (filterType === 'scoreRange') setFilters({ ...filters, scoreRange: [60, 100] });
    else if (filterType === 'confidence') setFilters({ ...filters, confidence: "All" });
    else if (filterType === 'statuses') setFilters({ ...filters, statuses: [] });
    else if (filterType === 'companySize') setFilters({ ...filters, companySize: "All" });
    else if (filterType === 'location') setFilters({ ...filters, location: "" });
    else if (filterType === 'lastUpdated') setFilters({ ...filters, lastUpdated: "All" });
    else if (filterType === 'keyword') setFilters({ ...filters, keyword: "" });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground tracking-wide">Initializing Live Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Backend Alert</h3>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2.5 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Filter Panel */}
      <div 
        className={cn(
          "flex-shrink-0 border-r border-border bg-card transition-all duration-300",
          isFilterPanelOpen ? "w-72" : "w-0 overflow-hidden"
        )}
      >
        <div className="h-full overflow-y-auto p-5 space-y-5">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Filters</h3>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>

          {/* Saved Filters */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Filters
            </label>
            <div className="space-y-1">
              {savedFilters.map(sf => (
                <button
                  key={sf.id}
                  onClick={() => applySavedFilter(sf)}
                  className="w-full text-left px-3 py-2 text-xs rounded-md bg-muted/50 hover:bg-muted text-foreground transition-colors"
                >
                  {sf.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Keyword Search */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Keyword Search
            </label>
            <input
              type="text"
              placeholder="Company or industry..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Industry Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Industry
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {industryOptions.map(industry => (
                <label key={industry} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.industries.includes(industry)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({ ...filters, industries: [...filters.industries, industry] });
                      } else {
                        setFilters({ ...filters, industries: filters.industries.filter(i => i !== industry) });
                      }
                    }}
                    className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lead Score Range */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lead Score Range
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-foreground">
                <span>{filters.scoreRange[0]}%</span>
                <span>{filters.scoreRange[1]}%</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.scoreRange[0]}
                  onChange={(e) => setFilters({ ...filters, scoreRange: [Number(e.target.value), filters.scoreRange[1]] })}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.scoreRange[1]}
                  onChange={(e) => setFilters({ ...filters, scoreRange: [filters.scoreRange[0], Number(e.target.value)] })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confidence Level
            </label>
            <div className="space-y-1.5">
              {confidenceOptions.map(conf => (
                <label key={conf} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="confidence"
                    checked={filters.confidence === conf}
                    onChange={() => setFilters({ ...filters, confidence: conf })}
                    className="h-4 w-4 border-border text-foreground focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">{conf}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </label>
            <div className="space-y-1.5">
              {statusOptions.map(status => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({ ...filters, statuses: [...filters.statuses, status] });
                      } else {
                        setFilters({ ...filters, statuses: filters.statuses.filter(s => s !== status) });
                      }
                    }}
                    className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Company Size */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company Size
            </label>
            <div className="space-y-1.5">
              {companySizeOptions.map(size => (
                <label key={size} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="companySize"
                    checked={filters.companySize === size}
                    onChange={() => setFilters({ ...filters, companySize: size })}
                    className="h-4 w-4 border-border text-foreground focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </label>
            <input
              type="text"
              placeholder="City, Country..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Last Updated */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last Updated
            </label>
            <select
              value={filters.lastUpdated}
              onChange={(e) => setFilters({ ...filters, lastUpdated: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={resetFilters}
              className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header + Top Action Bar */}
        <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4 space-y-4">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title={isFilterPanelOpen ? "Collapse filters" : "Expand filters"}
              >
                {isFilterPanelOpen ? (
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Lead Inbox</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {sortedLeads.length === leads.length 
                    ? `${sortedLeads.length} total leads`
                    : `Showing ${sortedLeads.length} of ${leads.length} leads`}
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'list' ? "bg-muted" : "hover:bg-muted/50"
                )}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'compact' ? "bg-muted" : "hover:bg-muted/50"
                )}
                title="Compact view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by company or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Active Filters & Bulk Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Filter Chips */}
            <div className="flex-1 flex flex-wrap items-center gap-2">
              {filters.industries.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  <span>Industry: {filters.industries.join(', ')}</span>
                  <button onClick={() => removeFilter('industries')} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {(filters.scoreRange[0] !== 60 || filters.scoreRange[1] !== 100) && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  <span>Score: {filters.scoreRange[0]}-{filters.scoreRange[1]}%</span>
                  <button onClick={() => removeFilter('scoreRange')} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.confidence !== "All" && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  <span>Confidence: {filters.confidence}</span>
                  <button onClick={() => removeFilter('confidence')} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.statuses.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  <span>Status: {filters.statuses.join(', ')}</span>
                  <button onClick={() => removeFilter('statuses')} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.companySize !== "All" && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  <span>Size: {filters.companySize}</span>
                  <button onClick={() => removeFilter('companySize')} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.location && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  <span>Location: {filters.location}</span>
                  <button onClick={() => removeFilter('location')} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {filters.lastUpdated !== "All" && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  <span>Updated: {filters.lastUpdated}</span>
                  <button onClick={() => removeFilter('lastUpdated')} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedLeads.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedLeads.length} selected</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  defaultValue=""
                >
                  <option value="" disabled>Bulk Actions</option>
                  <option value="contacted">Mark as Contacted</option>
                  <option value="qualified">Qualify Leads</option>
                  <option value="closed">Close Leads</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Lead Table */}
        <div className="flex-1 overflow-auto bg-background p-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-12 px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === sortedLeads.length && sortedLeads.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
                    />
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead Score</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confidence</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedLeads.map((lead, index) => {
                  const isTop3 = top3LeadIds.includes(lead.id);
                  const needsAction = lead.score >= 85 && lead.status === "New";
                  const isCompact = viewMode === 'compact';
                  
                  return (
                    <tr 
                      key={lead.id} 
                      className={cn(
                        "hover:bg-muted/20 transition-colors relative",
                        isTop3 && "border-l-4 border-l-blue-500"
                      )}
                    >
                      {/* Checkbox */}
                      <td className={cn("px-5", isCompact ? "py-2" : "py-4")}>
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                          className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
                        />
                      </td>

                      {/* Company Name */}
                      <td className={cn("px-5", isCompact ? "py-2" : "py-4")}>
                        <div className="flex items-center gap-3">
                          {!isCompact && (
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                              {lead.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={cn("font-medium text-foreground", isCompact ? "text-xs" : "text-sm")}>
                                {lead.name}
                              </span>
                              {needsAction && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                                  <AlertCircle className="h-3 w-3" />
                                  Action Needed
                                </span>
                              )}
                            </div>
                            {!isCompact && (
                              <span className="text-xs text-muted-foreground">{lead.location}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className={cn("px-5", isCompact ? "py-2" : "py-4")}>
                        <span className={cn("text-muted-foreground", isCompact ? "text-xs" : "text-sm")}>
                          {lead.industry}
                        </span>
                      </td>

                      {/* Lead Score */}
                      <td className={cn("px-5 text-center", isCompact ? "py-2" : "py-4")}>
                        <span className={cn(
                          "font-bold",
                          isCompact ? "text-xs" : "text-sm",
                          lead.score >= 85 ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {lead.score}%
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className={cn("px-5 text-center", isCompact ? "py-2" : "py-4")}>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          lead.confidence === "High" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {lead.confidence}
                        </span>
                      </td>

                      {/* Status */}
                      <td className={cn("px-5 text-center", isCompact ? "py-2" : "py-4")}>
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer",
                            lead.status === "New" && "bg-blue-100 text-blue-700",
                            lead.status === "Contacted" && "bg-gray-100 text-gray-700",
                            lead.status === "Qualified" && "bg-green-100 text-green-700",
                            lead.status === "Closed" && "bg-gray-200 text-gray-500"
                          )}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>

                      {/* Action */}
                      <td className={cn("px-5 text-right", isCompact ? "py-2" : "py-4")}>
                        <div className="flex items-center justify-end gap-1 relative">
                          <button 
                            onClick={() => handleView(lead)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border border-input bg-card text-foreground hover:bg-muted transition-colors",
                              isCompact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs font-medium"
                            )}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {!isCompact && "View"}
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === lead.id ? null : lead.id)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {openMenuId === lead.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-card shadow-lg z-50">
                                <button 
                                  onClick={() => handleMenuAction("view", lead)}
                                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg"
                                >
                                  View Details
                                </button>
                                <button 
                                  onClick={() => handleMenuAction("mark-contacted", lead)}
                                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                  Mark Contacted
                                </button>
                                <button 
                                  onClick={() => handleMenuAction("mark-qualified", lead)}
                                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                  Mark Qualified
                                </button>
                                <button 
                                  onClick={() => handleMenuAction("mark-closed", lead)}
                                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-b-lg"
                                >
                                  Mark Closed
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {sortedLeads.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">No leads match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Action Panel (Slide-out) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedLead(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border h-full overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-foreground">Lead Details</h2>
              <button onClick={() => setSelectedLead(null)} className="p-1 rounded hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Lead Header */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
                  {selectedLead.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedLead.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedLead.industry}</p>
                </div>
                <span className={cn(
                  "ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  selectedLead.confidence === 'High' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {selectedLead.score}%
                </span>
              </div>

              {/* Why This Lead */}
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Why This Lead?</h4>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-bold">•</span>
                    {selectedLead.reason}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-bold">•</span>
                    Source: {selectedLead.source}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground font-bold">•</span>
                    Confidence: {selectedLead.score}%
                  </li>
                </ul>
              </div>

              {/* Suggested Product */}
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested Product</span>
                  <span className="font-semibold text-foreground">{selectedLead.product}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                  <Phone className="h-5 w-5" />
                  <span className="text-xs font-medium">Call</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                  <Mail className="h-5 w-5" />
                  <span className="text-xs font-medium">Email</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs font-medium">Meet</span>
                </button>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Update Status</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Lead Feedback */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Lead Feedback</h4>
                {!feedbackSubmitted ? (
                  <div className="space-y-3">
                    {["Signal Validated", "Product Match Improved", "Confidence Reweighted"].map((item) => (
                      <label key={item} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <input type="checkbox" className="h-4 w-4 rounded border-border text-foreground focus:ring-ring" />
                        <span className="text-sm font-medium text-foreground">{item}</span>
                      </label>
                    ))}
                    <button
                      onClick={() => setFeedbackSubmitted(true)}
                      className="w-full mt-4 rounded-lg bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
                    >
                      Submit Feedback
                    </button>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <div className="mx-auto h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">Feedback Received!</p>
                    <p className="text-xs text-muted-foreground mt-1">Learning update triggered.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
