import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Partner, PartnerType, BizType } from '@/types';

export interface PartnerFormData {
  code: string;
  name: string;
  type: PartnerType;
  biz_no: string;
  biz_type: BizType;
  rep: string;
  tel?: string;
  fax?: string;
  addr?: string;
  bank?: string;
  account?: string;
  email?: string;
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .is('deleted_at', null)
      .order('code', { ascending: true });

    if (!error && data) setPartners(data);
    setLoading(false);
    return { data, error };
  }, []);

  const createPartner = useCallback(async (form: PartnerFormData) => {
    const { data, error } = await supabase
      .from('partners')
      .insert(form)
      .select()
      .single();

    if (!error && data) {
      setPartners(prev => [...prev, data]);
    }
    return { data, error };
  }, []);

  const updatePartner = useCallback(async (id: number, form: Partial<PartnerFormData>) => {
    const { data, error } = await supabase
      .from('partners')
      .update(form)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setPartners(prev => prev.map(p => p.id === id ? data : p));
    }
    return { data, error };
  }, []);

  const deletePartner = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('partners')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setPartners(prev => prev.filter(p => p.id !== id));
    }
    return { error };
  }, []);

  return { partners, loading, fetchPartners, createPartner, updatePartner, deletePartner };
}
