# Application Architecture: Quarterly Sales Intelligence & Revenue Analytics

Quarterly Sales Intelligence & Revenue Analytics is an executive decision-support platform designed to analyze commercial performance across operating regions and fiscal quarters. Business leaders can upload transaction-level CSV datasets or explore built-in enterprise sales data to monitor total revenue, order volume, and realized discount rates. The system automatically computes quarter-over-quarter variances—specifically spotlighting shifts between Q2 and Q3—and pairs interactive comparative charts and multi-dimensional pivot tables with an AI-powered executive briefing that attributes regional revenue movements directly to underlying product lines and distribution channels.

## System File Inventory

| File Path | Description |
| :--- | :--- |
| `ARCHITECTURE.md` | Provides a high-level business overview of the platform and a complete directory of system files and their responsibilities. |
| `server.ts` | Runs the backend Node.js/Express server that serves the web application and hosts the server-side Gemini AI endpoint for grounded executive movement summaries. |
| `index.html` | Defines the main HTML entry point, page metadata, OpenGraph tags, and browser mount target for the application. |
| `package.json` | Declares project metadata, npm build and start scripts, and runtime dependencies for the fullstack application. |
| `vite.config.ts` | Configures the Vite development and build toolchain, including React plugins, Tailwind CSS integration, and path aliasing. |
| `tsconfig.json` | Configures TypeScript compiler settings, type definitions, and path aliases to enforce codebase type safety. |
| `metadata.json` | AI Studio configuration file specifying project capabilities, permissions, and application summaries. |
| `.env.example` | Template file documenting the required environment variables, including server port and Gemini API credentials. |
| `.gitignore` | Specifies files and build directories that should be excluded from Git version control. |
| `bun.lock` | Package lockfile recording dependency version pins inherited from the source repository. |
| `src/main.tsx` | Client-side entry point that initializes and mounts the root React component into the DOM. |
| `src/App.tsx` | Top-level dashboard component orchestrating executive KPI scorecards, tab navigation, and active dataset state. |
| `src/index.css` | Global styling stylesheet configuring Tailwind CSS utility classes and visual presentation defaults. |
| `src/types.ts` | Centralized TypeScript interface definitions for sales orders, quarterly performance metrics, and AI summary payloads. |
| `src/components/AISummaryCard.tsx` | Executive summary component that queries the intelligence API to display a verified three-sentence narrative explaining regional revenue changes. |
| `src/components/RevenueChart.tsx` | Interactive chart component rendering side-by-side quarterly revenue comparisons and delta indicators by region. |
| `src/components/RevenuePivotTable.tsx` | Multi-dimensional matrix component displaying aggregated sales figures, order volumes, and average discounts across regions and quarters. |
| `src/components/CsvUploader.tsx` | Data ingestion component enabling users to upload custom CSV sales files with format validation and immediate dashboard re-calculation. |
| `src/components/RawOrdersDrawer.tsx` | Searchable, paginated data viewer allowing business stakeholders to inspect individual order records and transaction details. |
| `src/utils/analytics.ts` | Core analytical engine calculating total revenue, quarter-over-quarter dollar and percentage deltas, and top product/channel drivers. |
| `src/utils/csvParser.ts` | File parsing utility that converts raw uploaded CSV text into validated sales order records with robust field mapping. |
| `src/utils/sampleData.ts` | Default transactional dataset of realistic sales records providing immediate out-of-the-box demonstrations. |
