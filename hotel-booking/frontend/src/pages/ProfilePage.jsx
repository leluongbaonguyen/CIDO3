import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [form, setForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/users/me').then((data) => {
      setForm({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'Việt Nam',
        idNumber: data.id_number || '',
        email: data.email || '',
        status: data.status || 'Hoạt động'
      });
    });
  }, []);

  if (!form) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải dữ liệu...</div>;

  const onUpdateInfo = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api('/users/me', {
        method: 'PUT',
        body: JSON.stringify(form)
      });
      setMessage('Cập nhật thông tin thành công!');
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật');
    }
  };

  const onChangePassword = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (passwordForm.new !== passwordForm.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    // Stub for password change api
    setMessage('Đổi mật khẩu thành công!');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="admin-layout" style={{ marginTop: '40px' }}>
      <div className="sidebar card">
        <h3 style={{ padding: '0 16px', marginBottom: '8px', color: 'var(--primary)' }}>
          Xin chào, {form.lastName}
        </h3>
        <p style={{ padding: '0 16px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
          Trạng thái: <span className="badge badge-green">{form.status}</span>
        </p>

        <a href="#!" className={activeTab === 'info' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('info'); }}>
          <span style={{ marginRight: '8px' }}>👤</span> Thông tin cá nhân
        </a>
        <a href="#!" className={activeTab === 'security' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('security'); }}>
          <span style={{ marginRight: '8px' }}>🔒</span> Đổi mật khẩu
        </a>
        <Link to="/my-bookings">
          <span style={{ marginRight: '8px' }}>📅</span> Đơn đặt phòng
        </Link>
        <a href="#!" onClick={(e) => { e.preventDefault(); }}>
          <span style={{ marginRight: '8px' }}>⭐</span> Đánh giá của tôi
        </a>
        <a href="#!" onClick={(e) => { e.preventDefault(); logout(); }} style={{ color: 'var(--danger)', marginTop: '20px' }}>
          <span style={{ marginRight: '8px' }}>🚪</span> Đăng xuất
        </a>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {message && <div className="success" style={{ padding: '12px', background: 'rgba(3, 162, 83, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
        {error && <div className="error" style={{ padding: '12px', background: 'rgba(210, 18, 46, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

        {activeTab === 'info' && (
          <form className="form" onSubmit={onUpdateInfo}>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Chỉnh sửa thông tin cá nhân</h2>

            <div className="grid2">
              <div className="input-group">
                <label className="input-label">Họ</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Tên</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>

            <div className="grid2">
              <div className="input-group">
                <label className="input-label">Email</label>
                <input value={form.email} disabled style={{ backgroundColor: 'var(--bg-main)', cursor: 'not-allowed' }} />
              </div>
              <div className="input-group">
                <label className="input-label">Số điện thoại</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Địa chỉ</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>

            <div className="grid2">
              <div className="input-group">
                <label className="input-label">Thành phố</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Quốc gia</label>
                <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="search-input">
                  <option value="Việt Nam">Việt Nam</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Số CMND/CCCD</label>
              <input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} required />
            </div>

            <button className="btn" type="submit" style={{ marginTop: '16px', alignSelf: 'flex-start' }}>Lưu thay đổi</button>
          </form>
        )}

        {activeTab === 'security' && (
          <form className="form" onSubmit={onChangePassword}>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Đổi mật khẩu bảo mật</h2>

            <div className="input-group" style={{ maxWidth: '400px' }}>
              <label className="input-label">Mật khẩu hiện tại</label>
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} required />
            </div>

            <div className="input-group" style={{ maxWidth: '400px' }}>
              <label className="input-label">Mật khẩu mới</label>
              <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} required />
            </div>

            <div className="input-group" style={{ maxWidth: '400px' }}>
              <label className="input-label">Xác nhận mật khẩu mới</label>
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
            </div>

            <button className="btn" type="submit" style={{ marginTop: '16px', alignSelf: 'flex-start' }}>Đổi mật khẩu</button>
          </form>
        )}
      </div>
    </div>
  );
}
