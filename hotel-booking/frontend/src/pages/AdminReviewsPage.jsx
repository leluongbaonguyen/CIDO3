import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);

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

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingLoading || visibleCount >= reviews.length || loading) return;
      
      const threshold = 100;
      const totalHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;
      
      if (totalHeight - scrollPosition < threshold) {
        setIsScrollingLoading(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 6);
          setIsScrollingLoading(false);
        }, 800);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollingLoading, visibleCount, reviews.length, loading]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?')) return;
    try {
      await api(`/admin/reviews/${id}`, { method: 'DELETE' });
      load();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleToggleHide = async (id, currentHidden) => {
    try {
      await api(`/admin/reviews/${id}/visibility`, { 
        method: 'PATCH',
        body: { isHidden: !currentHidden }
      });
      load();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Đánh giá từ khách hàng</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Giám sát phản hồi và chất lượng dịch vụ thực tế từ khách lưu trú.</p>
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '25px' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <div className="skeleton-pulse" style={{ width: '45px', height: '45px', borderRadius: '50px' }}></div>
                     <div>
                        <div className="skeleton-pulse" style={{ width: '120px', height: '18px', marginBottom: '6px' }}></div>
                        <div className="skeleton-pulse" style={{ width: '80px', height: '12px' }}></div>
                     </div>
                  </div>
                  <div className="skeleton-pulse" style={{ width: '70px', height: '18px', borderRadius: '10px' }}></div>
               </div>
               <div className="skeleton-pulse" style={{ width: '100%', height: '16px', marginBottom: '8px' }}></div>
               <div className="skeleton-pulse" style={{ width: '85%', height: '16px', marginBottom: '20px' }}></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                  <div className="skeleton-pulse" style={{ width: '140px', height: '14px' }}></div>
                  <div className="skeleton-pulse" style={{ width: '60px', height: '14px' }}></div>
               </div>
            </div>
          ))
        ) : reviews.length > 0 ? (
          <>
            {reviews.slice(0, visibleCount).map((rev) => (
              <div key={rev.id} style={{ background: '#fff', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow-premium)', border: rev.is_hidden ? '1px dashed #ef4444' : '1px solid #f1f5f9', position: 'relative', opacity: rev.is_hidden ? 0.75 : 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                       <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', color: 'var(--gold)' }}>
                          <i className="fas fa-user-circle"></i>
                       </div>
                       <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                             <div style={{ fontWeight: '800', color: 'var(--primary)' }}>{rev.first_name} {rev.last_name}</div>
                             <span style={{ fontSize: '9px', fontWeight: '900', padding: '2px 8px', borderRadius: '50px', backgroundColor: rev.is_hidden ? '#fee2e2' : '#d1fae5', color: rev.is_hidden ? '#ef4444' : '#10b981' }}>
                                {rev.is_hidden ? 'ĐÃ ẨN' : 'ĐANG HIỂN THỊ'}
                             </span>
                          </div>
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
                    <div style={{ display: 'flex', gap: '15px' }}>
                       <button 
                         onClick={() => handleToggleHide(rev.id, rev.is_hidden)}
                         style={{ background: 'transparent', border: 'none', color: rev.is_hidden ? '#10b981' : '#f59e0b', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                       >
                          <i className={rev.is_hidden ? "fas fa-eye" : "fas fa-eye-slash"}></i> {rev.is_hidden ? 'HIỂN THỊ' : 'ẨN ĐI'}
                       </button>
                       <button 
                         onClick={() => handleDelete(rev.id)}
                         style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                       >
                          <i className="fas fa-trash-alt"></i> XÓA BỎ
                       </button>
                    </div>
                 </div>
              </div>
            ))}
            {isScrollingLoading && (
              Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} style={{ background: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                         <div className="skeleton-pulse" style={{ width: '45px', height: '45px', borderRadius: '50px' }}></div>
                         <div>
                            <div className="skeleton-pulse" style={{ width: '120px', height: '18px', marginBottom: '6px' }}></div>
                            <div className="skeleton-pulse" style={{ width: '80px', height: '12px' }}></div>
                         </div>
                      </div>
                      <div className="skeleton-pulse" style={{ width: '70px', height: '18px', borderRadius: '10px' }}></div>
                   </div>
                   <div className="skeleton-pulse" style={{ width: '100%', height: '16px', marginBottom: '8px' }}></div>
                   <div className="skeleton-pulse" style={{ width: '85%', height: '16px', marginBottom: '20px' }}></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                      <div className="skeleton-pulse" style={{ width: '140px', height: '14px' }}></div>
                      <div className="skeleton-pulse" style={{ width: '60px', height: '14px' }}></div>
                   </div>
                </div>
              ))
            )}
          </>
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
             <i className="far fa-comment-dots" style={{ fontSize: '50px', marginBottom: '20px', opacity: 0.2 }}></i>
             <p>Hiện chưa có đánh giá nào từ khách hàng.</p>
          </div>
        )}
      </div>
    </div>
  );
}
