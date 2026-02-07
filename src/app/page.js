import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Sales Intel</h1>
        <p className="text-muted-foreground mb-8">Enterprise Sales Intelligence Platform</p>
        <Link 
          href="/login" 
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
