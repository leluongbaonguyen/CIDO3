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
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <form className="card form" onSubmit={onSubmit} style={{ maxWidth: '600px', width: '100%', padding: '32px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-dark)' }}>Đăng ký Tài khoản</h2>

        {error && <p className="error" style={{ padding: '12px', background: 'rgba(210, 18, 46, 0.1)', borderRadius: '8px' }}>{error}</p>}

        <div className="grid2">
          <div className="input-group">
            <label className="input-label">Họ</label>
            <input placeholder="VD: Nguyễn" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">Tên</label>
            <input placeholder="VD: Văn A" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
        </div>

        <div className="grid2">
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" placeholder="email@address.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">Số điện thoại</label>
            <input placeholder="Nhập số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Mật khẩu</label>
          <input type="password" placeholder="Mật khẩu bảo mật" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>

        <div className="input-group">
          <label className="input-label">Địa chỉ</label>
          <input placeholder="Địa chỉ thường trú" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        </div>

        <div className="grid2">
          <div className="input-group">
            <label className="input-label">Thành phố</label>
            <input placeholder="VD: TP Hồ Chí Minh" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div className="input-group">
            <label className="input-label">Quốc gia</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="search-input">
              <option value="Việt Nam">Việt Nam</option>
              <option value="Thái Lan">Thái Lan</option>
              <option value="Singapore">Singapore</option>
              <option value="Malaysia">Malaysia</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Số CMND/CCCD</label>
          <input placeholder="Nhập số giấy tờ tùy thân" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} required />
        </div>

        <button className="btn" type="submit" disabled={loading} style={{ marginTop: '20px', fontSize: '16px', padding: '14px' }}>
          {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          Đã có tài khoản? <Link to="/login" style={{ fontWeight: '600' }}>Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
