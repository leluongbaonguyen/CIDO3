import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  address: '',
  city: '',
  country: 'Việt Nam',
  idNumber: ''
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock registration
      const data = {
        token: 'mock-token-reg',
        user: { ...form, role: 'CUSTOMER' }
      };
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '48px', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '700px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '12px' }}>Tham gia XTRAVEL</h2>
          <p style={{ color: 'var(--text-muted)' }}>Đăng ký để nhận những ưu đãi đặc biệt và quản lý kỳ nghỉ của bạn</p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '14px' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Họ</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Tên</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Số điện thoại</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Mật khẩu</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Số CMND/CCCD</label>
              <input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Địa chỉ</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Thành phố</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>Quốc gia</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: 'var(--secondary)', color: '#fff', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '12px', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = 'var(--secondary-hover)'} onMouseLeave={e => e.target.style.backgroundColor = 'var(--secondary)'}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Đăng nhập ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
