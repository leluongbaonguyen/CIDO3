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
    setError('');
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: {
          fullName: `${form.lastName} ${form.firstName}`.trim(),
          email: form.email,
          phone: form.phone,
          password: form.password,
          address: [form.address, form.city, form.country].filter(Boolean).join(', '),
          identityNumber: form.idNumber
        }
      });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      backgroundImage: 'url("/images/img_5546ffb0c3.jpg")',
      backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
      padding: '40px 20px'
    }}>
      {/* Dark Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.7) 100%)' }}></div>

      <div className="glass-effect" style={{ 
        padding: '60px', borderRadius: '32px', width: '100%', maxWidth: '850px', 
        position: 'relative', zIndex: 10, animation: 'fadeInUp 0.8s ease-out' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ 
            width: '70px', height: '70px', background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)', 
            borderRadius: '20px', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', margin: '0 auto 24px', boxShadow: '0 15px 30px rgba(196,166,97,0.3)' 
          }}>
             <i className="fas fa-crown" style={{ color: '#fff', fontSize: '32px' }}></i>
          </div>
          <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#fff', marginBottom: '12px', letterSpacing: '-1px' }} className="serif">KHỞI ĐẦU KỲ NGHỈ TRONG MƠ</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '500', fontSize: '16px' }}>Trở thành thành viên BOOKING X để nhận đặc quyền thượng lưu</p>
        </div>

        <form onSubmit={onSubmit}>
          {error && (
            <div style={{ 
              padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', 
              color: '#fca5a5', borderRadius: '12px', marginBottom: '32px', fontSize: '14px', textAlign: 'center' 
            }}>
              <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <InputGroup label="Họ" value={form.lastName} onChange={v => setForm({...form, lastName: v})} placeholder="Nguyễn" />
                  <InputGroup label="Tên" value={form.firstName} onChange={v => setForm({...form, firstName: v})} placeholder="Văn A" />
               </div>
               <InputGroup label="Email liên hệ" type="email" value={form.email} onChange={v => setForm({...form, email: v})} placeholder="example@BOOKING X.com" />
               <InputGroup label="Mật khẩu bảo mật" type="password" value={form.password} onChange={v => setForm({...form, password: v})} placeholder="••••••••" />
               <InputGroup label="Số điện thoại" value={form.phone} onChange={v => setForm({...form, phone: v})} placeholder="0901 234 567" />
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <InputGroup label="Địa chỉ hiện tại" value={form.address} onChange={v => setForm({...form, address: v})} placeholder="Số 1, đường ABC..." />
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <InputGroup label="Thành phố" value={form.city} onChange={v => setForm({...form, city: v})} placeholder="Đà Nẵng" />
                  <InputGroup label="Quốc gia" value={form.country} onChange={v => setForm({...form, country: v})} placeholder="Việt Nam" />
               </div>
               <InputGroup label="Số CMND / CCCD" value={form.idNumber} onChange={v => setForm({...form, idNumber: v})} placeholder="0480 9900..." />
               
               <div style={{ marginTop: 'auto' }}>
                  <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%', padding: '18px', fontSize: '16px', letterSpacing: '1px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'ĐANG KHỞI TẠO...' : 'XÁC NHẬN ĐĂNG KÝ'}
                  </button>
               </div>
            </div>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          Bạn đã có tài khoản thành viên? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>Đăng nhập tại đây</Link>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="luxury-label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="luxury-input"
      />
    </div>
  );
}
