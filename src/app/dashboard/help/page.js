"use client";

import { useState } from "react";
import { Search, Book, MessageCircle, FileText, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How are lead scores calculated?",
    answer: "Lead scores are calculated using AI models that analyze multiple signals including tender activity, news mentions, industry trends, and historical conversion data. Higher scores indicate stronger purchase intent."
  },
  {
    question: "What does 'Confidence' mean?",
    answer: "Confidence indicates how certain the AI is about a lead's relevance. High confidence means multiple strong signals were detected. Medium confidence suggests fewer signals or less recent data."
  },
  {
    question: "How do I update a lead's status?",
    answer: "Navigate to Lead Inbox, find the lead, and use the status dropdown in the row to update. You can also click 'View' to open the action panel and update status there."
  },
  {
    question: "What is a Dossier?",
    answer: "A Dossier is a compiled intelligence report about a company. It includes summarized information from various sources like tenders, news, and signals to give you context before engaging."
  },
  {
    question: "How do I provide feedback on a lead?",
    answer: "Open the lead in the Action Panel and scroll to the Feedback section. Mark applicable checkboxes and submit. This feedback helps improve future lead recommendations."
  },
];

const resources = [
  { title: "Getting Started Guide", desc: "Learn the basics of the platform", icon: Book },
  { title: "Video Tutorials", desc: "Step-by-step walkthroughs", icon: FileText },
  { title: "API Documentation", desc: "For developers and integrations", icon: FileText },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = faqs.filter(
    faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Help Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Find answers, resources, and support.</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-input bg-card pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Quick Links */}
      <section className="grid gap-4 sm:grid-cols-3">
        {resources.map((resource) => (
          <button
            key={resource.title}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <resource.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{resource.title}</p>
              <p className="text-xs text-muted-foreground truncate">{resource.desc}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </section>

      {/* FAQs */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-border">
          {filteredFaqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronRight className={cn(
                  "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                  openFaq === index && "rotate-90"
                )} />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {filteredFaqs.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
          </div>
        )}
      </section>

      {/* Contact Support */}
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-card border border-border flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Still need help?</h3>
            <p className="text-sm text-muted-foreground">Contact our support team for assistance.</p>
          </div>
          <button className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
}
