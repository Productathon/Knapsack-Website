"use client";

import { useState, useEffect } from "react";
import { Search, Building2, User, Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import AccountDetailsModal from "@/components/ui/AccountDetailsModal";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Fetch accounts from backend
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5001/api/accounts');
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        
        if (data.success) {
          // Backend: { _id, company, industry, owner, status, value, lastInteraction, createdAt }
          // Frontend needs: { id, name, industry, owner, status, lastInteraction, value }
          const formattedAccounts = data.data.map(account => {
            // Format lastInteraction to relative time
            let interactionStr = "Today";
            if (account.lastInteraction) {
              const interactionDate = new Date(account.lastInteraction);
              const now = new Date();
              const diffDays = Math.floor((now - interactionDate) / (1000 * 60 * 60 * 24));
              if (diffDays === 0) interactionStr = "Today";
              else if (diffDays === 1) interactionStr = "Yesterday";
              else if (diffDays < 7) interactionStr = `${diffDays} days ago`;
              else if (diffDays < 30) interactionStr = `${Math.floor(diffDays / 7)} weeks ago`;
              else interactionStr = `${Math.floor(diffDays / 30)} months ago`;
            }
            
            return {
              id: account._id,
              name: account.company,
              industry: account.industry,
              owner: account.owner,
              status: account.status,
              lastInteraction: interactionStr, 
              value: account.value
            };
          });
          setAccounts(formattedAccounts);
        } else {
            setError("Failed to load accounts");
        }
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
        setError("Connection failed");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);


  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          account.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          account.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || account.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group by status for summary
  const activeCount = accounts.filter(a => a.status === "Active").length;
  const dormantCount = accounts.filter(a => a.status === "Dormant").length;
  const closedCount = accounts.filter(a => a.status === "Closed").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Accounts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Companies with active business relationships. Track pipeline health and engagement.</p>
        {error && <p className="text-red-500 text-sm font-bold mt-2">Error: {error}. Is backend running on port 5001?</p>}
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Active Accounts</p>
          <p className="text-2xl font-bold text-foreground mt-1">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Dormant</p>
          <p className="text-2xl font-bold text-foreground mt-1">{dormantCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Closed (Won)</p>
          <p className="text-2xl font-bold text-foreground mt-1">{closedCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by company, industry, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Dormant">Dormant</option>
          <option value="Closed">Closed</option>
        </select>
        <p className="text-xs text-muted-foreground ml-auto">{filteredAccounts.length} accounts</p>
      </div>

      {/* Accounts Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Owner</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Interaction</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAccounts.map((account) => (
              <tr 
                key={account.id} 
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedAccount(account)}
              >
                {/* Company */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{account.name}</span>
                  </div>
                </td>

                {/* Industry */}
                <td className="px-5 py-4">
                  <span className="text-sm text-muted-foreground">{account.industry}</span>
                </td>

                {/* Account Owner */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-foreground">{account.owner}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4 text-center">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    account.status === "Active" && "bg-green-100 text-green-700",
                    account.status === "Dormant" && "bg-yellow-100 text-yellow-700",
                    account.status === "Closed" && "bg-gray-100 text-gray-600"
                  )}>
                    {account.status}
                  </span>
                </td>

                {/* Last Interaction */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {account.lastInteraction}
                  </div>
                </td>

                {/* Value */}
                <td className="px-5 py-4 text-right">
                  <span className="text-sm font-semibold text-foreground">{account.value}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredAccounts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">No accounts match your filters.</p>
          </div>
        )}
      </div>

      <AccountDetailsModal 
        isOpen={!!selectedAccount} 
        onClose={() => setSelectedAccount(null)} 
        account={selectedAccount} 
      />
    </div>
  );
}
