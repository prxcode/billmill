# BillMill - Invoice Management System

BillMill is a modern, full-stack invoice and delivery note management system built with Next.js, React, Tailwind CSS, and Supabase. It is designed to provide businesses with a clean, professional, and highly responsive interface for generating beautiful A4-printable invoices.

## Features

- **Dashboard Analytics:** Visual overview of total invoiced amounts, received payments, and pending balances using comprehensive charts.
- **Invoice Generation:** Create detailed, professional invoices with automated tax calculations, multi-currency support, and dynamic item rows formatting.
- **Delivery Notes:** Manage delivery routing, consignee details, and tracking notes alongside standard invoicing.
- **PDF Export & Print:** Print-optimized CSS perfectly aligns invoices to A4 paper standards. Includes one-click PDF downloading.
- **Client & Company Management:** Maintain an address book of clients/buyers and support multiple internal business profiles (sellers) with customized bank details and branding per invoice.
- **Supabase Backend:** Secure authentication (Auth), real-time database (Postgres), and Row Level Security (RLS) policies to ensure data privacy per user.

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons, Recharts
- **Backend/Database:** Supabase (PostgreSQL, GoTrue Auth)
- **PDF Generation:** html2canvas, jsPDF

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- A Supabase project

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/billmill.git
   cd billmill
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup Environment Variables
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Database Setup
   Run the SQL commands found in `supabase_migration.sql` in your Supabase SQL Editor. This will set up the necessary tables (`profiles`, `companies`, `clients`, `invoices`, `invoice_items`) along with their respective Row Level Security (RLS) policies.

5. Run the Development Server
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment constraints

When deploying to Vercel or similar platforms, remember to set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the environment variables settings of your hosting provider. Private assets like company logos and stamps should be uploaded separately to your provider or hosted in Supabase Storage, as they are excluded from source control.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
