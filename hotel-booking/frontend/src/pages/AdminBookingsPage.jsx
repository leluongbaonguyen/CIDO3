import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const load = async () => {
    try {
        const data = await api('/admin/bookings');
        setBookings(data);
    } catch (error) {
        console.error('Lỗi tải đơn hàng:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
        await api(`/admin/bookings/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
        load();
        if (selectedBooking && selectedBooking.id === id) {
            setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
    } catch (error) {
        alert('Lỗi cập nhật trạng thái: ' + error.message);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'ALL' || b.status === filter;
    const customerName = `${b.first_name} ${b.last_name}`.toLowerCase();
    const matchesSearch = customerName.includes(search.toLowerCase()) || 
                          b.email?.toLowerCase().includes(search.toLowerCase()) ||
                          b.id.toString().includes(search);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return { color: '#f59e0b', bg: '#fef3c7' };
      case 'CONFIRMED': return { color: '#0ea5e9', bg: '#e0f2fe' };
      case 'CANCELLED': return { color: '#ef4444', bg: '#fee2e2' };
      case 'COMPLETED': return { color: '#10b981', bg: '#dcfce7' };
      default: return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ duyệt';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'CANCELLED': return 'Đã hủy';
      case 'COMPLETED': return 'Hoàn tất';
      default: return status;
    }
  };

  const formatDate = (dateStr) => {
      if (!dateStr) return 'n/a';
      return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý đặt phòng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Theo dõi và xử lý toàn bộ các đơn đặt phòng từ khách hàng.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Tìm theo tên khách, email hoặc mã..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '300px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
          />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="COMPLETED">Hoàn tất</option>
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Mã đơn</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Khách hàng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Thời gian</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Tổng tiền</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', fontWeight: '700', color: '#0ea5e9' }}>#{b.id}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '600' }}>{b.first_name} {b.last_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{b.phone}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500' }}>{b.room_number}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{b.room_type_name}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                    {formatDate(b.checkin_date)} - {formatDate(b.checkout_date)}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: '700' }}>{Number(b.total_amount).toLocaleString()}đ</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    color: getStatusColor(b.status).color, 
                    backgroundColor: getStatusColor(b.status).bg,
                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                  }}>
                    {getStatusLabel(b.status)}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => setSelectedBooking(b)} style={{ border: '1px solid #ddd', background: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Xem</button>
                    {b.status === 'PENDING' && (
                      <button onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')} style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Duyệt</button>
                    )}
                    {b.status === 'CONFIRMED' && (
                        <button onClick={() => handleStatusUpdate(b.id, 'COMPLETED')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Trả phòng</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '550px', borderRadius: '16px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Chi tiết đặt phòng #{selectedBooking.id}</h3>
              <button onClick={() => setSelectedBooking(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                    <label style={{ fontSize: '12px', color: '#64748b' }}>KHÁCH HÀNG</label>
                    <div style={{ fontWeight: '600' }}>{selectedBooking.first_name} {selectedBooking.last_name}</div>
                    <div>{selectedBooking.email}</div>
                    <div>{selectedBooking.phone}</div>
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: '#64748b' }}>TRẠNG THÁI</label>
                    <div>{getStatusLabel(selectedBooking.status)}</div>
                    <div style={{ fontWeight: '700', color: '#0ea5e9', fontSize: '18px', marginTop: '8px' }}>
                        {Number(selectedBooking.total_amount).toLocaleString()}đ
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Phòng:</span>
                    <span style={{ fontWeight: '600' }}>{selectedBooking.room_number} ({selectedBooking.room_type_name})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Nhận phòng:</span>
                    <span style={{ fontWeight: '600' }}>{formatDate(selectedBooking.checkin_date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Trả phòng:</span>
                    <span style={{ fontWeight: '600' }}>{formatDate(selectedBooking.checkout_date)}</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'COMPLETED' && (
                  <button onClick={() => handleStatusUpdate(selectedBooking.id, 'CANCELLED')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}>Hủy đơn</button>
              )}
              <button onClick={() => setSelectedBooking(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
