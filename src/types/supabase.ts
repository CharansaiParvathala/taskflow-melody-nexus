
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
  created_by: string | null;
  created_at: string;
  updated_at: string;
  location: string;
  budget: number;
  due_date?: string | null;
}

export interface Payment {
  id: string;
  title: string;
  job_id?: string | null;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'flagged'; // Updated to include 'flagged'
  payment_date?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_by: string;
  created_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
}

export interface Expense {
  id: string;
  title: string;
  job_id?: string | null;
  amount: number;
  description?: string | null;
  date: string;
  category: string;
  approved: boolean;
  created_by: string;
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'material' | 'equipment' | 'human';
  quantity: number;
  unit: string;
  cost_per_unit: number;
  available: boolean;
  status: string;
  assigned_to?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'worker' | 'leader' | 'checker' | 'admin';
  avatar_url?: string | null;
  created_at: string;
  is_active: boolean;
  is_archived: boolean;
}
