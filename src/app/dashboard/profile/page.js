"use client";

import { useState } from "react";
import { User, Mail, Phone, Building2, MapPin, Calendar, Edit2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Rahul Sharma",
    email: "rahul.sharma@company.com",
    phone: "+91 98765 43210",
    role: "Senior Sales Manager",
    department: "Enterprise Sales",
    location: "Mumbai, India",
    joinDate: "March 2023",
  });

  const stats = [
    { label: "Leads Handled", value: "842" },
    { label: "Conversion Rate", value: "16.4%" },
    { label: "Accounts Managed", value: "23" },
  ];

  const recentActivity = [
    { action: "Updated status for ABC Industries", time: "2 hours ago" },
    { action: "Submitted feedback on LMN Builders", time: "Yesterday" },
    { action: "Viewed dossier for DEF Transport", time: "2 days ago" },
    { action: "Closed deal with VWX Motors", time: "1 week ago" },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information and view activity.</p>
      </header>

      {/* Profile Card */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-secondary to-muted" />
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-xl bg-foreground flex items-center justify-center text-2xl font-bold text-background border-4 border-card">
                RS
              </div>
              <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Name & Role */}
            <div className="flex-1 sm:pb-1">
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isEditing 
                  ? "bg-foreground text-background" 
                  : "border border-input bg-card text-foreground hover:bg-muted"
              )}
            >
              <Edit2 className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: profile.email },
              { icon: Phone, label: "Phone", value: profile.phone },
              { icon: Building2, label: "Department", value: profile.department },
              { icon: MapPin, label: "Location", value: profile.location },
              { icon: Calendar, label: "Joined", value: profile.joinDate },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {isEditing && item.label !== "Joined" ? (
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const key = item.label.toLowerCase().replace(" ", "");
                        setProfile({ ...profile, [key]: e.target.value });
                      }}
                      className="w-full text-sm font-medium text-foreground bg-transparent border-b border-input focus:outline-none focus:border-foreground"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-foreground/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Danger Zone */}
      <section className="rounded-xl border border-red-200 bg-red-50/50 p-6">
        <h3 className="font-semibold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600/80 mb-4">Irreversible actions. Proceed with caution.</p>
        <div className="flex gap-3">
          <button className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors">
            Deactivate Account
          </button>
          <button className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors">
            Export Data
          </button>
        </div>
      </section>
    </div>
  );
}
