# Sales Portal Frontend Documentation

## 1. Project Overview
**Sales Portal** is a modern, high-performance CRM dashboard designed for B2B sales teams. It provides a centralized interface for managing leads, tracking account relationships, analyzing sales performance, and gathering market intelligence (dossiers). The application focuses on speed, clarity, and actionable insights, featuring a sleek, responsive UI with dark mode support.

## 2. Technology Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React `useState` / `useEffect` (Local state for prototype)
- **Language**: JavaScript (ES6+)

## 3. Architecture & File Structure

### Core Directory Structure
The project follows the standard Next.js App Router structure within the `src` directory.

```
src/
├── app/                    # App Router Pages & Layouts
│   ├── dashboard/          # Protected Dashboard Routes
│   │   ├── accounts/       # Account Management
│   │   ├── analytics/      # Sales Analytics
│   │   ├── dossiers/       # Market Intelligence
│   │   ├── leads/          # Lead Inbox (Full List)
│   │   ├── profile/        # User Profile
│   │   ├── layout.js       # Dashboard Wrapper (Sidebar + Main Content)
│   │   └── page.js         # MAIN DASHBOARD (Home)
│   ├── layout.js           # Root Layout
│   └── page.js             # Landing/Login Redirect
├── components/             # Reusable UI Components
│   ├── dashboard/          # Dashboard-specific Widgets
│   │   └── SalesFunnel.jsx # Funnel Visualization Chart
│   ├── layout/             # Layout Components
│   │   └── sidebar.js      # Main Navigation Sidebar
│   └── ui/                 # Generic UI Elements & Modals
│       ├── AccountDetailsModal.jsx
│       └── PriorityLeadsModal.jsx
└── lib/
    └── utils.js            # Utility functions (cn for class merging)
```

## 4. Key Files & Components Explanation

### A. Dashboard (`src/app/dashboard/page.js`)
This is the heart of the application. It acts as the central command center for the sales rep.
- **Functionality**:
    -   Displays key **KPIs** (Active Leads, Conversion Rate, Pipeline Value).
    -   Renders the **Sales Funnel** visualization.
    -   Manages the **"Today's Priorities"** lead list.
    -   **State Management**: Holds the `leads` and `stats` state. Handles the logic for "Generating Leads" (simulated) and "Converting Leads".
    -   **Interactivity**: Search bar filters leads. Clicking a lead opens the `PriorityLeadsModal`.

### B. Priority Leads Modal (`src/components/ui/PriorityLeadsModal.jsx`)
A critical component for the "Lead-to-Account" conversion workflow.
-   **Trigger**: Opens when a lead card is clicked on the Dashboard.
-   **Features**:
    -   Displays lead details (Bio, Match Score, Company Info).
    -   **"Convert to Deal"**: Initiates a simulated conversion process.
    -   **Success State**: Shows a confirmation screen with a "View Account" button (redirects to Accounts) and updates the parent dashboard stats via `onConvertSuccess`.

### C. Accounts Page (`src/app/dashboard/accounts/page.js`)
Manages the portfolio of existing client accounts.
-   **Functionality**: Lists all accounts with status (Active, Dormant, Closed) and key metrics.
-   **Interactivity**: Clicking a row opens the `AccountDetailsModal`.

### D. Account Details Modal (`src/components/ui/AccountDetailsModal.jsx`)
A comprehensive view of a single account.
-   **Structure**:
    -   **Header**: Account Name, Status, Industry.
    -   **Key Info**: Value, Owner, Location, Contact.
    -   **Tabs**:
        -   **Overview**: Shows "Growth Opportunities" (High contrast alerts) and "Recent Projects" (Interactive buttons).
        -   **Activity**: Timeline of recent emails, meetings, and contracts.
-   **Navigation**: "View Full CRM Profile" button redirects to the `Dossiers` page for deep-dive intelligence.

### E. Dossiers Page (`src/app/dashboard/dossiers/page.js`)
The "Intelligence Engine" of the portal.
-   **Purpose**: Aggregates news, tenders, and signals for tracked companies.
-   **Features**: Filterable feed (News, Tenders, Signals). Clicking a dossier opens a detailed view of sources and timeline signals.

### F. Sidebar (`src/components/layout/sidebar.js`)
The persistent navigation menu.
-   **Structure**: Collapsible/Responsive sidebar. Links to all dashboard sub-pages. Adds "active" styling to the current route.

## 5. User Flows

### 1. The "Lead Conversion" Flow
1.  User lands on **Dashboard**.
2.  Identifies a high-priority lead in the "Inbox".
3.  Clicks the lead -> Opens **PriorityLeadsModal**.
4.  Reviews AI Summary & Match Score.
5.  Clicks **"Convert to Deal"**.
6.  System shows "Success" -> Dashboard updates stats (Active Leads -1, Conversion Rate +).
7.  User can click "View Account" to jump to the **Accounts** page.

### 2. The "Account Intelligence" Flow
1.  User navigates to **Accounts**.
2.  Clicks on an account (e.g., "Acme Corp").
3.  Opens **AccountDetailsModal**.
4.  Reviews "Growth Opportunity" alert.
5.  Checks "Recent Projects" status.
6.  Clicks **"View Full CRM Profile"** to see Tenders/News in **Dossiers**.

## 6. Future Roadmap (Backend Integration)
Currently, the application uses local state and mock data. For production readiness:
1.  **API Integration**: Connect `dashboard/page.js` to `GET /api/leads` and `POST /api/leads/convert`.
2.  **Persistent Store**: Use a database (PostgreSQL/MongoDB) to store persistent modifications (Converted leads, new accounts).
3.  **Authentication**: Integrate NextAuth.js or Clerk for real user sessions.
