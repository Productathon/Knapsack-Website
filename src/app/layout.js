import "./globals.css";

export const metadata = {
  title: "Sales Intel - Intelligence Platform",
  description: "Enterprise Sales Intelligence Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
