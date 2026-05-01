import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api('/admin/reviews');
      setReviews(data);
    } catch (error) {
      console.error('Lỗi tải đánh giá:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn ẩn đánh giá này khỏi trang chủ?')) return;
    try {
      await api(`/admin/reviews/${id}`, { method: 'DELETE' });
      load();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>;

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Đánh giá từ khách hàng</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Giám sát phản hồi và chất lượng dịch vụ thực tế từ khách lưu trú.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '25px' }}>
        {reviews.map((rev) => (
          <div key={rev.id} style={{ background: '#fff', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow-premium)', border: '1px solid #f1f5f9', position: 'relative' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                   <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', color: 'var(--gold)' }}>
                      <i className="fas fa-user-circle"></i>
                   </div>
                   <div>
                      <div style={{ fontWeight: '800', color: 'var(--primary)' }}>{rev.first_name} {rev.last_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '700' }}>#{rev.room_type_name}</div>
                   </div>
                </div>
                <div style={{ display: 'flex', color: '#f59e0b', gap: '3px' }}>
                   {[...Array(5)].map((_, i) => (
                     <i key={i} className={`${i < rev.rating ? 'fas' : 'far'} fa-star`}></i>
                   ))}
                </div>
             </div>
             
             <p style={{ fontSize: '15px', color: 'var(--primary)', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '24px', borderLeft: '4px solid var(--gold)', paddingLeft: '20px' }}>
                "{rev.comment}"
             </p>

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                   <i className="far fa-clock" style={{ marginRight: '5px' }}></i>
                   {new Date(rev.create_date).toLocaleDateString('vi-VN')}
                </div>
                <button 
                  onClick={() => handleDelete(rev.id)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                   <i className="fas fa-trash-alt"></i> GỠ BỎ
                </button>
             </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
           <i className="far fa-comment-dots" style={{ fontSize: '50px', marginBottom: '20px', opacity: 0.2 }}></i>
           <p>Hiện chưa có đánh giá nào từ khách hàng.</p>
        </div>
      )}
    </div>
  );
}
