
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/supabase';

export const fetchJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*');

  if (error) {
    throw error;
  }

  return data as Job[];
};

export const createJob = async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select();

  if (error) {
    throw error;
  }

  return data?.[0] as Job;
};

export const updateJob = async (id: string, jobData: Partial<Job>) => {
  const { data, error } = await supabase
    .from('jobs')
    .update(jobData)
    .eq('id', id)
    .select();

  if (error) {
    throw error;
  }

  return data?.[0] as Job;
};

export const getJobById = async (id: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as Job;
};
