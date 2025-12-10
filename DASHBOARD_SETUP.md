# Dashboard & Analytics Setup Guide

## Overview

Your invoice application now includes a comprehensive analytics dashboard backed by Supabase. This guide will help you set up and use the new features.

## Features Added

### 1. Database Schema (Supabase)
- **clients**: Store client information
- **invoices**: Store invoice headers with totals and status
- **invoice_items**: Store individual line items for each invoice
- **item_materials**: Store material breakdown for each item

### 2. Analytics Dashboard
- **KPI Cards**: Total Revenue, Average Invoice Value, Items Sold, Invoice Status
- **Revenue Over Time**: Line chart showing revenue trends
- **Items by Category**: Doughnut chart showing distribution of items
- **Top Materials Used**: Bar chart showing most-used materials
- **Top Clients**: Table showing best customers
- **Material Breakdown**: Detailed table of all materials used

### 3. Time Range Filtering
- 7 Days
- 30 Days
- 90 Days
- All Time

## Setup Instructions

### Step 1: Configure Supabase

1. If you don't have a Supabase project, create one at [supabase.com](https://supabase.com)

2. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy your Project URL
   - Copy your anon/public key

3. Create a `.env` file in the project root (copy from `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Verify Database Schema

The database schema has already been created via migration. You can verify it in your Supabase dashboard:

1. Go to Database > Tables
2. You should see: `clients`, `invoices`, `invoice_items`, `item_materials`

### Step 3: Run the Application

```bash
npm run dev
```

The app will now have 3 tabs in the navigation:
- **Create Invoice**: The main form (existing functionality)
- **Dashboard**: New analytics page
- **Preview**: Invoice preview window

## How to Use

### Saving Invoices to Database

1. Fill out the invoice form as usual
2. Click **"Save to Database"** button (new blue button)
3. You'll see a success message
4. The invoice is now saved to Supabase

### Viewing Analytics

1. Click **"Dashboard"** in the navigation
2. Select a time range (7 days, 30 days, 90 days, or all time)
3. View the analytics:
   - Revenue trends
   - Popular categories
   - Material usage
   - Top clients

### Material Breakdown

When you create items with material breakdowns:
1. Each material and quantity is saved
2. The dashboard aggregates materials across all invoices
3. You can see total quantities used
4. Export to Excel functionality is still available on the preview page

## Database Structure

### Clients Table
- Stores unique client information
- Automatically created/updated when saving invoices
- Links to invoices via `client_id`

### Invoices Table
- Stores invoice headers
- Includes financial totals (subtotal, discount, VAT, total)
- Status tracking (draft, sent, paid, cancelled)
- Links to client

### Invoice Items Table
- Stores line items for each invoice
- Includes category, code, description, dimensions, qty, price
- Can include image URL
- Links to invoice

### Item Materials Table
- Stores material breakdown for each item
- Includes material name, unit, quantity per item, total quantity
- Links to invoice item
- Used for material analytics

## Invoice Status Management

Invoices have a status field with these values:
- `draft`: Default status when created
- `sent`: Mark as sent to client
- `paid`: Mark as paid
- `cancelled`: Mark as cancelled

You can update invoice status programmatically using the `updateInvoiceStatus` function from `lib/invoiceService.ts`.

## Analytics Queries

The dashboard performs these analytics:

1. **Summary Statistics**:
   - Total revenue across all invoices
   - Average invoice value
   - Total items sold
   - Count by status

2. **Time Series**:
   - Revenue and invoice count grouped by date
   - Filtered by selected time range

3. **Category Analysis**:
   - Items and revenue grouped by category
   - Shows which product types are most popular

4. **Material Analysis**:
   - Total quantities of each material used
   - Usage frequency across items
   - Helps with inventory planning

5. **Client Analysis**:
   - Top clients by revenue
   - Invoice count per client
   - Helps identify key customers

## Security

Row Level Security (RLS) is enabled on all tables with policies that allow authenticated users to:
- View all records
- Insert new records
- Update existing records
- Delete records

This is a permissive setup suitable for internal business use. For multi-tenant applications, you should modify the RLS policies to restrict access based on user ownership.

## Troubleshooting

### Dashboard shows "No data available"
- Make sure you've saved at least one invoice to the database
- Check that your `.env` file has correct Supabase credentials
- Open browser console to see any error messages

### "Failed to save invoice to database" error
- Verify your Supabase URL and anon key in `.env`
- Check that the database tables exist in Supabase
- Ensure RLS policies are properly configured

### Charts not displaying
- Make sure chart.js and react-chartjs-2 are installed
- Check browser console for errors
- Verify that the Dashboard component is rendering

## Future Enhancements

Consider adding:
- Invoice editing functionality
- Status update buttons in the dashboard
- More advanced filtering (by client, category, status)
- Export analytics to PDF/Excel
- Real-time updates using Supabase Realtime
- Invoice templates and recurring invoices
- Payment tracking and reminders

## API Reference

### `saveInvoice(payload: InvoicePayload)`
Saves an invoice to the database with all related data.

**Returns**: `{ success: boolean, invoiceId?: string, error?: any }`

### `updateInvoiceStatus(invoiceId: string, status: string)`
Updates the status of an existing invoice.

**Returns**: `{ success: boolean, error?: any }`

### `deleteInvoice(invoiceId: string)`
Deletes an invoice and all related items/materials.

**Returns**: `{ success: boolean, error?: any }`

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase configuration
3. Check the database tables in Supabase dashboard
4. Review RLS policies if having permission issues
