import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api('/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '450px', width: '100%', background: '#fff', borderRadius: '24px', padding: '50px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>Quên mật khẩu?</h2>
            <p style={{ color: '#64748b', marginTop: '10px' }}>Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
        </div>

        {message ? (
            <div style={{ padding: '20px', background: '#dcfce7', color: '#166534', borderRadius: '12px', textAlign: 'center', fontWeight: '600' }}>
                <i className="fas fa-check-circle" style={{ marginBottom: '10px', fontSize: '24px', display: 'block' }}></i>
                {message}
                <Link to="/login" style={{ display: 'block', marginTop: '20px', color: '#166534', textDecoration: 'underline' }}>Quay lại đăng nhập</Link>
            </div>
        ) : (
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#475569', marginBottom: '10px', textTransform: 'uppercase' }}>Email đăng ký</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #f1f5f9', fontSize: '15px', outline: 'none' }}
                    />
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '20px', fontWeight: '600' }}>{error}</p>}

                <button 
                    disabled={loading}
                    style={{ width: '100%', padding: '18px', borderRadius: '50px', background: '#0070f3', color: '#fff', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(0,112,243,0.2)' }}
                >
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Link to="/login" style={{ color: '#64748b', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
                        <i className="fas fa-arrow-left"></i> Quay lại đăng nhập
                    </Link>
                </div>
            </form>
        )}
      </div>
    </div>
  );
}
