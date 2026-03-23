import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useOrders } from '@/hooks/useOrders';
import { doPrint } from '@/components/PrintStyles';
import { fmt, fmtW } from '@/types';
import type { OrderWithPartner, OrderItem, Company } from '@/types';

export function TradeStatementView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const { fetchOrderItems } = useOrders();

  const [order, setOrder] = useState<OrderWithPartner | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [creatorName, setCreatorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);

      const [orderRes, companyRes] = await Promise.all([
        supabase.from('v_orders_with_partner').select('*').eq('id', Number(id)).single(),
        supabase.from('company').select('*').single(),
      ]);

      if (orderRes.data) {
        setOrder(orderRes.data);
        const { data: itemData } = await fetchOrderItems(orderRes.data.id);
        if (itemData) setItems(itemData);

        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', orderRes.data.created_by)
          .single();
        if (userData) setCreatorName(userData.name);
      }
      if (companyRes.data) setCompany(companyRes.data);

      setLoading(false);
    };
    load();
  }, [id, fetchOrderItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg">주문을 찾을 수 없습니다</p>
        <button onClick={() => navigate('/delivery')} className="mt-4 text-indigo-600 hover:underline text-sm">목록으로 돌아가기</button>
      </div>
    );
  }

  const supplyAmount = order.supply_amount;
  const taxAmount = order.tax_amount;
  const totalAmount = order.total_amount;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/delivery')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">거래명세서 미리보기</h2>
        </div>
        <button
          onClick={() => doPrint(printRef, `${order.doc_no}_거래명세서`)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
        >
          <Printer className="w-4 h-4" /> 인쇄
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto">
        <div ref={printRef}>
          <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 20, letterSpacing: 6 }}>
            거 래 명 세 서
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <table style={{ border: '1px solid #e2e8f0', borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
              <tbody>
                <tr><td colSpan={2} style={{ padding: '6px 10px', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', letterSpacing: 4 }}>수 신</td></tr>
                <tr><td style={{ padding: '5px 10px', color: '#64748b', width: 80 }}>거래처명</td><td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 500 }}>{order.partner_name}</td></tr>
                <tr><td style={{ padding: '5px 10px', color: '#64748b' }}>담당자</td><td style={{ padding: '5px 10px', textAlign: 'right' }}>{order.contact_person || '-'}</td></tr>
                <tr><td style={{ padding: '5px 10px', color: '#64748b' }}>Vessel.</td><td style={{ padding: '5px 10px', textAlign: 'right' }}>{order.vessel || '-'}</td></tr>
                <tr><td style={{ padding: '5px 10px', color: '#64748b' }}>문서번호</td><td style={{ padding: '5px 10px', textAlign: 'right' }}>{order.doc_no}</td></tr>
              </tbody>
            </table>

            <table style={{ border: '1px solid #e2e8f0', borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
              <tbody>
                <tr><td colSpan={2} style={{ padding: '6px 10px', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', letterSpacing: 4 }}>공 급</td></tr>
                {company && (
                  <>
                    <tr><td style={{ padding: '5px 10px', color: '#64748b', width: 80 }}>공급처명</td><td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 500 }}>{company.name}</td></tr>
                    <tr><td style={{ padding: '5px 10px', color: '#64748b' }}>담당자</td><td style={{ padding: '5px 10px', textAlign: 'right' }}>{creatorName || company.rep}</td></tr>
                    <tr><td style={{ padding: '5px 10px', color: '#64748b' }}>주소</td><td style={{ padding: '5px 10px', textAlign: 'right' }}>{company.addr || '-'}</td></tr>
                    <tr><td style={{ padding: '5px 10px', color: '#64748b' }}>전화번호 / 팩스번호</td><td style={{ padding: '5px 10px', textAlign: 'right' }}>{[company.tel, company.fax].filter(Boolean).join(' / ') || '-'}</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 11, marginBottom: 10 }}>
            <span style={{ color: '#94a3b8' }}>납품일: {order.delivery_date || order.order_date}</span>
          </div>

          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 14 }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, background: '#334155', color: '#fff', fontWeight: 600, textAlign: 'center' }}>No</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, background: '#334155', color: '#fff', fontWeight: 600 }}>품명</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, background: '#334155', color: '#fff', fontWeight: 600 }}>사양</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, background: '#334155', color: '#fff', fontWeight: 600, textAlign: 'center' }}>수량</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, background: '#334155', color: '#fff', fontWeight: 600, textAlign: 'center' }}>단위</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, background: '#334155', color: '#fff', fontWeight: 600, textAlign: 'right' }}>단가</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, background: '#334155', color: '#fff', fontWeight: 600, textAlign: 'right' }}>금액</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, background: '#334155', color: '#fff', fontWeight: 600 }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11 }}>{item.name}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11 }}>{item.spec}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, textAlign: 'center' }}>{fmt(item.qty)}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, textAlign: 'center' }}>{item.unit}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, textAlign: 'right' }}>{fmt(item.price)}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11, textAlign: 'right' }}>{fmt(item.qty * item.price)}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px 10px', fontSize: 11 }}>{item.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'right', marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, padding: '3px 0', fontSize: 12 }}>
              <span style={{ color: '#94a3b8' }}>공급가액</span><span>{fmtW(supplyAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, padding: '3px 0', fontSize: 12 }}>
              <span style={{ color: '#94a3b8' }}>세액</span><span>{fmtW(taxAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, padding: '6px 0 3px', fontSize: 16, fontWeight: 700, borderTop: '2px solid #1e293b', marginTop: 3 }}>
              <span>합계</span><span>{fmtW(totalAmount)}</span>
            </div>
          </div>

          <div style={{ marginTop: 20, fontSize: 11, border: '1px solid #e2e8f0', padding: 8, borderRadius: 4 }}>
            <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>비고</div>
            <div>상기와 같이 거래명세서를 발행합니다.</div>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, border: '1px solid #e2e8f0', padding: 8, borderRadius: 4, background: '#f8fafc' }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>입금 계좌 안내</div>
            <div style={{ color: '#475569' }}>BNK경남은행 207-0227-2766-02</div>
            <div style={{ color: '#475569' }}>예금주 : 해원마린서비스 주식회사</div>
          </div>

          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'flex-end', gap: 36 }}>
            <div style={{ textAlign: 'center', width: 70 }}>
              <div style={{ borderBottom: '1px solid #1e293b', height: 50 }} />
              <div style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>인수</div>
            </div>
            <div style={{ textAlign: 'center', width: 70 }}>
              <div style={{ borderBottom: '1px solid #1e293b', height: 50 }} />
              <div style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>인도</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
