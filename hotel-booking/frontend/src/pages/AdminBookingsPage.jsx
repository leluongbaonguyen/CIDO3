import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const load = async () => setBookings(await api('/admin/bookings'));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    load();
  };

  const filteredBookings = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Danh sách Đặt phòng</h2>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="search-input"
            style={{ padding: '10px 16px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn tất</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <input
            type="text"
            placeholder="Tìm theo CCCD, tên khách..."
            className="search-input"
            style={{ width: '250px', padding: '10px 16px' }}
          />
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
              <th style={{ padding: '16px', fontWeight: '600' }}>Mã Đặt (#ID)</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Khách hàng</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Loại & Số phòng</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Lịch trình</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Tổng tiền</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Trạng thái</th>
              <th style={{ padding: '16px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy đơn đặt phòng nào.</td></tr>
            ) : filteredBookings.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', fontWeight: '600' }}>#{item.id}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '600' }}>{item.first_name} {item.last_name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.email}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '500' }}>{item.room_type_name || 'Phòng'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Phòng: {item.room_number || '-'}</div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  IN: <span style={{ fontWeight: '500' }}>{new Date(item.checkin_date).toLocaleDateString('vi-VN')}</span>
                  <br />
                  OUT: <span style={{ fontWeight: '500' }}>{new Date(item.checkout_date).toLocaleDateString('vi-VN')}</span>
                </td>
                <td style={{ padding: '16px', fontWeight: '600', color: 'var(--secondary)' }}>
                  {Number(item.total_amount).toLocaleString('vi-VN')} đ
                </td>
                <td style={{ padding: '16px' }}>
                  {item.status === 'PENDING' && <span className="badge badge-orange">Chờ xử lý</span>}
                  {item.status === 'CONFIRMED' && <span className="badge badge-blue">Đã xác nhận</span>}
                  {item.status === 'COMPLETED' && <span className="badge badge-green">Hoàn tất</span>}
                  {item.status === 'CANCELLED' && <span className="badge" style={{ background: 'rgba(210, 18, 46, 0.1)', color: 'var(--danger)' }}>Đã hủy</span>}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  {item.status === 'PENDING' && (
                    <>
                      <button className="btn outline" onClick={() => updateStatus(item.id, 'CONFIRMED')} style={{ padding: '6px 12px', fontSize: '13px', marginRight: '8px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>Duyệt</button>
                      <button className="btn danger" onClick={() => updateStatus(item.id, 'CANCELLED')} style={{ padding: '6px 12px', fontSize: '13px' }}>Hủy</button>
                    </>
                  )}
                  {item.status === 'CONFIRMED' && (
                    <button className="btn" onClick={() => updateStatus(item.id, 'COMPLETED')} style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--success)' }}>Hoàn tất</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
