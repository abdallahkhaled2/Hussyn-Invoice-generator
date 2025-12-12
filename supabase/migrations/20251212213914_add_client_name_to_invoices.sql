/*
  # Add Client Name to Invoices

  ## Overview
  Stores client name directly on invoices to preserve customer information
  even if the customer record is later deleted.

  ## Changes
  1. New Columns
    - `client_name` (text) - Stores the customer name at time of invoice creation
  
  2. Data Migration
    - Backfills existing invoices with client names from the clients table
  
  ## Rationale
  This ensures invoice data remains complete and accurate regardless of
  changes to the customers table.
*/

-- Add client_name column to invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE invoices ADD COLUMN client_name text DEFAULT '';
  END IF;
END $$;

-- Backfill existing invoices with client names
UPDATE invoices
SET client_name = clients.name
FROM clients
WHERE invoices.client_id = clients.id
  AND (invoices.client_name IS NULL OR invoices.client_name = '');