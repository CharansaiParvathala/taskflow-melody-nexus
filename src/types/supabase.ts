
import type { Database } from '@/integrations/supabase/types';

// Re-export database types from the generated file
export type { Database } from '@/integrations/supabase/types';

// Create supplementary types as needed
export type Tables = Database['public']['Tables'];

// Custom type definitions for the app
export interface Job {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assigned_to?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  location: string;
  budget: number;
}

export interface Payment {
  id: string;
  job_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_date: string;
  payment_method: string;
  notes?: string;
}

export interface Expense {
  id: string;
  job_id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  approved: boolean;
  submitted_by: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'material' | 'equipment' | 'human';
  quantity: number;
  unit: string;
  cost_per_unit: number;
  available: boolean;
}
