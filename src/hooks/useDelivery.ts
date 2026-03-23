import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { PartnerDeliverySummary } from '@/types';
import { today } from '@/types';

export function useDelivery() {
  const completeDelivery = useCallback(async (orderId: number) => {
    const { data, error } = await supabase
      .from('orders')
      .update({
        delivery_status: 'completed',
        delivery_date: today(),
      })
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  }, []);

  const revertDelivery = useCallback(async (orderId: number) => {
    const { data, error } = await supabase
      .from('orders')
      .update({
        delivery_status: 'pending',
        delivery_date: null,
      })
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  }, []);

  const fetchDeliverySummary = useCallback(async (filters?: {
    dateFrom?: string;
    dateTo?: string;
    partnerId?: number;
  }) => {
    let query = supabase
      .from('v_partner_delivery_summary')
      .select('*')
      .order('month', { ascending: false });

    if (filters?.dateFrom) query = query.gte('month', filters.dateFrom);
    if (filters?.dateTo) query = query.lte('month', filters.dateTo);
    if (filters?.partnerId) query = query.eq('partner_id', filters.partnerId);

    const { data, error } = await query;
    return { data: data as PartnerDeliverySummary[] | null, error };
  }, []);

  return { completeDelivery, revertDelivery, fetchDeliverySummary };
}
