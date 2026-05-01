import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      const data = await api('/bookings/mine');
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      window.scrollTo(0, 0);
      loadBookings();
    }
  }, [user, navigate]);

  const cancel = async (id, checkinDate) => {
    const checkin = new Date(checkinDate);
    const now = new Date();
    if ((checkin - now) / (1000 * 60 * 60) < 24) {
      alert('Chính sách: Không thể hủy trong vòng 24 giờ trước nhận phòng.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn này?')) {
      try {
        await api(`/bookings/${id}/cancel`, { method: 'PATCH' });
        loadBookings();
        alert('Đã hủy đơn thành công.');
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  if (loading) return (
    <div style={{ padding: '150px', textAlign: 'center' }}>
       <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '40px', color: 'var(--gold)' }}></i>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
          
          {/* USER SIDEBAR */}
          <aside style={{ height: 'fit-content' }}>
             <div className="card-luxury" style={{ padding: '40px 30px', textAlign: 'center' }}>
                <div style={{ 
                   width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gold)', 
                   margin: '0 auto 20px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                   fontSize: '32px', color: '#fff', fontWeight: '800', boxShadow: '0 10px 20px rgba(196,166,97,0.3)'
                }}>
                   {user?.first_name?.[0] || 'U'}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '5px' }}>{user?.first_name} {user?.last_name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }}>{user?.email}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '600', transition: '0.3s' }}>
                      <i className="far fa-user-circle"></i> Thông tin cá nhân
                   </Link>
                   <Link to="/my-bookings" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderRadius: '12px', textDecoration: 'none', color: '#fff', background: 'var(--primary)', fontWeight: '700', boxShadow: '0 10px 20px rgba(15,23,42,0.1)' }}>
                      <i className="fas fa-calendar-check"></i> Đơn đặt phòng
                   </Link>
                   <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '600' }}>
                      <i className="far fa-star"></i> Đánh giá của tôi
                   </Link>
                </div>
             </div>
          </aside>

          {/* MAIN CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
             <div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '10px' }}>Chuyến đi của bạn</h2>
                <p style={{ color: 'var(--text-muted)' }}>Xem và quản lý các lịch trình nghỉ dưỡng tại BOOKING X.</p>
             </div>

             {bookings.length === 0 ? (
                <div className="card-luxury" style={{ padding: '80px', textAlign: 'center' }}>
                   <div style={{ fontSize: '60px', color: 'var(--gold)', marginBottom: '20px', opacity: 0.3 }}>
                      <i className="fas fa-hotel"></i>
                   </div>
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '15px' }}>Chưa có đơn đặt phòng nào</h3>
                   <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Hãy chọn một không gian nghỉ dưỡng tuyệt vời cho chuyến đi sắp tới.</p>
                   <Link to="/rooms" className="btn-gold" style={{ padding: '15px 40px', display: 'inline-block' }}>Khám phá phòng ngay</Link>
                </div>
             ) : (
                bookings.map(item => (
                   <div key={item.id} className="card-luxury" style={{ display: 'grid', gridTemplateColumns: '250px 1fr 200px', padding: '0', overflow: 'hidden' }}>
                      <div style={{ background: `url(${JSON.parse(item.photo_urls || '[""]')[0]}) center/cover`, minHeight: '200px' }}></div>
                      <div style={{ padding: '30px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Mã đơn #{item.id}</span>
                            <StatusBadge status={item.status} />
                         </div>
                         <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)', marginBottom: '15px' }}>{item.room_type_name}</h3>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <InfoItem icon="fa-calendar-alt" label="Nhận phòng" value={new Date(item.checkin_date).toLocaleDateString('vi-VN')} />
                            <InfoItem icon="fa-moon" label="Trả phòng" value={new Date(item.checkout_date).toLocaleDateString('vi-VN')} />
                         </div>
                      </div>
                      <div style={{ padding: '30px', borderLeft: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', background: '#fafafa' }}>
                         <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Tổng thanh toán</span>
                         <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginBottom: '20px' }}>{Number(item.total_amount).toLocaleString()}đ</div>
                         
                         {['PENDING', 'CONFIRMED'].includes(item.status) && (
                            <button onClick={() => cancel(item.id, item.checkin_date)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fff', fontWeight: '700', cursor: 'pointer', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}>Hủy đơn</button>
                         )}
                         {item.status === 'COMPLETED' && (
                            <button className="btn-gold" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '13px' }}>Viết đánh giá</button>
                         )}
                      </div>
                   </div>
                ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
    let config = { label: status, color: '#64748b', bg: '#f1f5f9' };
    if (status === 'PENDING') config = { label: 'CHỜ DUYỆT', color: '#f59e0b', bg: '#fef3c7' };
    if (status === 'CONFIRMED') config = { label: 'ĐÃ XÁC NHẬN', color: '#0ea5e9', bg: '#e0f2fe' };
    if (status === 'COMPLETED') config = { label: 'HOÀN TẤT', color: '#10b981', bg: '#dcfce7' };
    if (status === 'CANCELLED') config = { label: 'ĐÃ HỦY', color: '#ef4444', bg: '#fee2e2' };

    return (
        <span style={{ fontSize: '10px', fontWeight: '800', color: config.color, background: config.bg, padding: '4px 12px', borderRadius: '50px', letterSpacing: '1px' }}>{config.label}</span>
    );
}

function InfoItem({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--gold)', fontSize: '12px' }}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{value}</div>
            </div>
        </div>
    );
}
