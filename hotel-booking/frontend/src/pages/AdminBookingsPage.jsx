import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const load = async () => {
    const data = await api('/admin/bookings');
    setBookings(data);
  };

  useEffect(() => { load(); }, []);

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'ALL' || b.status === filter;
    const matchesSearch = b.customerName?.toLowerCase().includes(search.toLowerCase()) || 
                          b.bookingCode?.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    // api(`/admin/bookings/${bookingId}`, 'PUT', { status: newStatus });
  };

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

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý đặt phòng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Theo dõi, duyệt và quản lý tất cả các đơn đặt phòng của hệ thống.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        {/* Filters Area */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Tìm khách hàng hoặc mã đơn..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} 
            />
          </div>

          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', backgroundColor: '#fff', minWidth: '150px' }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="COMPLETED">Hoàn tất</option>
          </select>
        </div>

        {/* Table Area */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Mã đặt phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Khách hàng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Loại Phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Ngày nhận</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Ngày trả</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Tổng tiền</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0ea5e9' }}>{b.bookingCode || `BK00${b.id}`}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{b.customerName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{b.customerPhone || '0987...'}</div>
                </td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{b.roomType || 'Phòng Đôi'}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{b.checkInDate || '20/05/2026'}</td>
                <td style={{ padding: '16px 24px', color: '#475569' }}>{b.checkOutDate || '22/05/2026'}</td>
                <td style={{ padding: '16px 24px', fontWeight: '700', color: '#1e293b' }}>
                  {(b.totalAmount || 2500000).toLocaleString()} ₫
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    color: getStatusColor(b.status).color, 
                    backgroundColor: getStatusColor(b.status).bg,
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '600'
                  }}>
                    {getStatusLabel(b.status)}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => setSelectedBooking(b)}
                      style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >Xem</button>
                    {b.status === 'PENDING' && (
                      <button 
                        onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                        style={{ border: 'none', background: '#0ea5e9', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >Xác nhận</button>
                    )}
                    {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                      <button 
                        onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                        style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >Hủy</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination placeholder */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>Hiển thị 1 - {filteredBookings.length} của {bookings.length} đơn hàng</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>Trước</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>1</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>2</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>Sau</button>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '600px', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Chi tiết đơn đặt phòng</h3>
              <button onClick={() => setSelectedBooking(null)} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Thông tin khách hàng</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{selectedBooking.customerName}</div>
                <div style={{ fontSize: '14px', color: '#475569' }}>Email: {selectedBooking.customerEmail || 'n/a'}</div>
                <div style={{ fontSize: '14px', color: '#475569' }}>SĐT: {selectedBooking.customerPhone || 'n/a'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Trạng thái thanh toán</div>
                <div style={{ color: '#10b981', fontWeight: '600', fontSize: '15px' }}>Đã thanh toán (VNPay)</div>
                <div style={{ fontSize: '14px', color: '#475569' }}>Mã giao dịch: 9928374</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b' }}>Loại phòng:</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedBooking.roomType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b' }}>Thời gian:</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedBooking.checkInDate} - {selectedBooking.checkOutDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>Tổng cộng:</span>
                <span style={{ fontWeight: '800', color: '#0ea5e9', fontSize: '18px' }}>{selectedBooking.totalAmount?.toLocaleString()} ₫</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedBooking(null)} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0ea5e9', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
