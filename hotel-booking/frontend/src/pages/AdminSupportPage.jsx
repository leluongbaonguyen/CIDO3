import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api('/admin/support');
      setTickets(data);
    } catch (error) {
      console.error('Lỗi tải hỗ trợ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Hỗ trợ khách hàng</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Tiếp nhận và xử lý các yêu cầu trợ giúp từ hệ thống Hotline và Live Chat.</p>
      </div>

      <div className="premium-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Chủ đề</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th style={{ textAlign: 'center' }}>Xử lý</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="table-row">
                <td style={{ fontWeight: '800', color: 'var(--gold)' }}>#SUP-{t.id}</td>
                <td>
                   <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{t.customer_name}</div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.email}</div>
                </td>
                <td>
                   <div style={{ fontWeight: '600' }}>{t.subject}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.message}</div>
                </td>
                <td>
                   <span style={{ 
                     padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '700',
                     background: t.status === 'OPEN' ? '#fff7ed' : '#f1f5f9',
                     color: t.status === 'OPEN' ? '#c2410c' : '#64748b'
                   }}>
                     {t.status === 'OPEN' ? 'ĐANG CHỜ' : 'ĐÃ XỬ LÝ'}
                   </span>
                </td>
                <td>{new Date(t.create_date).toLocaleDateString('vi-VN')}</td>
                <td style={{ textAlign: 'center' }}>
                   <button style={{ background: 'var(--black)', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                      PHẢN HỒI
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
