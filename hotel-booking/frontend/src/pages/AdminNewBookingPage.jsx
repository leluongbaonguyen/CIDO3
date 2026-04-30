import { useState } from 'react';

export default function AdminNewBookingPage() {
  const [formData, setFormData] = useState({
    customerId: '',
    checkIn: '',
    checkOut: '',
    room: '',
    guests: 1,
    discountCode: '',
    notes: ''
  });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Thêm đơn đặt phòng mới</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Dành cho khách đặt trực tiếp hoặc gọi điện qua hotline.</p>
        </div>
        <button style={{ backgroundColor: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-user-plus"></i> Khách hàng mới
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', maxWidth: '900px', margin: '0 auto' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Lookup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Tìm kiếm khách hàng (Email / SĐT / CCCD)</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input type="text" placeholder="Nhập thông tin khách hàng..." style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Ngày nhận phòng (Check-in)</label>
              <input type="date" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Ngày trả phòng (Check-out)</label>
              <input type="date" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Chọn phòng trống</label>
              <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#fff' }}>
                <option>101 - Suite (Standard)</option>
                <option>102 - Deluxe (Available)</option>
                <option>201 - VIP (Available)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Số lượng khách</label>
              <input type="number" defaultValue={1} min={1} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Giá phòng / đêm</label>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: '700', color: '#1e293b' }}>1.200.000 ₫</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Tổng số tiền (Tạm tính)</label>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9', fontWeight: '800', color: '#0369a1', fontSize: '18px' }}>2.400.000 ₫</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Yêu cầu đặc biệt</label>
            <textarea placeholder="Ghi chú về dịch vụ, ăn uống, đưa đón..." rows={4} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" style={{ padding: '12px 32px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Hủy bỏ</button>
            <button type="button" style={{ padding: '12px 48px', borderRadius: '8px', border: 'none', backgroundColor: '#0ea5e9', color: '#fff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(14 165 233 / 0.3)' }}>Xác nhận đặt phòng</button>
          </div>
        </form>
      </div>
    </div>
  );
}
