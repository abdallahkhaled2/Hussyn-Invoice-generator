import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Database features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          company: string;
          address: string;
          phone: string;
          email: string;
          site_address: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company?: string;
          address?: string;
          phone?: string;
          email?: string;
          site_address?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company?: string;
          address?: string;
          phone?: string;
          email?: string;
          site_address?: string;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_no: string;
          client_id: string | null;
          project_name: string;
          invoice_date: string;
          due_date: string | null;
          subtotal: number;
          discount: number;
          vat_rate: number;
          vat_amount: number;
          total: number;
          notes: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_no: string;
          client_id?: string | null;
          project_name?: string;
          invoice_date?: string;
          due_date?: string | null;
          subtotal?: number;
          discount?: number;
          vat_rate?: number;
          vat_amount?: number;
          total?: number;
          notes?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_no?: string;
          client_id?: string | null;
          project_name?: string;
          invoice_date?: string;
          due_date?: string | null;
          subtotal?: number;
          discount?: number;
          vat_rate?: number;
          vat_amount?: number;
          total?: number;
          notes?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          category: string;
          code: string;
          description: string;
          dimensions: string;
          qty: number;
          unit_price: number;
          line_total: number;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          category?: string;
          code?: string;
          description?: string;
          dimensions?: string;
          qty?: number;
          unit_price?: number;
          line_total?: number;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          category?: string;
          code?: string;
          description?: string;
          dimensions?: string;
          qty?: number;
          unit_price?: number;
          line_total?: number;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      item_materials: {
        Row: {
          id: string;
          invoice_item_id: string;
          material_name: string;
          unit: string;
          qty_per_item: number;
          total_qty: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_item_id: string;
          material_name: string;
          unit?: string;
          qty_per_item?: number;
          total_qty?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_item_id?: string;
          material_name?: string;
          unit?: string;
          qty_per_item?: number;
          total_qty?: number;
          created_at?: string;
        };
      };
    };
  };
};
