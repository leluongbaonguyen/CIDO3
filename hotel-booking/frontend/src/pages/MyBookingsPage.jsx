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
      loadBookings();
    }
  }, [user, navigate]);

  const pay = async (id) => {
    try {
      await api(`/bookings/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod: 'VNPAY' })
      });
      setMessage('Thanh toán thành công! Đơn đặt phòng đã được cập nhật.');
      loadBookings();
    } catch (err) {
      setMessage('Thanh toán thất bại.');
    }
  };

  const cancel = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) {
      try {
        await api(`/bookings/${id}/cancel`, { method: 'PATCH' });
        setMessage('Đã hủy đơn đặt phòng.');
        loadBookings();
      } catch (err) {
        setMessage('Hủy phòng thất bại: ' + err.message);
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải dữ liệu...</div>;

  return (
    <div className="admin-layout" style={{ marginTop: '40px' }}>

      <div className="sidebar card">
        <h3 style={{ padding: '0 16px', marginBottom: '8px', color: 'var(--primary)' }}>
          Xin chào, {user?.last_name || 'Khách hàng'}
        </h3>
        <p style={{ padding: '0 16px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
          Tài khoản cá nhân
        </p>

        <Link to="/profile">
          <span style={{ marginRight: '8px' }}>👤</span> Thông tin cá nhân
        </Link>
        <Link to="/my-bookings" className="active">
          <span style={{ marginRight: '8px' }}>📅</span> Đơn đặt phòng
        </Link>
        <a href="#!" onClick={(e) => { e.preventDefault(); }}>
          <span style={{ marginRight: '8px' }}>⭐</span> Đánh giá của tôi
        </a>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Quản lý Đơn đặt phòng</h2>

        {message && (
          <div className={message.includes('thất bại') ? "error" : "success"} style={{ padding: '12px', background: message.includes('thất bại') ? 'rgba(210,18,46,0.1)' : 'rgba(3,162,83,0.1)', borderRadius: '8px', color: message.includes('thất bại') ? 'var(--danger)' : 'var(--success)' }}>
            {message}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏨</div>
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Hiện tại chưa có đơn đặt phòng nào</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Hãy bắt đầu chuyến đi tuyệt vời của bạn ngay hôm nay.</p>
            <Link to="/rooms" className="btn">Tìm phòng ngay</Link>
          </div>
        ) : (
          bookings.map((item) => (
            <div className="card" key={item.id} style={{ padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: 'var(--primary)', margin: 0 }}>Mã Đơn: #{item.id}</h3>
                  {item.status === 'PENDING' && <span className="badge badge-orange">Chờ thanh toán</span>}
                  {item.status === 'CONFIRMED' && <span className="badge badge-blue">Đã thanh toán</span>}
                  {item.status === 'COMPLETED' && <span className="badge badge-green">Hoàn tất</span>}
                  {item.status === 'CANCELLED' && <span className="badge" style={{ background: '#f8d7da', color: '#721c24' }}>Đã hủy</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phòng</div>
                    <div style={{ fontWeight: '600' }}>{item.room_type_name || 'Phòng khách sạn'}</div>
                    <div style={{ fontSize: '13px' }}>Phòng số {item.room_number || 'Sẽ cấp sau'}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Khách</div>
                    <div style={{ fontWeight: '600' }}>{item.total_guests} Khách</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nhận phòng:</div>
                    <div style={{ fontWeight: '500' }}>{new Date(item.checkin_date).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Trả phòng:</div>
                    <div style={{ fontWeight: '500' }}>{new Date(item.checkout_date).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              </div>

              <div style={{ width: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '24px', borderLeft: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Tổng thanh toán</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '20px' }}>
                  {Number(item.total_amount).toLocaleString('vi-VN')} đ
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.status === 'PENDING' && (
                    <button className="btn" onClick={() => pay(item.id)} style={{ width: '100%', background: 'var(--secondary)', borderColor: 'var(--secondary)' }}>
                      Thanh toán VNPay
                    </button>
                  )}
                  {['PENDING', 'CONFIRMED'].includes(item.status) && (
                    <button className="btn outline" onClick={() => cancel(item.id)} style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      Hủy đặt phòng
                    </button>
                  )}
                  {item.status === 'COMPLETED' && (
                    <button className="btn outline" style={{ width: '100%' }}>
                      Đánh giá dịch vụ
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
