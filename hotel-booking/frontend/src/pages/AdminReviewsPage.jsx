import { useState } from 'react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([
    { id: 1, customer: 'Lê Lương Bảo Nguyên', room: 'Suite', rating: 5, comment: 'Phòng rất đẹp, dịch vụ tuyệt vời!', status: 'NEW', date: '2026-04-20' },
    { id: 2, customer: 'Trần Tấn Nguyên', room: 'Deluxe', rating: 4, comment: 'View đẹp, tuy nhiên wifi hơi yếu vào buổi tối.', status: 'REPLIED', date: '2026-04-22' }
  ]);

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý đánh giá</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Xem, phản hồi và quản lý các nhận xét từ khách hàng.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Khách hàng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Đánh giá</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Nội dung</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Ngày</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', fontWeight: '600', color: '#1e293b' }}>{r.customer}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{r.room}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ color: '#fbbf24', display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={i < r.rating ? 'fas fa-star' : 'far fa-star'} style={{ fontSize: '12px' }}></i>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', maxWidth: '300px' }}>{r.comment}</td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>{r.date}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button style={{ border: 'none', background: 'transparent', color: '#0ea5e9', cursor: 'pointer' }} title="Phản hồi"><i className="fas fa-reply"></i></button>
                    <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }} title="Xóa"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
