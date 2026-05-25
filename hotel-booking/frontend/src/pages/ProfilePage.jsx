import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { getMyBookings } from '../api/bookingApi';
import EInvoiceModal from '../components/EInvoiceModal';

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
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketSubmitLoading, setTicketSubmitLoading] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState(null);

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
    } else if (activeTab === 'tickets') {
        fetchTickets();
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

  const fetchTickets = async () => {
    try {
        setTicketLoading(true);
        const data = await api('/users/me/tickets');
        setTickets(data);
    } catch (err) {
        console.error('Fetch tickets error:', err);
    } finally {
        setTicketLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
        alert('Vui lòng điền tiêu đề và nội dung yêu cầu hỗ trợ.');
        return;
    }
    try {
        setTicketSubmitLoading(true);
        await api('/users/me/tickets', {
            method: 'POST',
            body: {
                subject: ticketSubject,
                message: ticketMessage
            }
        });
        alert('Gửi yêu cầu hỗ trợ thành công. Nhân viên sẽ phản hồi bạn sớm nhất có thể!');
        setTicketSubject('');
        setTicketMessage('');
        fetchTickets();
    } catch (err) {
        alert('Lỗi gửi yêu cầu hỗ trợ: ' + err.message);
    } finally {
        setTicketSubmitLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
        setBookingLoading(true);
        const data = await api('/auth/profile', {
            method: 'PUT',
            body: {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                address: profileData.address,
                identityNumber: profileData.idNumber
            }
        });
        
        alert('Cập nhật thông tin hồ sơ cá nhân thành công!');
        
        setProfileData(prev => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            lastName: data.lastName || prev.lastName,
            phone: data.phone || prev.phone
        }));
    } catch (err) {
        alert('Lỗi cập nhật hồ sơ: ' + err.message);
    } finally {
        setBookingLoading(false);
    }
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
                   fontSize: '40px', color: '#0f172a', fontWeight: '900', boxShadow: '0 15px 35px rgba(196,166,97,0.4)'
                }}>
                   {profileData.firstName?.[0] || 'U'}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>{profileData.firstName} {profileData.lastName}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '35px', fontWeight: '600' }}>{profileData.email}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <MenuButton icon="far fa-user-circle" label="Thông tin cá nhân" active={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                    <MenuButton icon="fas fa-calendar-check" label="Đơn đặt phòng" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                    <MenuButton icon="fas fa-shield-alt" label="Bảo mật tài khoản" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                    <MenuButton icon="fas fa-headset" label="Hỗ trợ & Góp ý" active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '15px 0' }}></div>
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
                             <BookingCard 
                               key={booking.id} 
                               booking={booking} 
                               onViewDetail={() => setSelectedBooking(booking)}
                               onReviewClick={() => setReviewingBooking(booking)}
                             />
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

             {activeTab === 'tickets' && (
                <div className="card-luxury animate-fade-in" style={{ padding: '50px' }}>
                   <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '10px', letterSpacing: '-1px' }}>Hỗ trợ & Góp ý</h2>
                   <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '40px' }}>Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ quý khách 24/7. Hãy gửi yêu cầu của bạn bên dưới.</p>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '40px' }}>
                      {/* Left: Submit Form */}
                      <div>
                         <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '20px' }}>Gửi yêu cầu mới</h4>
                         <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                               <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Chủ đề / Tiêu đề</label>
                               <input 
                                 type="text" 
                                 placeholder="Ví dụ: Yêu cầu thêm giường phụ, Xuất hóa đơn đỏ..."
                                 value={ticketSubject}
                                 onChange={e => setTicketSubject(e.target.value)}
                                 required
                                 style={{ width: '100%', padding: '18px 24px', borderRadius: '15px', border: '2px solid #f1f5f9', fontSize: '15px', outline: 'none', transition: '0.3s', fontWeight: '600', color: 'var(--primary)' }}
                                 onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                                 onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                               />
                            </div>
                            <div>
                               <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Nội dung yêu cầu</label>
                               <textarea 
                                 placeholder="Nhập chi tiết yêu cầu hỗ trợ của bạn tại đây..."
                                 value={ticketMessage}
                                 onChange={e => setTicketMessage(e.target.value)}
                                 required
                                 rows={5}
                                 style={{ width: '100%', padding: '18px 24px', borderRadius: '15px', border: '2px solid #f1f5f9', fontSize: '15px', outline: 'none', transition: '0.3s', fontWeight: '600', color: 'var(--primary)', resize: 'vertical', fontFamily: 'inherit' }}
                                 onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                                 onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                               />
                            </div>
                            <button type="submit" disabled={ticketSubmitLoading} className="btn-gold" style={{ padding: '18px', fontSize: '15px', width: '100%' }}>
                               {ticketSubmitLoading ? 'Đang gửi...' : 'GỬI YÊU CẦU HỖ TRỢ'}
                            </button>
                         </form>
                      </div>

                      {/* Right: Tickets List */}
                      <div>
                         <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '20px' }}>Yêu cầu đã gửi</h4>
                         {ticketLoading ? (
                            <div style={{ textAlign: 'center', padding: '50px 0' }}><div className="loader" style={{ margin: '0 auto' }}></div></div>
                         ) : tickets.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '50px 0', border: '1px dashed #cbd5e1', borderRadius: '15px', background: '#f8fafc' }}>
                               <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Quý khách chưa gửi yêu cầu hỗ trợ nào.</p>
                            </div>
                         ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
                               {tickets.map(t => {
                                  const statusMap = {
                                     'OPEN': { label: 'ĐANG CHỜ', bg: '#fee2e2', color: '#ef4444' },
                                     'PENDING': { label: 'ĐANG XỬ LÝ', bg: '#fef9c3', color: '#D4AF37' },
                                     'CLOSED': { label: 'ĐÃ GIẢI QUYẾT', bg: '#d1fae5', color: '#10b981' }
                                  };
                                  const st = statusMap[t.status] || { label: t.status, bg: '#f1f5f9', color: '#64748b' };
                                  return (
                                     <div key={t.id} style={{ padding: '20px', borderRadius: '15px', border: '1px solid #f1f5f9', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                           <h5 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', margin: 0, paddingRight: '10px' }}>{t.subject}</h5>
                                           <span style={{ fontSize: '9px', fontWeight: '900', padding: '4px 10px', borderRadius: '50px', backgroundColor: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{st.label}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0', lineHeight: '1.5' }}>{t.message}</p>
                                        
                                        {t.response && (
                                            <div style={{ marginTop: '15px', padding: '15px', borderRadius: '12px', background: '#f8fafc', borderLeft: '3px solid var(--gold)', marginBottom: '12px' }}>
                                               <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--gold)', display: 'block', marginBottom: '5px' }}>PHẢN HỒI TỪ KHÁCH SẠN:</span>
                                               <p style={{ fontSize: '13px', color: '#0f172a', margin: 0, lineHeight: '1.5', fontWeight: '600' }}>{t.response}</p>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                                           <span>Mã yêu cầu: #{t.id}</span>
                                           <span>{new Date(t.create_date).toLocaleDateString()} {new Date(t.create_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                     </div>
                                  );
                                })}
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             )}
          </main>

        </div>
      </div>

      {selectedBooking && (
         <BookingDetailModal 
            booking={selectedBooking} 
            onClose={() => setSelectedBooking(null)} 
            onViewInvoice={(b) => setInvoiceBooking({
               ...b,
               customer_name: `${profileData.lastName} ${profileData.firstName}`,
               customer_phone: profileData.phone,
               identity_number: profileData.idNumber,
               address: profileData.address || `${profileData.city}, ${profileData.country}`
            })}
         />
      )}

      {invoiceBooking && (
         <EInvoiceModal 
            booking={invoiceBooking} 
            onClose={() => setInvoiceBooking(null)} 
         />
      )}

      {reviewingBooking && (
         <ReviewModal 
            booking={reviewingBooking} 
            onClose={() => setReviewingBooking(null)} 
            onSubmitSuccess={fetchBookings}
         />
      )}
    </div>
  );
}

function MenuButton({ icon, label, active, onClick, color }) {
  return (
    <div onClick={onClick} style={{ 
      display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 22px', borderRadius: '15px', 
      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: active ? '#0f172a' : 'transparent', 
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

function BookingCard({ booking, onViewDetail, onReviewClick }) {
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {booking.status === 'COMPLETED' && booking.is_reviewed === 1 && (
                            <span style={{ fontSize: '11px', fontWeight: '900', padding: '6px 12px', borderRadius: '50px', backgroundColor: '#fef9c3', color: '#854d0e' }}>
                                ĐÃ ĐÁNH GIÁ: {booking.review_rating}★
                            </span>
                        )}
                        <span style={{ fontSize: '11px', fontWeight: '900', padding: '6px 12px', borderRadius: '50px', backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                    <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                      <i className="far fa-calendar-alt"></i> {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                      <i className="fas fa-hashtag"></i> {booking.room_number || 'Tự động xếp'}
                    </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#ff5a3d' }}>{Number(booking.total_amount).toLocaleString()} VNĐ</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {booking.status === 'COMPLETED' && booking.is_reviewed === 0 && (
                            <button 
                              onClick={onReviewClick} 
                              style={{ border: 'none', background: 'transparent', color: '#10b981', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                               Đánh giá ngay <i className="far fa-star"></i>
                            </button>
                        )}
                        <button onClick={onViewDetail} style={{ border: 'none', background: 'transparent', color: 'var(--gold)', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>Xem chi tiết <i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookingDetailModal({ booking, onClose, onViewInvoice }) {
  const statusColors = {
      'PENDING': { bg: '#fff7ed', text: '#c2410c', label: 'CHỜ THANH TOÁN' },
      'CONFIRMED': { bg: '#f0fdf4', text: '#15803d', label: 'ĐÃ XÁC NHẬN' },
      'CANCELLED': { bg: '#fef2f2', text: '#b91c1c', label: 'ĐÃ HỦY' },
      'COMPLETED': { bg: '#f8fafc', text: '#475569', label: 'HOÀN TẤT' }
  };
  const s = statusColors[booking.status] || statusColors['PENDING'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card-luxury animate-fade-in" style={{
        width: '100%', maxWidth: '800px', backgroundColor: '#fff',
        borderRadius: '30px', padding: '40px', position: 'relative',
        boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
        border: '1px solid rgba(196, 166, 97, 0.2)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '25px', right: '25px',
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: '#f1f5f9', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontSize: '18px', color: '#64748b', transition: '0.3s'
        }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}>
          <i className="fas fa-times"></i>
        </button>

        <h3 className="serif" style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '30px', borderBottom: '2px solid var(--gold)', paddingBottom: '15px' }}>
          Chi tiết đơn đặt phòng #{booking.booking_code || booking.id}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
          {/* Left Room Info */}
          <div>
            <div style={{ borderRadius: '20px', overflow: 'hidden', height: '180px', marginBottom: '20px' }}>
              <img src="/images/img_31c113a171.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Room" />
            </div>
            <h4 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>{booking.room_type_name}</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
              Trải nghiệm kỳ nghỉ thượng lưu tại resort 5 sao cao cấp của chúng tôi với đầy đủ tiện ích chuẩn hoàng gia.
            </p>
            <span style={{ fontSize: '12px', fontWeight: '900', padding: '8px 16px', borderRadius: '50px', backgroundColor: s.bg, color: s.text }}>
              {s.label}
            </span>
          </div>

          {/* Right Bill Receipt */}
          <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '24px', border: '1px dashed rgba(196, 166, 97, 0.4)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#64748b', fontWeight: '600' }}>Số phòng:</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{booking.room_number || 'Tự động xếp'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#64748b', fontWeight: '600' }}>Ngày nhận phòng:</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{new Date(booking.check_in_date).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#64748b', fontWeight: '600' }}>Ngày trả phòng:</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>{new Date(booking.check_out_date).toLocaleDateString()}</span>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0', margin: '5px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>Tổng thanh toán:</span>
              <span style={{ fontWeight: '900', color: '#ff5a3d', fontSize: '24px' }}>{Number(booking.total_amount).toLocaleString()} VNĐ</span>
            </div>

            {/* Conditional Advice Area */}
            <div style={{ marginTop: '10px', padding: '15px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {booking.status === 'PENDING' ? (
                <div>
                  <p style={{ color: '#c2410c', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px' }}>
                    <i className="fas fa-university"></i> THÔNG TIN CHUYỂN KHOẢN CỌC:
                  </p>
                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', fontFamily: 'monospace' }}>
                    Ngân hàng: Vietcombank (VCB)<br />
                    Số TK: 9999-5555-8888<br />
                    Chủ TK: RESORT BOOKING X TRAVEL<br />
                    Nội dung: CK {booking.booking_code}
                  </p>
                </div>
              ) : booking.status === 'CONFIRMED' ? (
                <p style={{ color: '#15803d', fontSize: '12.5px', fontWeight: '700', margin: 0 }}>
                  <i className="fas fa-check-circle"></i> ĐÃ THANH TOÁN THÀNH CÔNG!<br />
                  <span style={{ fontWeight: '500', color: '#475569', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Mã Check-in của bạn đã được kích hoạt. Hãy xuất trình CMND/CCCD tại quầy lễ tân để nhận phòng lúc 14:00.
                  </span>
                </p>
              ) : booking.status === 'CANCELLED' ? (
                <p style={{ color: '#b91c1c', fontSize: '12px', fontWeight: '600', margin: 0 }}>
                  <i className="fas fa-info-circle"></i> Đơn đặt phòng này đã bị hủy. Khoản hoàn trả (nếu có) được xử lý trong vòng 3-5 ngày làm việc.
                </p>
              ) : (
                <p style={{ color: '#475569', fontSize: '12.5px', fontWeight: '700', margin: 0 }}>
                  <i className="fas fa-hotel"></i> CẢM ƠN QUÝ KHÁCH!<br />
                  <span style={{ fontWeight: '500', color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Rất hân hạnh được phục vụ quý khách tại XTravel. Chúc quý khách một hành trình tuyệt vời.
                  </span>
                </p>
              )}
            </div>

            {/* E-Invoice Button */}
            {['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(booking.status) && (
              <button 
                onClick={() => onViewInvoice(booking)}
                style={{ 
                  marginTop: '15px', 
                  width: '100%', 
                  padding: '16px 25px', 
                  fontSize: '13px', 
                  fontWeight: '800',
                  background: 'transparent',
                  border: booking.status === 'COMPLETED' ? '2px solid var(--gold)' : '2px solid #0ea5e9',
                  color: booking.status === 'COMPLETED' ? 'var(--gold)' : '#0ea5e9',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: '0.3s'
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = booking.status === 'COMPLETED' ? 'var(--gold)' : '#0ea5e9'; 
                  e.currentTarget.style.color = '#fff'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = 'transparent'; 
                  e.currentTarget.style.color = booking.status === 'COMPLETED' ? 'var(--gold)' : '#0ea5e9'; 
                }}
              >
                <i className={booking.status === 'COMPLETED' ? "fas fa-file-signature" : "fas fa-receipt"} style={{ fontSize: '16px' }}></i> {booking.status === 'COMPLETED' ? 'XUẤT HÓA ĐƠN ĐỎ (VAT)' : 'XUẤT PHIẾU TẠM TÍNH'}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ booking, onClose, onSubmitSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api(`/bookings/${booking.id}/reviews`, {
        method: 'POST',
        body: { rating, comment }
      });
      alert('Cảm ơn bạn đã gửi đánh giá!');
      onSubmitSuccess();
      onClose();
    } catch (err) {
      alert('Lỗi gửi đánh giá: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card-luxury animate-fade-in" style={{
        width: '100%', maxWidth: '500px', backgroundColor: '#fff',
        borderRadius: '30px', padding: '40px', position: 'relative',
        boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
        border: '1px solid rgba(196, 166, 97, 0.2)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '25px', right: '25px',
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: '#f1f5f9', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontSize: '18px', color: '#64748b', transition: '0.3s'
        }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}>
          <i className="fas fa-times"></i>
        </button>

        <h3 className="serif" style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>
          Đánh giá kỳ nghỉ
        </h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px' }}>
          Chia sẻ trải nghiệm của bạn tại phòng <strong>{booking.room_type_name}</strong> (Mã đơn: #{booking.booking_code || booking.id})
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Star Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mức độ hài lòng</label>
            <div style={{ display: 'flex', gap: '8px', fontSize: '32px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = star <= (hoverRating !== null ? hoverRating : rating);
                return (
                  <i 
                    key={star} 
                    className={`${isSelected ? 'fas' : 'far'} fa-star`}
                    style={{ color: '#f59e0b', transition: '0.1s' }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                  />
                );
              })}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#f59e0b', marginTop: '5px' }}>
              {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : 'Rất kém'}
            </span>
          </div>

          {/* Comment Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ý kiến đóng góp</label>
            <textarea 
              placeholder="Nhập nhận xét của bạn về dịch vụ, phòng ốc và nhân viên của chúng tôi..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
              rows={4}
              style={{ width: '100%', padding: '18px 24px', borderRadius: '15px', border: '2px solid #f1f5f9', fontSize: '15px', outline: 'none', transition: '0.3s', fontWeight: '600', color: 'var(--primary)', resize: 'vertical', fontFamily: 'inherit' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
              onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-gold" style={{ padding: '18px', fontSize: '15px', width: '100%', marginTop: '10px' }}>
            {submitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
          </button>
        </form>
      </div>
    </div>
  );
}
