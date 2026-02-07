"use client";

import { useState } from "react";
import { Bell, Shield, Eye, Globe, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    leadAlerts: true,
    weeklyDigest: true,
  });
  const [privacy, setPrivacy] = useState({
    shareAnalytics: true,
    activityLog: true,
  });
  const [appearance, setAppearance] = useState("light");

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your preferences and account settings.</p>
      </header>

      {/* Notifications */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Notifications</h2>
            <p className="text-xs text-muted-foreground">Configure how you receive alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
            { key: "push", label: "Push Notifications", desc: "Browser push alerts" },
            { key: "leadAlerts", label: "High-Priority Lead Alerts", desc: "Instant alerts for high-score leads" },
            { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary of weekly activity" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                className={cn(
                  "h-6 w-11 rounded-full transition-colors flex items-center px-0.5",
                  notifications[item.key] ? "bg-foreground justify-end" : "bg-secondary justify-start"
                )}
              >
                <span className="h-5 w-5 rounded-full bg-white shadow" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Privacy</h2>
            <p className="text-xs text-muted-foreground">Control your data and visibility</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: "shareAnalytics", label: "Share Usage Analytics", desc: "Help improve the platform" },
            { key: "activityLog", label: "Activity Logging", desc: "Track your actions for audit" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <button
                onClick={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })}
                className={cn(
                  "h-6 w-11 rounded-full transition-colors flex items-center px-0.5",
                  privacy[item.key] ? "bg-foreground justify-end" : "bg-secondary justify-start"
                )}
              >
                <span className="h-5 w-5 rounded-full bg-white shadow" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Eye className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Appearance</h2>
            <p className="text-xs text-muted-foreground">Customize the look and feel</p>
          </div>
        </div>

        <div className="flex gap-3">
          {[
            { key: "light", label: "Light", icon: Sun },
            { key: "dark", label: "Dark", icon: Moon },
            { key: "system", label: "System", icon: Globe },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setAppearance(item.key)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                appearance === item.key 
                  ? "border-foreground bg-muted/50" 
                  : "border-border hover:bg-muted/30"
              )}
            >
              <item.icon className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
          Save Changes
        </button>
      </div>
    </div>
  );
}
