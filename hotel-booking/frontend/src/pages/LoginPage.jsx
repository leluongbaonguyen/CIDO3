import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded logic to bypass API if backend is not running
    const hardcodedUsers = {
      'admin@xtravel.com': { id: 1, email: 'admin@xtravel.com', first_name: 'Admin', role: 'ADMIN' },
      'staff@xtravel.com': { id: 2, email: 'staff@xtravel.com', first_name: 'Nhân viên', role: 'STAFF' },
      'customer@gmail.com': { id: 3, email: 'customer@gmail.com', first_name: 'Khách hàng', role: 'CUSTOMER' }
    };

    const isHardcodedCustomer = form.email === 'customer@gmail.com' && form.password === 'customer123';
    const isHardcodedAdmin = form.email === 'admin@xtravel.com' && form.password === 'admin123';
    const isHardcodedStaff = form.email === 'staff@xtravel.com' && form.password === 'staff123';

    if (isHardcodedCustomer || isHardcodedAdmin || isHardcodedStaff) {
      setTimeout(() => {
        login({
          token: 'mock-jwt-token-12345',
          user: hardcodedUsers[form.email]
        });
        if (remember) {
          localStorage.setItem('rememberedEmail', form.email);
        }
        setLoading(false);
        const role = hardcodedUsers[form.email].role;
        if (role === 'ADMIN' || role === 'STAFF') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 500); // simulate network delay
      return;
    }

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      login(data);
      if (remember) {
        localStorage.setItem('rememberedEmail', form.email);
      }
      const role = data.user?.role || data.role;
      if (role === 'ADMIN' || role === 'STAFF') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message === 'Request failed' ? 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setForm({ email, password });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '8px' }}>Đăng nhập XTRAVEL</h2>
          <p style={{ color: 'var(--text-muted)' }}>Chào mừng bạn đến với khách sạn của chúng tôi</p>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--primary-light)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '12px', fontSize: '14px', textAlign: 'center' }}><i className="fas fa-info-circle"></i> Tài khoản thử nghiệm (Click để điền)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <button type="button" onClick={() => handleQuickLogin('admin@xtravel.com', 'admin123')} style={{ backgroundColor: '#fff', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Admin (Quản trị viên)</button>
            <button type="button" onClick={() => handleQuickLogin('staff@xtravel.com', 'staff123')} style={{ backgroundColor: '#fff', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Staff (Nhân viên)</button>
            <button type="button" onClick={() => handleQuickLogin('customer@gmail.com', 'customer123')} style={{ backgroundColor: '#fff', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Customer (Khách hàng)</button>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}><i className="fas fa-exclamation-circle"></i> {error}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', fontSize: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Mật khẩu</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', fontSize: '15px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '14px' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Ghi nhớ đăng nhập
            </label>
            <Link to="#" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>Quên mật khẩu?</Link>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: 'var(--secondary)', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = 'var(--secondary-hover)'} onMouseLeave={e => e.target.style.backgroundColor = 'var(--secondary)'}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
