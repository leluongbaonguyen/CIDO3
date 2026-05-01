import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '0901 234 567',
    birthday: '1995-10-20',
    gender: 'Nam',
    address: 'Sơn Trà, Đà Nẵng',
    idCard: '048095001234'
  });

  useEffect(() => {
    if (!user) navigate('/login');
    window.scrollTo(0, 0);
  }, [user, navigate]);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
          
          {/* USER SIDEBAR */}
          <aside style={{ height: 'fit-content' }}>
             <div className="card-luxury" style={{ padding: '40px 30px', textAlign: 'center' }}>
                <div style={{ 
                   width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gold)', 
                   margin: '0 auto 20px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                   fontSize: '32px', color: '#fff', fontWeight: '800', boxShadow: '0 10px 20px rgba(196,166,97,0.3)'
                }}>
                   {user?.first_name?.[0] || 'U'}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '5px' }}>{user?.first_name} {user?.last_name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }}>{user?.email}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <MenuButton icon="far fa-user-circle" label="Thông tin cá nhân" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                   <Link to="/my-bookings" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '600' }}>
                      <i className="fas fa-calendar-check"></i> Đơn đặt phòng
                   </Link>
                   <MenuButton icon="fas fa-shield-alt" label="Bảo mật tài khoản" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                </div>
             </div>
          </aside>

          {/* MAIN CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
             {activeTab === 'info' && (
                <div className="card-luxury" style={{ padding: '40px' }}>
                   <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)', marginBottom: '35px' }}>Chi tiết hồ sơ</h2>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                      <LuxuryInput label="Họ" value={profileData.lastName} />
                      <LuxuryInput label="Tên" value={profileData.firstName} />
                      <LuxuryInput label="Email" value={profileData.email} disabled />
                      <LuxuryInput label="Số điện thoại" value={profileData.phone} />
                      <LuxuryInput label="Ngày sinh" type="date" value={profileData.birthday} />
                      <LuxuryInput label="Giới tính" type="select" options={['Nam', 'Nữ', 'Khác']} value={profileData.gender} />
                      <LuxuryInput label="Số CCCD/CMND" value={profileData.idCard} />
                      <LuxuryInput label="Địa chỉ" value={profileData.address} span="2" />
                   </div>
                   <button className="btn-gold" style={{ marginTop: '40px', width: '250px', padding: '18px' }}>LƯU THAY ĐỔI</button>
                </div>
             )}

             {activeTab === 'security' && (
                <div className="card-luxury" style={{ padding: '40px' }}>
                   <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)', marginBottom: '35px' }}>Đổi mật khẩu</h2>
                   <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <LuxuryInput label="Mật khẩu hiện tại" type="password" />
                      <LuxuryInput label="Mật khẩu mới" type="password" />
                      <LuxuryInput label="Xác nhận mật khẩu mới" type="password" />
                      <button className="btn-gold" style={{ marginTop: '20px', width: '250px', padding: '18px' }}>CẬP NHẬT MẬT KHẨU</button>
                   </div>
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderRadius: '12px', 
      cursor: 'pointer', transition: '0.3s',
      background: active ? 'var(--primary)' : 'transparent', color: active ? '#fff' : 'var(--text-muted)',
      fontWeight: active ? '700' : '600',
      boxShadow: active ? '0 10px 20px rgba(15,23,42,0.1)' : 'none'
    }}>
       <i className={icon} style={{ width: '20px' }}></i>
       <span>{label}</span>
    </div>
  );
}

function LuxuryInput({ label, value, type = "text", options, span = "1", disabled }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
       <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
       {type === 'select' ? (
         <select style={inputStyle}>{options.map(opt => <option key={opt}>{opt}</option>)}</select>
       ) : (
         <input type={type} defaultValue={value} disabled={disabled} style={{ ...inputStyle, background: disabled ? '#f8fafc' : '#fff' }} />
       )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '15px 20px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontSize: '15px', outline: 'none', transition: '0.3s', fontWeight: '600', color: 'var(--primary)'
};
