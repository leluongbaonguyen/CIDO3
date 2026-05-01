import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

// DỮ LIỆU CỨNG TÀI KHOẢN (MẬT KHẨU: password123)
const HARDCODED_USERS = {
  'admin': { email: 'admin@xtravel.com', first_name: 'Bảo Nguyên', role: 'ADMIN', label: 'Quản trị viên' },
  'staff': { email: 'staff1@xtravel.com', first_name: 'Thị Tuyết', role: 'EMPLOYEE', label: 'Nhân viên' },
  'customer': { email: 'customer@gmail.com', first_name: 'Thành Công', role: 'CUSTOMER', label: 'Khách hàng' }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // HÀM ĐĂNG NHẬP NHANH (1-CLICK)
  const quickLogin = async (roleKey) => {
    console.log('Starting quickLogin for:', roleKey);
    setLoading(true);
    setError('');
    const userData = HARDCODED_USERS[roleKey];
    
    try {
        console.log('Calling API for:', userData.email);
        alert('Đang thử đăng nhập với: ' + userData.email + ' / password123');
        const data = await api('/auth/login', {
            method: 'POST',
            body: {
                email: userData.email,
                password: 'password123'
            }
        });
        
        console.log('Login successful, data:', data);
        login(data);
        if (data.user.role === 'ADMIN' || data.user.role === 'EMPLOYEE') {
            navigate('/admin');
        } else {
            navigate('/');
        }
    } catch (err) {
        console.error('Quick login error:', err);
        setError('Lỗi đăng nhập nhanh: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: form
        });
        login(data);
        if (data.user.role === 'ADMIN' || data.user.role === 'EMPLOYEE') {
            navigate('/admin');
        } else {
            navigate('/');
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80")',
      backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
      padding: '40px 20px'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.6) 100%)' }}></div>

      <div className="glass-effect" style={{ 
        padding: '50px', borderRadius: '32px', width: '100%', maxWidth: '550px', 
        position: 'relative', zIndex: 10, animation: 'fadeInUp 0.8s ease-out' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '70px', height: '70px', background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)', 
            borderRadius: '20px', display: 'flex', justifyContent: 'center', 
            alignItems: 'center', margin: '0 auto 24px', boxShadow: '0 15px 30px rgba(196,166,97,0.3)' 
          }}>
             <i className="fas fa-crown" style={{ color: '#fff', fontSize: '32px' }}></i>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '12px', letterSpacing: '-1px' }} className="serif">TRUY CẬP HỆ THỐNG</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '500', fontSize: '15px' }}>Trải nghiệm dịch vụ nghỉ dưỡng thượng lưu tại XTRAVEL</p>
        </div>

        {error && (
          <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#ef4444', marginBottom: '25px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i> {error}
          </div>
        )}

        {/* QUICK LOGIN BUTTONS (NEW FEATURE) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '40px' }}>
           <QuickLoginBtn 
             icon="fa-user-shield" label="ADMIN" color="#ef4444" 
             onClick={() => quickLogin('admin')} 
             disabled={loading}
           />
           <QuickLoginBtn 
             icon="fa-user-tie" label="STAFF" color="#3b82f6" 
             onClick={() => quickLogin('staff')} 
             disabled={loading}
           />
           <QuickLoginBtn 
             icon="fa-user" label="GUEST" color="#10b981" 
             onClick={() => quickLogin('customer')} 
             disabled={loading}
           />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
           <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
           <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>HOẶC DÙNG TÀI KHOẢN</span>
           <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label className="luxury-label">Email tài khoản</label>
            <input
              type="email" placeholder="example@xtravel.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="luxury-input"
              required
            />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label className="luxury-label">Mật khẩu bảo mật</label>
            <input
              type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="luxury-input"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP NGAY'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
           <Link to="/register" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px' }}>
             Chưa có tài khoản? <span style={{ color: '#ff5a3d', fontWeight: '700' }}>Đăng ký ngay</span>
           </Link>
        </div>
      </div>
    </div>
  );
}

function QuickLoginBtn({ icon, label, color, onClick, disabled }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        padding: '20px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s', color: '#fff'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${color}20`, color: color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>{label}</span>
    </button>
  );
}
