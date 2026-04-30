import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);

  const load = async () => {
    try {
        const data = await api('/admin/reviews');
        setReviews(data);
    } catch (error) {
        console.error('Lỗi tải đánh giá:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
        await api(`/admin/reviews/${id}`, { method: 'DELETE' });
        load();
    } catch (error) {
        alert('Lỗi xóa đánh giá');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý đánh giá</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Duyệt và quản lý các nhận xét từ khách hàng sau khi hoàn tất kỳ nghỉ.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Khách hàng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Phòng đã ở</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Xếp hạng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Nội dung</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Ngày gửi</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', fontWeight: '600' }}>{r.first_name} {r.last_name}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{r.room_type_name}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ color: '#fbbf24', display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={i < r.rating ? 'fas fa-star' : 'far fa-star'} style={{ fontSize: '12px' }}></i>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', maxWidth: '300px' }}>{r.comment}</td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>{new Date(r.create_date).toLocaleDateString()}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }} title="Xóa"><i className="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chưa có đánh giá nào.</div>}
      </div>
    </div>
  );
}
