import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [form, setForm] = useState(null);

  useEffect(() => {
    api('/users/me').then((data) => {
      setForm({
        email: data.email || '',
        address: data.address || '',
        phone: data.phone || '',
        city: data.city || '',
        status: data.status || 'Hoạt động',
        country: data.country || 'Việt Nam',
        idNumber: data.id_number || ''
      });
    });
  }, []);

  if (!form) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải dữ liệu...</div>;

  return (
    <div className="container">
      <div className="profile-layout">
        <div>
          <div className="profile-greeting">
            Xin chào, {user?.first_name || 'Khách hàng'}
          </div>
          <div className="profile-sidebar">
            <div className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
              <i className="far fa-user" style={{width:'20px'}}></i> Thông tin cá nhân
            </div>
            <div className={`profile-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              <i className="far fa-calendar-alt" style={{width:'20px'}}></i> Đơn đặt phòng
            </div>
            <div className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <i className="fas fa-key" style={{width:'20px'}}></i> Đổi mật khẩu
            </div>
            <div className={`profile-nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              <i className="far fa-star" style={{width:'20px'}}></i> Đánh giá của tôi
            </div>
          </div>
        </div>

        <div>
          {activeTab === 'info' && (
            <>
              <div className="profile-avatar-large">
                <div className="profile-avatar-circle">
                  <i className="far fa-user"></i>
                </div>
              </div>
              <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Email</label>
                  <input value={form.email} readOnly style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Địa chỉ</label>
                  <input value={form.address} readOnly style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Số điện thoại</label>
                  <input value={form.phone} readOnly style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Thành phố</label>
                  <input value={form.city} readOnly style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Trạng thái</label>
                  <input value={form.status} readOnly style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--success)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Quốc gia</label>
                  <input value={form.country} readOnly style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Số CMNN/CCCD</label>
                  <input value={form.idNumber} readOnly style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} />
                </div>
              </form>
            </>
          )}

          {activeTab === 'bookings' && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <i className="far fa-calendar-check" style={{ fontSize: '80px', color: '#1f2937', marginBottom: '20px' }}></i>
              <p style={{ fontSize: '15px', color: '#1f2937' }}>Hiện tại chưa có đơn đặt phòng nào</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <i className="fas fa-key" style={{ fontSize: '60px', color: '#1f2937', marginBottom: '40px' }}></i>
              <form style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Mật khẩu hiện tại</label>
                  <input style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} type="password" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Mật khẩu mới</label>
                  <input style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} type="password" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Xác nhận mật khẩu mới</label>
                  <input style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }} type="password" />
                </div>
                <button type="button" className="btn" style={{ margin: '30px auto 0', width: '200px', backgroundColor: 'var(--secondary)' }}>
                  Đổi mật khẩu
                </button>
              </form>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{textAlign:'center', marginTop: '40px'}}>Chưa có đánh giá nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
