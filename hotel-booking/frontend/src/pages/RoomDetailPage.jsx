import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    checkinDate: '',
    checkoutDate: '',
    totalGuests: 1,
    specialRequests: '',
    discountCode: ''
  });

  useEffect(() => {
    api(`/rooms/${id}`).then(setRoom).catch((err) => setError(err.message));
  }, [id]);

  const [showPayment, setShowPayment] = useState(false);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    // Ràng buộc nghiệp vụ
    const checkin = new Date(form.checkinDate);
    const checkout = new Date(form.checkoutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkin < today) {
      return setError('Ngày nhận phòng không được ở quá khứ.');
    }
    if (checkout <= checkin) {
      return setError('Ngày trả phòng phải sau ngày nhận phòng.');
    }
    if (form.totalGuests > room.max_occupancy) {
      return setError(`Số khách vượt quá sức chứa tối đa (${room.max_occupancy} khách).`);
    }

    setError('');
    // Chuyển sang bước thanh toán
    setShowPayment(true);
  };

  const processPayment = async () => {
    try {
      // Simulate VNPay API process
      setSuccess('Đang xử lý thanh toán VNPay...');
      setShowPayment(false);
      
      setTimeout(async () => {
        const data = await api('/bookings', {
          method: 'POST',
          body: JSON.stringify({ ...form, roomId: Number(id), paymentMethod: 'VNPAY' })
        });
        setSuccess(`Thanh toán thành công! Mã giao dịch: VNPAY_${Math.floor(Math.random() * 1000000)}. Mã đơn: #${data.bookingId}. Bạn có thể xem chi tiết trong "Đơn đặt phòng của tôi".`);
        setError('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const getImageUrl = (photoUrls) => {
    try {
      if (!photoUrls) return 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80';
      const parsed = JSON.parse(photoUrls);
      return parsed[0] || 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80';
    } catch (e) {
      return photoUrls; 
    }
  };

  if (error && !room) return <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-dark)' }}>{error}</div>;
  if (!room) return <div style={{ textAlign: 'center', marginTop: '40px' }}><i className="fas fa-spinner fa-spin" style={{ color: 'var(--primary)', fontSize: '32px' }}></i></div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '32px', alignItems: 'start' }}>

        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px', borderRadius: '16px' }}>
            <img
              src={getImageUrl(room.photo_urls)}
              alt={room.room_type_name}
              style={{ width: '100%', height: '500px', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <h1 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '8px', fontWeight: '700' }}>
            {room.room_type_name} - Phòng {room.room_number}
          </h1>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px', alignItems: 'center' }}>
            <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '16px', fontWeight: '600' }}><i className="fas fa-star" style={{ color: '#f59e0b' }}></i> 4.8 Tiệm cận hoàn hảo</span>
            <span>(124 Đánh giá)</span>
            <span>•</span>
            <span><i className="fas fa-building"></i> Tầng: {room.floor}</span>
            <span>•</span>
            <span><i className="fas fa-user-friends"></i> Sức chứa: {room.max_occupancy} khách</span>
          </div>

          <div style={{ marginBottom: '32px', lineHeight: '1.8', color: 'var(--text-dark)', fontSize: '15px' }}>
            {room.description || 'Chưa có mô tả chi tiết cho phòng này. Nơi lưu trú tuyệt vời dành cho những ai thích sự yên tĩnh và sang trọng. Tọa lạc tại vị trí thuận lợi, dễ dàng di chuyển.'}
          </div>

          <h3 style={{ marginBottom: '16px', color: 'var(--text-dark)', fontSize: '20px', fontWeight: '700' }}>Tiện nghi phòng</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            {(room.amenities?.length ? room.amenities : [
              { id: 1, name: 'Wifi tốc độ cao miễn phí', icon: 'fa-wifi' }, { id: 2, name: 'Máy lạnh trung tâm', icon: 'fa-snowflake' },
              { id: 3, name: 'Bồn tắm nước nóng', icon: 'fa-bath' }, { id: 4, name: 'Minibar', icon: 'fa-wine-glass-alt' }
            ]).map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-dark)', backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: '8px' }}>
                <i className={`fas ${item.icon || 'fa-check'}`} style={{ color: 'var(--primary)' }}></i> {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ position: 'sticky', top: '100px', padding: '32px', borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--secondary)' }}>
              {Number(room.base_price).toLocaleString('vi-VN')} ₫
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/ đêm</span>
          </div>

          <form onSubmit={handleBooking}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '700', color: 'var(--text-dark)' }}>Yêu cầu đặt phòng</h3>

            {success && <div className="success" style={{ padding: '16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '20px', lineHeight: '1.5' }}><i className="fas fa-check-circle"></i> {success}</div>}
            {error && <div className="error" style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', lineHeight: '1.5' }}><i className="fas fa-exclamation-circle"></i> {error}</div>}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Ngày nhận phòng</label>
              <input type="date" value={form.checkinDate} onChange={(e) => setForm({ ...form, checkinDate: e.target.value })} required style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Ngày trả phòng</label>
              <input type="date" value={form.checkoutDate} onChange={(e) => setForm({ ...form, checkoutDate: e.target.value })} required style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Số khách</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
                <button type="button" onClick={() => form.totalGuests > 1 && setForm({ ...form, totalGuests: form.totalGuests - 1 })} style={{ padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', color: 'var(--primary)' }}>-</button>
                <input type="number" min="1" value={form.totalGuests} onChange={(e) => setForm({ ...form, totalGuests: Number(e.target.value) })} style={{ flex: 1, border: 'none', textAlign: 'center', padding: '12px 0', backgroundColor: 'transparent' }} />
                <button type="button" onClick={() => setForm({ ...form, totalGuests: form.totalGuests + 1 })} style={{ padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', color: 'var(--primary)' }}>+</button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Mã giảm giá (Tùy chọn)</label>
              <input placeholder="Nhập mã ưu đãi" value={form.discountCode} onChange={(e) => setForm({ ...form, discountCode: e.target.value })} style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Yêu cầu đặc biệt (Tùy chọn)</label>
              <textarea rows={3} placeholder="VD: Khách đến muộn..." value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', fontFamily: 'inherit' }} />
            </div>

            <button type="submit" style={{ width: '100%', fontSize: '16px', padding: '16px', marginTop: '16px', backgroundColor: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = 'var(--secondary-hover)'} onMouseLeave={e => e.target.style.backgroundColor = 'var(--secondary)'}>
              Đặt phòng ngay
            </button>
          </form>
        </div>

      </div>

      {/* VNPay Payment Modal */}
      {showPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '400px', backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#005baa', margin: 0, fontSize: '24px', fontWeight: '800' }}>VNPAY</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>Thanh toán trực tuyến an toàn</p>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Đơn hàng:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>Phòng {room.room_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Số tiền:</span>
                <span style={{ fontWeight: '700', color: 'var(--secondary)', fontSize: '18px' }}>
                  {/* Fake calc: (checkout - checkin) * base_price. For simplicity, just use base_price here */}
                  {Number(room.base_price).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px' }}>Quý khách vui lòng chọn ứng dụng ngân hàng hoặc ví VNPay để quét mã QR thanh toán.</p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setShowPayment(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-dark)', border: '1px solid var(--border-light)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Hủy</button>
              <button onClick={processPayment} style={{ flex: 2, padding: '12px', backgroundColor: '#005baa', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Xác nhận thanh toán</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
