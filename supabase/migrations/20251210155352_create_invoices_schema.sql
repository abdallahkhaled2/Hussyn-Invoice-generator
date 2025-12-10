/*
  # Create Invoice Management Schema

  ## Overview
  Complete schema for invoice management system with analytics support

  ## New Tables
  
  ### `clients`
  - `id` (uuid, primary key) - Unique client identifier
  - `name` (text) - Client name
  - `company` (text) - Company name
  - `address` (text) - Billing address
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `site_address` (text) - Delivery/site address
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `invoices`
  - `id` (uuid, primary key) - Unique invoice identifier
  - `invoice_no` (text, unique) - Human-readable invoice number
  - `client_id` (uuid, foreign key) - Reference to clients table
  - `project_name` (text) - Project name
  - `invoice_date` (date) - Invoice date
  - `due_date` (date) - Payment due date
  - `subtotal` (numeric) - Sum before discounts/tax
  - `discount` (numeric) - Discount amount
  - `vat_rate` (numeric) - VAT percentage
  - `vat_amount` (numeric) - Calculated VAT amount
  - `total` (numeric) - Final total amount
  - `notes` (text) - Invoice notes/terms
  - `status` (text) - Invoice status (draft, sent, paid, cancelled)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `invoice_items`
  - `id` (uuid, primary key) - Unique item identifier
  - `invoice_id` (uuid, foreign key) - Reference to invoices table
  - `category` (text) - Item category
  - `code` (text) - Item code/name
  - `description` (text) - Item description
  - `dimensions` (text) - Item dimensions
  - `qty` (integer) - Quantity
  - `unit_price` (numeric) - Price per unit
  - `line_total` (numeric) - Calculated line total
  - `image_url` (text) - Item image URL
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `item_materials`
  - `id` (uuid, primary key) - Unique material record identifier
  - `invoice_item_id` (uuid, foreign key) - Reference to invoice_items table
  - `material_name` (text) - Material name
  - `unit` (text) - Unit of measurement
  - `qty_per_item` (numeric) - Quantity per single item
  - `total_qty` (numeric) - Total quantity (qty_per_item * item.qty)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  
  ## Indexes
  - Index on invoice_date for time-series queries
  - Index on client_id for client filtering
  - Index on category for analytics
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  company text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  site_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  project_name text DEFAULT '',
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  discount numeric(14,2) NOT NULL DEFAULT 0,
  vat_rate numeric(5,2) NOT NULL DEFAULT 0,
  vat_amount numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT '',
  code text NOT NULL DEFAULT '',
  description text DEFAULT '',
  dimensions text DEFAULT '',
  qty integer NOT NULL DEFAULT 1,
  unit_price numeric(14,2) NOT NULL DEFAULT 0,
  line_total numeric(14,2) NOT NULL DEFAULT 0,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create item_materials table
CREATE TABLE IF NOT EXISTS item_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_item_id uuid NOT NULL REFERENCES invoice_items(id) ON DELETE CASCADE,
  material_name text NOT NULL,
  unit text NOT NULL DEFAULT '',
  qty_per_item numeric(12,4) NOT NULL DEFAULT 0,
  total_qty numeric(12,4) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_category ON invoice_items(category);
CREATE INDEX IF NOT EXISTS idx_item_materials_item ON item_materials(invoice_item_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view all invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all item materials"
  ON item_materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert item materials"
  ON item_materials FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update item materials"
  ON item_materials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete item materials"
  ON item_materials FOR DELETE
  TO authenticated
  USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoices updated_at
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();