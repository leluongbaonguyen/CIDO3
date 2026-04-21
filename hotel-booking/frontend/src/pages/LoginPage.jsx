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
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      login(data);
      if (remember) {
        localStorage.setItem('rememberedEmail', form.email);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
      <form className="card form" onSubmit={onSubmit} style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text-dark)' }}>Đăng nhập</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
          Vui lòng nhập thông tin đăng nhập của bạn
        </p>

        {error && <p className="error" style={{ padding: '12px', background: 'rgba(210, 18, 46, 0.1)', borderRadius: '8px' }}>{error}</p>}

        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            placeholder="Ví dụ: email@adddress.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Ghi nhớ đăng nhập
          </label>
          <Link to="#" style={{ fontWeight: '600' }}>Quên mật khẩu?</Link>
        </div>

        <button className="btn" type="submit" disabled={loading} style={{ marginTop: '16px', fontSize: '16px', padding: '14px' }}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '12px', color: 'var(--text-muted)' }}>hoặc</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
        </div>

        <button type="button" className="btn outline" style={{ width: '100%', fontWeight: '600' }}>
          Đăng nhập bằng Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          Chưa có tài khoản? <Link to="/register" style={{ fontWeight: '600' }}>Đăng ký</Link>
        </p>
      </form>
    </div>
  );
}
