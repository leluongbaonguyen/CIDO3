import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function AdminNewBookingPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    checkIn: '',
    checkOut: '',
    roomId: '',
    guests: 1,
    paymentMethod: 'CASH',
    notes: ''
  });

  const loadData = async () => {
    try {
      const cData = await api('/admin/customers');
      setCustomers(cData);
      const rData = await api('/admin/rooms');
      setRooms(rData.filter(r => r.status !== 'MAINTENANCE'));
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic đặt phòng nghiệp vụ
      await api('/bookings', { 
        method: 'POST', 
        body: {
          customerId: Number(formData.customerId),
          roomId: Number(formData.roomId),
          checkInDate: formData.checkIn,
          checkOutDate: formData.checkOut,
          adults: Number(formData.guests),
          children: 0,
          totalGuests: Number(formData.guests),
          paymentMethod: formData.paymentMethod,
          note: formData.notes
        } 
      });
      alert('Tạo đơn đặt phòng thành công!');
      navigate('/admin/bookings');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán tổng giá tiền (tạm tính)
  const selectedRoom = rooms.find(r => r.id === parseInt(formData.roomId));
  const days = (formData.checkIn && formData.checkOut) 
    ? Math.max(1, Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalPrice = selectedRoom ? selectedRoom.base_price * days : 0;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Thêm đơn đặt phòng mới</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Nghiệp vụ dành cho khách đặt trực tiếp hoặc gọi điện qua hotline.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', maxWidth: '900px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Chọn khách hàng</label>
            <select 
              required value={formData.customerId} 
              onChange={e => setFormData({...formData, customerId: e.target.value})}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            >
              <option value="">-- Chọn khách hàng từ hệ thống --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name || `${c.first_name} ${c.last_name}`} ({c.phone})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Ngày nhận phòng (Check-in)</label>
              <input required type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Ngày trả phòng (Check-out)</label>
              <input required type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Chọn phòng trống</label>
              <select 
                required value={formData.roomId} 
                onChange={e => setFormData({...formData, roomId: e.target.value})}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="">-- Chọn phòng đang sẵn sàng --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Phòng {r.room_number} - {r.room_type_name} ({r.status === 'AVAILABLE' ? 'Sẵn sàng' : r.status === 'OCCUPIED' ? 'Đang có khách' : 'Đang dọn dẹp'})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Số lượng khách</label>
              <input type="number" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} min={1} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Giá phòng / đêm</label>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: '700', color: '#1e293b' }}>
                {selectedRoom ? Number(selectedRoom.base_price).toLocaleString() : 0} ₫
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Tổng số tiền ({days} đêm)</label>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9', fontWeight: '800', color: '#0369a1', fontSize: '18px' }}>
                {totalPrice.toLocaleString()} ₫
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Phương thức thanh toán</label>
            <select 
              required value={formData.paymentMethod} 
              onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#fff', fontSize: '14px' }}
            >
              <option value="CASH">Thanh toán tại quầy (Tiền mặt / Thẻ POS)</option>
              <option value="BANK_TRANSFER">Chuyển khoản trực tiếp qua ngân hàng</option>
              <option value="VNPAY">Cổng thanh toán điện tử VNPay / QR Code</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Yêu cầu đặc biệt</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Ghi chú về dịch vụ, ăn uống, đưa đón..." rows={3} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" onClick={() => navigate('/admin/bookings')} style={{ padding: '12px 32px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Hủy bỏ</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 48px', borderRadius: '8px', border: 'none', backgroundColor: '#0ea5e9', color: '#fff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(14 165 233 / 0.3)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
