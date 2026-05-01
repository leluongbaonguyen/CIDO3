import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { getMyBookings } from '../api/bookingApi';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    idNumber: ''
  });

  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await api('/auth/profile');
            setProfileData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.customerDetails?.address || '',
                city: data.customerDetails?.city || '',
                country: data.customerDetails?.country || '',
                idNumber: data.customerDetails?.idNumber || ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'bookings') {
        fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
        setBookingLoading(true);
        const data = await getMyBookings();
        setBookings(data);
    } catch (err) {
        console.error('Fetch bookings error:', err);
    } finally {
        setBookingLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    alert('Tính năng cập nhật hồ sơ đang được bảo trì.');
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="loader"></div></div>;

  return (
    <div style={{ backgroundColor: '#f5f7f9', minHeight: '100vh', paddingTop: '140px', paddingBottom: '100px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px' }}>
          
          {/* USER SIDEBAR */}
          <aside>
             <div className="card-luxury" style={{ padding: '40px 30px', textAlign: 'center', position: 'sticky', top: '140px' }}>
                <div style={{ 
                   width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold) 0%, #c4a661 100%)', 
                   margin: '0 auto 25px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                   fontSize: '40px', color: '#fff', fontWeight: '900', boxShadow: '0 15px 35px rgba(196,166,97,0.4)'
                }}>
                   {profileData.firstName?.[0] || 'U'}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>{profileData.firstName} {profileData.lastName}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '35px', fontWeight: '600' }}>{profileData.email}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <MenuButton icon="far fa-user-circle" label="Thông tin cá nhân" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                   <MenuButton icon="fas fa-calendar-check" label="Đơn đặt phòng" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                   <MenuButton icon="fas fa-shield-alt" label="Bảo mật tài khoản" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                   <div style={{ height: '1px', background: '#f1f5f9', margin: '15px 0' }}></div>
                   <MenuButton icon="fas fa-sign-out-alt" label="Đăng xuất" onClick={logout} color="#ef4444" />
                </div>
             </div>
          </aside>

          {/* MAIN CONTENT */}
          <main style={{ minHeight: '600px' }}>
             {activeTab === 'info' && (
                <div className="card-luxury animate-fade-in" style={{ padding: '50px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                      <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px' }}>Chi tiết hồ sơ</h2>
                      <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '50px', fontWeight: '800' }}>
                         TÀI KHOẢN ĐÃ XÁC MINH
                      </span>
                   </div>
                   <form onSubmit={handleUpdateProfile}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                         <LuxuryInput label="Họ & Tên lót" value={profileData.lastName} onChange={(v) => setProfileData({...profileData, lastName: v})} />
                         <LuxuryInput label="Tên" value={profileData.firstName} onChange={(v) => setProfileData({...profileData, firstName: v})} />
                         <LuxuryInput label="Địa chỉ Email" value={profileData.email} disabled />
                         <LuxuryInput label="Số điện thoại" value={profileData.phone} onChange={(v) => setProfileData({...profileData, phone: v})} />
                         <LuxuryInput label="Số CMND / CCCD" value={profileData.idNumber} onChange={(v) => setProfileData({...profileData, idNumber: v})} />
                         <LuxuryInput label="Quốc gia" value={profileData.country} onChange={(v) => setProfileData({...profileData, country: v})} />
                         <LuxuryInput label="Địa chỉ hiện tại" value={profileData.address} span="2" onChange={(v) => setProfileData({...profileData, address: v})} />
                      </div>
                      <div style={{ marginTop: '50px', borderTop: '1.5px solid #f1f5f9', paddingTop: '40px' }}>
                         <button type="submit" className="btn-gold" style={{ width: '280px', padding: '20px', fontSize: '16px' }}>LƯU THAY ĐỔI</button>
                      </div>
                   </form>
                </div>
             )}

             {activeTab === 'bookings' && (
                <div className="card-luxury animate-fade-in" style={{ padding: '50px' }}>
                   <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '40px', letterSpacing: '-1px' }}>Lịch sử đặt phòng</h2>
                   
                   {bookingLoading ? (
                       <div style={{ padding: '100px 0', textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }}></div></div>
                   ) : bookings.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: '80px 0' }}>
                          <div style={{ fontSize: '60px', color: '#cbd5e1', marginBottom: '20px' }}><i className="fas fa-calendar-times"></i></div>
                          <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#64748b' }}>Bạn chưa có đơn đặt phòng nào</h4>
                          <button onClick={() => navigate('/rooms')} className="btn-gold" style={{ marginTop: '30px', width: '220px' }}>KHÁM PHÁ NGAY</button>
                       </div>
                   ) : (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                          {bookings.map(booking => (
                             <BookingCard key={booking.id} booking={booking} />
                          ))}
                       </div>
                   )}
                </div>
             )}

             {activeTab === 'security' && (
                <div className="card-luxury animate-fade-in" style={{ padding: '50px' }}>
                   <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '40px', letterSpacing: '-1px' }}>Bảo mật tài khoản</h2>
                   <div style={{ maxWidth: '600px' }}>
                      <div style={{ marginBottom: '35px', padding: '25px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '15px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                         <p style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fas fa-info-circle"></i> Mẹo bảo mật
                         </p>
                         <p style={{ color: '#64748b', fontSize: '13px', marginTop: '10px', lineHeight: '1.6' }}>Sử dụng ít nhất 8 ký tự, bao gồm cả chữ cái, số và ký tự đặc biệt để bảo vệ tài khoản tốt nhất.</p>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                         <LuxuryInput label="Mật khẩu hiện tại" type="password" />
                         <LuxuryInput label="Mật khẩu mới" type="password" />
                         <LuxuryInput label="Xác nhận mật khẩu mới" type="password" />
                         <div style={{ marginTop: '20px' }}>
                            <button className="btn-gold" style={{ width: '280px', padding: '20px' }}>CẬP NHẬT MẬT KHẨU</button>
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </main>

        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, active, onClick, color }) {
  return (
    <div onClick={onClick} style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 22px', borderRadius: '15px', 
      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: active ? 'var(--primary)' : 'transparent', 
      color: active ? '#fff' : (color || '#64748b'),
      fontWeight: '700', fontSize: '15px',
      boxShadow: active ? '0 10px 25px rgba(15,23,42,0.15)' : 'none',
      transform: active ? 'translateX(5px)' : 'none'
    }}>
       <i className={icon} style={{ width: '22px', fontSize: '18px' }}></i>
       <span>{label}</span>
    </div>
  );
}

function LuxuryInput({ label, value, type = "text", span = "1", disabled, onChange }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
       <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
       <input 
          type={type} 
          defaultValue={value} 
          disabled={disabled} 
          onChange={(e) => onChange?.(e.target.value)}
          style={{ 
            width: '100%', padding: '18px 24px', borderRadius: '15px', 
            border: '2px solid #f1f5f9', fontSize: '15px', outline: 'none', 
            transition: '0.3s', fontWeight: '600', color: 'var(--primary)',
            background: disabled ? '#f8fafc' : '#fff'
          }} 
          onFocus={(e) => !disabled && (e.target.style.borderColor = 'var(--gold)')}
          onBlur={(e) => !disabled && (e.target.style.borderColor = '#f1f5f9')}
       />
    </div>
  );
}

function BookingCard({ booking }) {
    const statusColors = {
        'PENDING': { bg: '#fff7ed', text: '#c2410c', label: 'CHỜ THANH TOÁN' },
        'CONFIRMED': { bg: '#f0fdf4', text: '#15803d', label: 'ĐÃ XÁC NHẬN' },
        'CANCELLED': { bg: '#fef2f2', text: '#b91c1c', label: 'ĐÃ HỦY' },
        'COMPLETED': { bg: '#f8fafc', text: '#475569', label: 'HOÀN TẤT' }
    };
    const s = statusColors[booking.status] || statusColors['PENDING'];

    return (
        <div style={{ display: 'flex', gap: '25px', padding: '25px', borderRadius: '20px', background: '#fff', border: '1px solid #f1f5f9', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}>
            <div style={{ width: '140px', height: '140px', borderRadius: '15px', overflow: 'hidden' }}>
                <img src="/images/img_31c113a171.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Room" />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>{booking.room_type_name}</h4>
                    <span style={{ fontSize: '11px', fontWeight: '900', padding: '6px 12px', borderRadius: '50px', backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                    <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}><i className="far fa-calendar-alt"></i> {new Date(booking.checkin_date).toLocaleDateString()} - {new Date(booking.checkout_date).toLocaleDateString()}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}><i className="fas fa-hashtag"></i> {booking.room_number}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#ff5a3d' }}>{Number(booking.total_amount).toLocaleString()} VNĐ</span>
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--gold)', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>Xem chi tiết <i className="fas fa-chevron-right"></i></button>
                </div>
            </div>
        </div>
    )
}
