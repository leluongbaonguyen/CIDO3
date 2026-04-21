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

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const data = await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({ ...form, roomId: Number(id) })
      });
      setSuccess(`Đặt phòng thành công! Mã đơn: #${data.bookingId}. Bạn có thể xem chi tiết trong "Đơn đặt phòng của tôi".`);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !room) return <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--danger)' }}>{error}</div>;
  if (!room) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '32px', alignItems: 'start' }}>

        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
            <img
              src={room.photo_urls || 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80'}
              alt={room.room_type_name}
              style={{ width: '100%', height: '500px', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <h1 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '8px' }}>
            {room.room_type_name} - Phòng {room.room_number}
          </h1>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
            <span>⭐ 4.8 (124 Đánh giá)</span>
            <span>•</span>
            <span>Tầng: {room.floor}</span>
            <span>•</span>
            <span>Sức chứa: {room.max_occupancy} khách</span>
          </div>

          <div style={{ marginBottom: '32px', lineHeight: '1.8', color: 'var(--text-dark)', fontSize: '15px' }}>
            {room.description || 'Chưa có mô tả chi tiết cho phòng này. Nơi lưu trú tuyệt vời dành cho những ai thích sự yên tĩnh và sang trọng.'}
          </div>

          <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Tiện nghi phòng</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            {(room.amenities?.length ? room.amenities : [
              { id: 1, name: 'Wifi tốc độ cao miễn phí' }, { id: 2, name: 'Máy lạnh trung tâm' },
              { id: 3, name: 'Bồn tắm nước nóng' }, { id: 4, name: 'Minibar' }
            ]).map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
                <span style={{ color: 'var(--secondary)' }}>✓</span> {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ position: 'sticky', top: '100px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--secondary)' }}>
              {Number(room.base_price).toLocaleString('vi-VN')} đ
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/ đêm</span>
          </div>

          <form onSubmit={handleBooking}>
            <h3 style={{ marginBottom: '20px' }}>Yêu cầu đặt phòng</h3>

            {success && <div className="success" style={{ padding: '12px', background: 'rgba(3,162,83,0.1)', borderRadius: '8px', marginBottom: '16px', lineHeight: '1.4' }}>{success}</div>}
            {error && <div className="error" style={{ padding: '12px', background: 'rgba(210,18,46,0.1)', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

            <div className="input-group">
              <label className="input-label">Ngày nhận phòng</label>
              <input type="date" value={form.checkinDate} onChange={(e) => setForm({ ...form, checkinDate: e.target.value })} required />
            </div>

            <div className="input-group">
              <label className="input-label">Ngày trả phòng</label>
              <input type="date" value={form.checkoutDate} onChange={(e) => setForm({ ...form, checkoutDate: e.target.value })} required />
            </div>

            <div className="input-group">
              <label className="input-label">Số khách</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
                <button type="button" onClick={() => form.totalGuests > 1 && setForm({ ...form, totalGuests: form.totalGuests - 1 })} style={{ padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                <input type="number" min="1" value={form.totalGuests} onChange={(e) => setForm({ ...form, totalGuests: Number(e.target.value) })} style={{ flex: 1, border: 'none', textAlign: 'center', padding: '12px 0' }} />
                <button type="button" onClick={() => setForm({ ...form, totalGuests: form.totalGuests + 1 })} style={{ padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Mã giảm giá (Tùy chọn)</label>
              <input placeholder="Nhập mã ưu đãi" value={form.discountCode} onChange={(e) => setForm({ ...form, discountCode: e.target.value })} />
            </div>

            <div className="input-group">
              <label className="input-label">Yêu cầu đặc biệt (Tùy chọn)</label>
              <textarea rows={3} placeholder="VD: Khách đến muộn..." value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} />
            </div>

            <button className="btn" type="submit" style={{ width: '100%', fontSize: '16px', padding: '16px', marginTop: '16px' }}>
              Đặt phòng ngay
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
