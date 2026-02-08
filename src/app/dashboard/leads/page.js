"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, Filter, Eye, MoreHorizontal, X, Phone, Mail, Calendar, 
  CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  LayoutList, LayoutGrid, AlertCircle, Settings2, FileText, Zap, Target, TrendingUp, Send,
  Globe, MapPin, Flame, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { wilClient } from "@/lib/api-client";
import SendContractModal from "@/components/ui/SendContractModal";

const statusOptions = ["New", "Contacted", "Qualified", "Closed"];
const industryOptions = ["Technology", "Finance", "Healthcare", "Retail", "Energy", "Manufacturing", "Logistics", "Oil & Gas", "Steel Manufacturing", "Transportation", "Construction"];
const companySizeOptions = ["All", "Small", "Medium", "Large"];
const confidenceOptions = ["All", "High", "Medium", "Low"];

export default function LeadsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeadsContent />
    </Suspense>
  );
}

function LeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params if present
  const [filters, setFilters] = useState(() => {
    const params = searchParams;
    return {
      industries: params.get('industry') ? params.get('industry').split(',') : [],
      scoreRange: [
        params.get('minScore') ? Number(params.get('minScore')) : 0, 
        params.get('maxScore') ? Number(params.get('maxScore')) : 100
      ],
      confidence: params.get('confidence') || "All",
      statuses: params.get('status') ? params.get('status').split(',') : [],
      companySize: params.get('companySize') || "All",
      location: params.get('location') || "",
      lastUpdated: params.get('lastUpdated') || "All",
      keyword: params.get('search') || "",
      starredOnly: params.get('starred') === 'true'
    };
  });

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.industries.length) params.set('industry', filters.industries.join(','));
    if (filters.statuses.length) params.set('status', filters.statuses.join(','));
    if (filters.scoreRange[0] !== 0) params.set('minScore', filters.scoreRange[0]);
    if (filters.scoreRange[1] !== 100) params.set('maxScore', filters.scoreRange[1]);
    if (filters.keyword) params.set('search', filters.keyword);
    if (filters.confidence !== 'All') params.set('confidence', filters.confidence);
    if (filters.companySize !== 'All') params.set('companySize', filters.companySize);
    if (filters.location) params.set('location', filters.location);
    if (filters.lastUpdated !== 'All') params.set('lastUpdated', filters.lastUpdated);
    if (filters.starredOnly) params.set('starred', 'true');

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Starred leads state (from localStorage)
  const [starredLeadIds, setStarredLeadIds] = useState([]);

  useEffect(() => {
    const loadStarred = () => {
      const saved = localStorage.getItem('starred_leads');
      if (saved) setStarredLeadIds(JSON.parse(saved));
    };
    
    loadStarred();
    window.addEventListener('storage', loadStarred);
    return () => window.removeEventListener('storage', loadStarred);
  }, []);

  const toggleStar = (e, leadId) => {
    e.stopPropagation();
    const isStarred = starredLeadIds.includes(leadId);
    let newStarred;
    
    if (isStarred) {
      newStarred = starredLeadIds.filter(id => id !== leadId);
    } else {
      newStarred = [...starredLeadIds, leadId];
    }
    
    setStarredLeadIds(newStarred);
    localStorage.setItem('starred_leads', JSON.stringify(newStarred));
    window.dispatchEvent(new Event('storage'));
  };

  // Handle 'view' query param to auto-open lead details
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && leads.length > 0) {
      const leadToView = leads.find(l => l.id === viewId);
      if (leadToView) {
        handleView(leadToView);
        // Clear the param after opening so it doesn't reopen on refresh/nav
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('view');
        router.replace(`?${newParams.toString()}`, { scroll: false });
      }
    }
  }, [searchParams, leads, router]);

  const [selectedLead, setSelectedLead] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  
  // Filter panel state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  
  // Bulk selection state
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'compact'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  
  // Saved filters
  const [savedFilters, setSavedFilters] = useState([
    { id: 1, name: "High Score – Manufacturing", filters: { industries: ["Steel Manufacturing"], scoreRange: [85, 100], confidence: "High", statuses: ["New"], companySize: "All", location: "", lastUpdated: "All", keyword: "" } },
    { id: 2, name: "New High Priority", filters: { industries: [], scoreRange: [80, 100], confidence: "High", statuses: ["New"], companySize: "All", location: "", lastUpdated: "Today", keyword: "" } },
  ]);

  // Fetch leads from WIL dossiers (source of truth for intelligence)
  const fetchLeads = async (currentFilters = filters) => {
    setLoading(true);
    try {
      // Fetch dossiers from WIL
      const res = await wilClient.get('/dossiers');
      if (res.error) throw new Error(res.error);
      
      const dossiers = res.dossiers || [];
      
      // Map WIL dossier structure to lead format
      const formattedLeads = dossiers.map(dossier => {
        // Extract score from sections if available
        const scoringSection = dossier.sections?.find(s => s.title === 'Scoring Breakdown');
        const overviewSection = dossier.sections?.find(s => s.title === 'Overview');
        const score = scoringSection?.content?.finalScore 
          ? Math.round(scoringSection.content.finalScore * 100) 
          : 75;
        
        // Extract company name from multiple potential sources in dossier
        let companyName = 'Unknown Company';
        
        // Priority 1: Explicit company field
        if (dossier.company && typeof dossier.company === 'string') {
          companyName = dossier.company;
        }
        // Priority 2: Check overview section for subject/company
        else if (overviewSection?.content?.subject) {
          companyName = overviewSection.content.subject;
        }
        else if (overviewSection?.content?.companyName) {
          companyName = overviewSection.content.companyName;
        }
        // Priority 3: Skip - section titles often contain generic text like "Related Documents"
        
        // Priority 4: Extract from human summary using multiple patterns
        if (companyName === 'Unknown Company' && dossier.humanSummary) {
          const summaryPatterns = [
            /(?:about|for|from|regarding)\s+([A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s+(?:scored|has|is|was|which|that|\.|,|$))/i,
            /^([A-Z][A-Za-z0-9\s&.,'-]+?)\s+(?:scored|has|is|was)/i,
            /company\s+([A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s|\.|,|$)/i
          ];
          for (const pattern of summaryPatterns) {
            const match = dossier.humanSummary.match(pattern);
            if (match && match[1] && match[1].length > 2 && match[1].length < 50) {
              companyName = match[1].trim();
              break;
            }
          }
        }
        // Priority 5: Use source URL domain as company name
        if (companyName === 'Unknown Company' && overviewSection?.content?.sourceUrl) {
          try {
            const url = new URL(overviewSection.content.sourceUrl);
            const domain = url.hostname.replace('www.', '').split('.')[0];
            if (domain && domain.length > 2) {
              companyName = domain.charAt(0).toUpperCase() + domain.slice(1);
            }
          } catch (e) { /* ignore invalid URLs */ }
        }
        // Priority 6: Clean up document ID as last resort (but make it readable)
        if (companyName === 'Unknown Company' && dossier.documentId) {
          const docId = dossier.documentId.split('/').pop() || '';
          // Only use if it doesn't look like a UUID
          if (!docId.match(/^[a-f0-9-]{36}$/i) && !docId.match(/^[a-f0-9]{32}$/i)) {
            companyName = docId.replace(/-/g, ' ').replace(/_/g, ' ');
            // Capitalize first letter of each word
            companyName = companyName.replace(/\b\w/g, c => c.toUpperCase());
          } else {
            // For UUID-like IDs, use a placeholder with index
            companyName = `Lead ${dossiers.indexOf(dossier) + 1}`;
          }
        }
        
        // Safe extraction of string values (avoid rendering objects)
        const primaryIntent = overviewSection?.content?.primaryIntent;
        const industryStr = typeof primaryIntent === 'string' ? primaryIntent : 'Business Intelligence';
        const sourceUrl = overviewSection?.content?.sourceUrl;
        const sourceStr = typeof sourceUrl === 'string' ? sourceUrl : 'WIL Intelligence';
        const reasonText = Array.isArray(dossier.recommendations) && dossier.recommendations[0]
          ? String(dossier.recommendations[0])
          : 'AI Signal Detected';
        
        return {
          id: dossier.id,
          name: companyName.trim(),
          industry: industryStr,
          score: score,
          confidence: score > 85 ? 'High' : (score > 70 ? 'Medium' : 'Low'),
          status: dossier.consumedAt ? 'Contacted' : 'New',
          reason: reasonText,
          source: sourceStr,
          product: 'B2B Solutions',
          companySize: 'Medium',
          location: 'International',
          lastUpdated: new Date(dossier.createdAt),
          // Attach full dossier for details view
          dossier: dossier
        };
      });
      
      // Client-side filtering
      let filtered = formattedLeads;
      
      if (currentFilters.keyword) {
        const keyword = currentFilters.keyword.toLowerCase();
        filtered = filtered.filter(lead => 
          lead.name.toLowerCase().includes(keyword) ||
          lead.industry.toLowerCase().includes(keyword)
        );
      }
      
      if (currentFilters.scoreRange[0] > 0 || currentFilters.scoreRange[1] < 100) {
        filtered = filtered.filter(lead => 
          lead.score >= currentFilters.scoreRange[0] && 
          lead.score <= currentFilters.scoreRange[1]
        );
      }
      
      if (currentFilters.confidence !== 'All') {
        filtered = filtered.filter(lead => lead.confidence === currentFilters.confidence);
      }
      
      if (currentFilters.statuses.length > 0) {
        filtered = filtered.filter(lead => currentFilters.statuses.includes(lead.status));
      }

      // Starred Filter
      if (currentFilters.starredOnly) {
         // We need to access the LATEST starred IDs. state might be stale in closure?
         // Actually we can read from localStorage directly or use passed param if we passed it?
         // But here we rely on state. 
         // Better to read localStorage here to be safe and rigorous.
         const saved = localStorage.getItem('starred_leads');
         const stars = saved ? JSON.parse(saved) : [];
         filtered = filtered.filter(lead => stars.includes(lead.id));
      }
      
      setLeads(filtered);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not connect to WIL (port 3000). Is it running?');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dossier Intelligence
  const fetchDossier = async (companyName) => {
    try {
      // Fetch all dossiers (filtering client-side for now as per plan)
      // In production, this should be a direct lookup by company ID or name
      const res = await wilClient.get('/dossiers');
      if (res.error) throw new Error(res.error);
      
      const dossiers = res.dossiers || [];
      
      // Robust fuzzy matching since WIL may not have exact company field
      const match = dossiers.find(d => {
        const target = companyName.toLowerCase();
        // Check explicit company field if exists
        if (d.company && d.company.toLowerCase().includes(target)) return true;
        // Check human summary
        if (d.humanSummary && d.humanSummary.toLowerCase().includes(target)) return true;
        // Check source URL matches (often contains company name)
        if (d.documentId && d.documentId.toLowerCase().includes(target.replace(/\s+/g, '-'))) return true;
        
        return false;
      });
      
      console.log(`[Dossier Match] ${companyName} => ${match ? 'FOUND' : 'MISSING'}`, match);
      return match;
    } catch (err) {
      console.error("Failed to fetch dossier:", err);
      return null;
    }
  };

  // Debounce search/filter fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(filters);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [filters]);

  // Use leads directly as they are now filtered from backend
  const filteredLeads = leads;

  // Sort: Default by Score % descending (removed Status prioritization)
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      // User requested default sort by score %
      return b.score - a.score;
    });
  }, [filteredLeads]);

  // Top 3 leads
  const top3LeadIds = useMemo(() => {
    return sortedLeads.slice(0, 3).map(lead => lead.id);
  }, [sortedLeads]);

  // Pagination logic
  const totalPages = Math.ceil(sortedLeads.length / pageSize);
  const paginatedLeads = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedLeads.slice(startIdx, startIdx + pageSize);
  }, [sortedLeads, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const updateStatus = async (id, newStatus) => {
    try {
      // Optimistic update
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      if (selectedLead?.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }

      await fetch(`http://127.0.0.1:5001/api/leads/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      // Revert optimization would go here in a full app
    }
  };

  const handleView = async (lead) => {
    // Show loading state immediately with partial data
    setSelectedLead({ ...lead, loading: true });
    setFeedbackSubmitted(false);
    setOpenMenuId(null);

    // Dossier data is already attached from fetchLeads
    // Just set the selected lead with its embedded dossier
    setSelectedLead({
      ...lead,
      loading: false
    });
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

  const handleBulkAction = async (action) => {
    if (selectedLeads.length === 0) return;
    
    // Determine the new status based on action
    let newStatus;
    if (action === "contacted") newStatus = "Contacted";
    else if (action === "qualified") newStatus = "Qualified";
    else if (action === "closed") newStatus = "Closed";
    else return;
    
    // Optimistic update
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

    // Call backend for each selected lead
    try {
      await Promise.all(selectedLeads.map(id => 
        fetch(`http://127.0.0.1:5001/api/leads/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
      ));
      // Refresh to ensure sync
      fetchLeads(filters);
    } catch (err) {
      console.error("Failed to update bulk status:", err);
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
      keyword: "",
      starredOnly: false
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
    if (filters.starredOnly) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const removeFilter = (filterType) => {
    if (filterType === 'starredOnly') setFilters({ ...filters, starredOnly: false });
    else if (filterType === 'industries') setFilters({ ...filters, industries: [] });
    else if (filterType === 'scoreRange') setFilters({ ...filters, scoreRange: [0, 100] });
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
          "flex-shrink-0 border-r border-border bg-card transition-all duration-300 h-[calc(100vh-4rem)]", // Fixed height
          isFilterPanelOpen ? "w-72" : "w-0 overflow-hidden"
        )}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden p-5 space-y-5 pb-32 scrollbar-thin"> {/* Increased pb-32 for better visibility */}
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
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Starred Filter Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md", filters.starredOnly ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground")}>
                <Star className={cn("h-4 w-4", filters.starredOnly && "fill-amber-700")} />
              </div>
              <span className="text-sm font-medium text-foreground">Starred Only</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={filters.starredOnly}
                onChange={(e) => setFilters({ ...filters, starredOnly: e.target.checked })}
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
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
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lead Score Range
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-foreground">
                <span className="font-medium">{filters.scoreRange[0]}%</span>
                <span className="text-muted-foreground">to</span>
                <span className="font-medium">{filters.scoreRange[1]}%</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8">Min</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scoreRange[0]}
                    onChange={(e) => setFilters({ ...filters, scoreRange: [Number(e.target.value), filters.scoreRange[1]] })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8">Max</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scoreRange[1]}
                    onChange={(e) => setFilters({ ...filters, scoreRange: [filters.scoreRange[0], Number(e.target.value)] })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
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
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
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
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead Score</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confidence</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLeads.map((lead, index) => {
                  const isTop3 = top3LeadIds.includes(lead.id);
                  const needsAction = lead.score >= 85 && lead.status === "New";
                  const isCompact = viewMode === 'compact';
                  
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => handleView(lead)}
                      className={cn(
                        "hover:bg-muted/30 transition-colors relative cursor-pointer",
                        isTop3 && "border-l-4 border-l-blue-500"
                      )}
                    >
                      {/* Checkbox & Star */}
                      <td className={cn("px-5", isCompact ? "py-2" : "py-4")} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                            className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
                          />
                          <button
                            onClick={(e) => toggleStar(e, lead.id)}
                            className="text-muted-foreground hover:text-amber-500 transition-colors focus:outline-none"
                          >
                            <Star 
                              className={cn(
                                "h-4 w-4", 
                                starredLeadIds.includes(lead.id) && "text-amber-500 fill-amber-500"
                              )} 
                            />
                          </button>
                        </div>
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
                      <td className={cn("px-5 text-center", isCompact ? "py-2" : "py-4")} onClick={(e) => e.stopPropagation()}>
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

                      {/* Action Menu Only */}
                      <td className={cn("px-5 text-right", isCompact ? "py-2" : "py-4")} onClick={(e) => e.stopPropagation()}>
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
                                onClick={() => handleMenuAction("mark-contacted", lead)}
                                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedLeads.length)} of {sortedLeads.length} leads
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                            currentPage === pageNum
                              ? "bg-foreground text-background"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Page Lead Details - Dark Theme */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border">
            <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
              <button 
                onClick={() => setSelectedLead(null)} 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Leads</span>
              </button>
              
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold",
                  selectedLead.status === "New" && "bg-blue-500/20 text-blue-400",
                  selectedLead.status === "Contacted" && "bg-amber-500/20 text-amber-400",
                  selectedLead.status === "Qualified" && "bg-emerald-500/20 text-emerald-400",
                  selectedLead.status === "Closed" && "bg-muted text-muted-foreground"
                )}>
                  {selectedLead.status}
                </span>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-8 py-10">
            
            {/* Lead Header with Score */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg",
                  selectedLead.score >= 80 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
                  selectedLead.score >= 60 ? "bg-gradient-to-br from-amber-500 to-orange-500" :
                  "bg-gradient-to-br from-muted-foreground to-muted-foreground"
                )}>
                  {selectedLead.name[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">{selectedLead.name}</h1>
                  <p className="text-muted-foreground text-lg">{selectedLead.industry}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {selectedLead.location}
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-sm text-muted-foreground">{selectedLead.confidence} Confidence</span>
                  </div>
                </div>
              </div>
              
              {/* Score Display */}
              <div className={cn(
                "px-6 py-4 rounded-2xl text-center min-w-[140px]",
                selectedLead.score >= 80 ? "bg-emerald-500/10 border border-emerald-500/30" :
                selectedLead.score >= 60 ? "bg-amber-500/10 border border-amber-500/30" :
                "bg-muted border border-border"
              )}>
                <div className={cn(
                  "text-4xl font-bold",
                  selectedLead.score >= 80 ? "text-emerald-400" :
                  selectedLead.score >= 60 ? "text-amber-400" :
                  "text-muted-foreground"
                )}>
                  {selectedLead.score}%
                </div>
                <div className="text-xs font-medium text-muted-foreground mt-1">Match Score</div>
              </div>
            </div>

            {/* Key Signals - Full Width Row */}
            <section className="bg-card rounded-2xl border border-border p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-amber-500" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Key Operational Signals</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-muted/30 rounded-xl p-5 border border-border/50 hover:border-border transition-colors">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Signal Detected</p>
                  <div className="flex items-start gap-2">
                    <Flame className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-foreground">{selectedLead.reason || 'High Intent Signal Detected'}</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-xl p-5 border border-border/50 hover:border-border transition-colors">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Source Intelligence</p>
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-foreground break-all">{selectedLead.source || 'Web Analysis & Public Data'}</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-xl p-5 border border-border/50 hover:border-border transition-colors">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Product Fit</p>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-foreground">{selectedLead.product}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column - Intelligence (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* AI Summary */}
                {selectedLead.dossier && (
                  <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-base font-semibold text-foreground">Executive AI Summary</h2>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                      <p className="leading-relaxed text-base">
                        {selectedLead.dossier.humanSummary || 'Intelligence data is being processed...'}
                      </p>
                    </div>
                  </section>
                )}

                {/* Insights */}
                {selectedLead.dossier?.sections?.length > 0 && (
                  <section className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <h2 className="text-base font-semibold text-foreground">Strategic Insights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLead.dossier.sections.slice(0, 4).map((section, idx) => {
                        const contentStr = typeof section.content === 'string' 
                          ? section.content 
                          : section.content?.summary || section.content?.primaryIntent || section.content?.status
                            || (section.content ? Object.values(section.content).filter(v => typeof v === 'string').slice(0,2).join(' — ') : '');
                        
                        return (
                          <div key={idx} className="bg-muted/30 rounded-xl p-5 border-l-4 border-blue-500 hover:bg-muted/50 transition-colors">
                            <h3 className="text-sm font-semibold text-foreground mb-2">{section.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{contentStr || 'Details available in report.'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Recommendations */}
                {selectedLead.dossier?.recommendations?.length > 0 && (
                  <section className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <h2 className="text-base font-semibold text-foreground">Recommended Actions</h2>
                    </div>
                    <ul className="space-y-4">
                      {selectedLead.dossier.recommendations.slice(0, 5).map((rec, i) => (
                        <li key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 font-bold border border-emerald-500/20">{i + 1}</span>
                          <span className="text-foreground/90 text-sm leading-relaxed pt-0.5">{typeof rec === 'string' ? rec : 'Action recommended'}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* Right Column - Actions (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Quick Actions */}
                <section className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
                  <h2 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider text-muted-foreground">Quick Actions</h2>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setContractModalOpen(true)}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                    >
                      <FileText className="h-4 w-4" />
                      Send Contract
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        if (selectedLead.phone) window.location.href = `tel:${selectedLead.phone}`;
                        else alert('No phone number available');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-background border border-border text-foreground font-medium hover:bg-muted transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </button>
                    <button 
                      onClick={() => {
                        if (selectedLead.email) window.location.href = `mailto:${selectedLead.email}`;
                        else alert('No email available');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-background border border-border text-foreground font-medium hover:bg-muted transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </button>
                    </div>
                  </div>

                  <div className="my-6 border-t border-border"></div>

                  <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-muted-foreground">Update Status</h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedLead.id, status)}
                        className={cn(
                          "px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
                          selectedLead.status === status 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                            : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-muted-foreground/30"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="my-6 border-t border-border"></div>

                  <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-muted-foreground">Notes</h2>
                  <textarea
                    placeholder="Add a note..."
                    className="w-full h-32 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                  />
                  <button className="w-full mt-3 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
                    Save Note
                  </button>
                </section>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Contract Modal */}
      <SendContractModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        account={{ _id: selectedLead?.id, name: selectedLead?.name }}
        onSuccess={() => {
          setContractModalOpen(false);
          updateStatus(selectedLead.id, 'Contacted');
        }}
      />

      {/* Click outside to close menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
