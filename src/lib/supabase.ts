import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if environment variables are not set
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Using mock client.');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Database types
export interface Complaint {
  id: string;
  type: 'complaint' | 'sos' | 'pcc';
  token_number: string;
  complainant_name: string;
  complainant_phone: string;
  complainant_email?: string;
  complaint_data: any;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

// Database operations
export const complaintsService = {
  // Create a new complaint
  async create(complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) {
      console.log('Mock: Creating complaint', complaint);
      return { ...complaint, id: Math.random().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    }
    
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaint])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all complaints
  async getAll() {
    if (!supabase) {
      console.log('Mock: Getting all complaints');
      return [];
    }
    
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get complaint by ID
  async getById(id: string) {
    if (!supabase) {
      console.log('Mock: Getting complaint by ID', id);
      return null;
    }
    
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update complaint status
  async updateStatus(id: string, status: Complaint['status']) {
    if (!supabase) {
      console.log('Mock: Updating complaint status', id, status);
      return null;
    }
    
    const { data, error } = await supabase
      .from('complaints')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};