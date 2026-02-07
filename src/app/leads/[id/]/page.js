"use client";

import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Lightbulb, 
  BarChart, 
  ExternalLink,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function LeadDossierPage() {
  const [status, setStatus] = useState("Contacted");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const lead = {
    name: "ABC Industries",
    industry: "Steel Manufacturing",
    reason: "Tender mentions Furnace Oil",
    source: "Govt Tender Portal",
    confidence: 89,
    suggestedProduct: "Furnace Oil",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </Link>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{lead.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center">
            {lead.industry} 
            <span className="mx-2 text-border">•</span> 
            <span className="text-foreground font-medium">Signal detected 2h ago</span>
          </p>
        </div>
        <div className="flex gap-3">
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Lost</option>
          </select>
          <button className="inline-flex items-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Action Panel
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Dossier Information */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Lead Dossier</h3>
            </div>
            <div className="p-8 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Why This Lead?</h4>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">1</div>
                    <p className="text-foreground leading-relaxed">
                      Deep scan of <span className="font-semibold">{lead.source}</span> revealed a new tender notice (Ref: #4829) for bulk energy procurement.
                    </p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">2</div>
                    <p className="text-foreground leading-relaxed">
                      The tender specifically mentions <span className="font-semibold">{lead.suggestedProduct}</span> as the primary requirement for their upcoming expansion.
                    </p>
                  </li>
                </ul>
              </section>

              <div className="grid sm:grid-cols-2 gap-8 pt-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Confidence</span>
                    <BarChart className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{lead.confidence}%</span>
                    <span className="text-xs font-semibold text-green-600">Extremely High</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suggested Product</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-foreground">{lead.suggestedProduct}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-border bg-card hover:bg-muted transition-colors shadow-sm">
              <Phone className="h-5 w-5" />
              <span className="text-sm font-semibold">Call Company</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-border bg-card hover:bg-muted transition-colors shadow-sm">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-semibold">Send Email</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-border bg-card hover:bg-muted transition-colors shadow-sm">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-semibold">Schedule Meet</span>
            </button>
          </div>
        </div>

        {/* Right Column: Feedback & Action Panel */}
        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
             <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center gap-2">
               <MessageSquare className="h-4 w-4 text-muted-foreground" />
               <h3 className="font-semibold text-foreground">Lead Feedback</h3>
             </div>
             <div className="p-6">
                {!feedbackSubmitted ? (
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setFeedbackSubmitted(true); }}>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      Did our AI get this signal right? Your feedback trains the system.
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        "Signal Validated",
                        "Product Match Improved",
                        "Confidence Reweighted"
                      ].map((item) => (
                        <label key={item} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                          <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-ring" />
                          <span className="text-sm font-medium text-foreground">{item}</span>
                        </label>
                      ))}
                    </div>

                    <button type="submit" className="w-full mt-6 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm">
                      Submit Feedback
                    </button>
                  </form>
                ) : (
                  <div className="py-12 text-center animate-in zoom-in-95 duration-300">
                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-bold text-foreground">Feedback Received!</h4>
                    <p className="text-sm text-muted-foreground mt-2 px-6">
                      Learning update triggered. This will improve future lead generation.
                    </p>
                    <button 
                      onClick={() => setFeedbackSubmitted(false)}
                      className="mt-6 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                    >
                      Undo Submission
                    </button>
                  </div>
                )}
             </div>
          </div>

          <div className="rounded-xl border border-border bg-primary p-6 text-primary-foreground shadow-lg">
            <h3 className="font-bold mb-2">Pro Insight</h3>
            <p className="text-sm opacity-90 leading-relaxed mb-4">
              ABC Industries usually processes tenders within 14 days. We recommend reaching out by Tuesday morning.
            </p>
            <button className="inline-flex items-center text-xs font-bold uppercase tracking-widest hover:translate-x-1 transition-transform">
              Read Case Study <ArrowLeft className="ml-1 h-3 w-3 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
