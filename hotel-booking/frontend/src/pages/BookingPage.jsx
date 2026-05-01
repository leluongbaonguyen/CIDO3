import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoomDetail } from '../api/roomApi';
import { createBooking, payBooking } from '../api/bookingApi';

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [room, setRoom] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('QR_CODE');

  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn') === 'null' ? null : searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut') === 'null' ? null : searchParams.get('checkOut');
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');

  const [formData, setFormData] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '',
    phone: user?.phone || '',
    email: user?.email || '',
    guestName: '',
  });

  useEffect(() => {
    if (!roomId) {
        navigate('/rooms');
        return;
    }

    const fetchRoom = async () => {
        try {
            setLoading(true);
            const data = await getRoomDetail(roomId);
            setRoom(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchRoom();
  }, [roomId, navigate]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const nights = calculateNights();
  const basePrice = room ? Number(room.base_price) : 0;
  const subTotal = basePrice * nights;
  const tax = subTotal * 0.1;
  const total = subTotal + tax;

  const handleNext = () => {
    if (!formData.name || !formData.phone || !formData.email) {
        alert('Vui lòng điền đầy đủ thông tin liên hệ.');
        return;
    }
    if (!checkIn || !checkOut) {
        alert('Vui lòng quay lại chọn ngày nhận và trả phòng hợp lệ.');
        return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleConfirmPayment = async () => {
    try {
        setBookingLoading(true);

        const guestInfo = !user ? {
            email: formData.email,
            phone: formData.phone,
            firstName: formData.name.split(' ').slice(0, -1).join(' ') || formData.name,
            lastName: formData.name.split(' ').slice(-1).join(' ') || 'User',
            address: 'Website Guest',
            city: 'Da Nang',
            country: 'Vietnam'
        } : null;

        const bookingData = {
            roomId: parseInt(roomId),
            checkinDate: checkIn,
            checkoutDate: checkOut,
            totalGuests: adults + children,
            specialRequests: `Khách liên hệ: ${formData.name}, SĐT: ${formData.phone}`,
            guestInfo: guestInfo
        };

        const res = await createBooking(bookingData);
        const newBookingId = res.bookingId;
        setBookingId(newBookingId);

        // Gọi API thanh toán (Backend sẽ xử lý status dựa trên method)
        await payBooking(newBookingId, { paymentMethod: paymentMethod });

        setStep(3);
        window.scrollTo(0, 0);
    } catch (err) {
        alert('Lỗi đặt phòng: ' + err.message);
    } finally {
        setBookingLoading(false);
    }
  };

  const getDisplayImage = (photoUrls) => {
    if (!photoUrls || photoUrls === 'null' || photoUrls === 'undefined') return '/images/rooms/std-1.jpg';
    try {
      const urls = typeof photoUrls === 'string' && (photoUrls.startsWith('[') || photoUrls.startsWith('{')) 
        ? JSON.parse(photoUrls) 
        : photoUrls;
        
      if (Array.isArray(urls) && urls.length > 0) return urls[0];
      if (typeof urls === 'string') {
        const cleaned = urls.replace(/[\[\]"]/g, '').split(',')[0].trim();
        return cleaned || '/images/rooms/std-1.jpg';
      }
      return '/images/rooms/std-1.jpg';
    } catch (e) {
      if (typeof photoUrls === 'string') {
        return photoUrls.split(',')[0].replace(/[\[\]"]/g, '').trim() || '/images/rooms/std-1.jpg';
      }
      return '/images/rooms/std-1.jpg';
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f6f7' }}>
      <div className="loader"></div>
      <style>{`.loader { width: 40px; height: 40px; border: 3px solid var(--gold); border-bottom-color: transparent; border-radius: 50%; animation: rotation 1s linear infinite; } @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>{error}</div>;

  const summaryData = {
    title: room?.room_type_name || 'Room',
    checkIn: checkIn || 'Chưa chọn',
    checkOut: checkOut || 'Chưa chọn',
    price: subTotal,
    tax,
    total,
    id: bookingId || 'PENDING'
  };

  if (step === 1) {
    return (
      <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Progress step={1} />
          {!user && (
              <div style={{ marginTop: '20px', padding: '15px', background: '#e0f2fe', borderRadius: '12px', textAlign: 'center', color: '#0369a1', fontWeight: '600', fontSize: '14px' }}>
                  <i className="fas fa-info-circle"></i> Bạn đang đặt phòng với tư cách Khách. <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/login')}>Đăng nhập</span> để quản lý đơn đặt phòng dễ dàng hơn.
              </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px', marginTop: '40px' }}>
             <div className="animate-left">
                <Section title="Thông tin liên hệ" icon="far fa-envelope">
                   <BookingInput label="Họ tên*" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                      <BookingInput label="Số điện thoại*" value={formData.phone} placeholder="+84" onChange={(v) => setFormData({...formData, phone: v})} />
                      <BookingInput label="Email*" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
                   </div>
                </Section>
                <Section title="Thông tin khách lưu trú" icon="far fa-user">
                   <BookingInput label="Họ tên khách*" placeholder="Nhập tên người lưu trú" onChange={(v) => setFormData({...formData, guestName: v})} />
                   <p style={{ fontSize: '12px', color: '#666', marginTop: '-10px' }}>Nếu để trống, chúng tôi sẽ dùng tên người liên hệ.</p>
                </Section>
                <button onClick={handleNext} style={primaryBtnStyle}>Tiếp tục thanh toán</button>
             </div>
             <div className="animate-right">
                <BookingSummary data={summaryData} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Progress step={2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px', marginTop: '40px' }}>
             <div className="animate-left">
                <Section title="Phương thức thanh toán" icon="fas fa-shield-alt">
                   <PaymentOption 
                        id="QR_CODE"
                        icon="fas fa-qrcode" 
                        title="QR Code / MoMo / ZaloPay" 
                        desc="Thanh toán nhanh qua ứng dụng ngân hàng hoặc ví điện tử."
                        active={paymentMethod === 'QR_CODE'} 
                        onClick={() => setPaymentMethod('QR_CODE')}
                   />
                   <PaymentOption 
                        id="BANK_TRANSFER"
                        icon="fas fa-university" 
                        title="Chuyển khoản ngân hàng" 
                        desc="Chuyển khoản trực tiếp vào số tài khoản của khách sạn."
                        active={paymentMethod === 'BANK_TRANSFER'} 
                        onClick={() => setPaymentMethod('BANK_TRANSFER')}
                   />
                   <PaymentOption 
                        id="CASH"
                        icon="fas fa-money-bill-wave" 
                        title="Tiền mặt tại quầy" 
                        desc="Thanh toán trực tiếp khi bạn nhận phòng tại khách sạn."
                        active={paymentMethod === 'CASH'} 
                        onClick={() => setPaymentMethod('CASH')}
                   />
                   <PaymentOption 
                        id="CREDIT_CARD"
                        icon="far fa-credit-card" 
                        title="Thẻ Visa / Mastercard" 
                        desc="Hỗ trợ các loại thẻ quốc tế phổ biến nhất hiện nay."
                        active={paymentMethod === 'CREDIT_CARD'} 
                        onClick={() => setPaymentMethod('CREDIT_CARD')}
                   />
                </Section>

                <div className="animate-fade-up" style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
                   {paymentMethod === 'QR_CODE' && (
                       <div style={{ textAlign: 'center' }}>
                           <div style={{ display: 'inline-block', padding: '20px', background: '#fff', borderRadius: '20px', marginBottom: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                               <img 
                                 src={`https://img.vietqr.io/image/NAMABANK-019042004-compact2.png?amount=${total}&addInfo=BX%20${roomId}%20${formData.phone}&accountName=LE%20LUONG%20BAO%20NGUYEN`} 
                                 alt="QR" 
                                 style={{ width: '280px', borderRadius: '10px' }} 
                               />
                           </div>
                           <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a' }}>Quét mã VietQR</h4>
                           <p style={{ color: '#666', marginTop: '10px', maxWidth: '400px', margin: '10px auto' }}>Sử dụng ứng dụng Ngân hàng hoặc Ví điện tử bất kỳ để quét mã và hoàn tất thanh toán tự động.</p>
                       </div>
                   )}

                   {paymentMethod === 'BANK_TRANSFER' && (
                       <div>
                           <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: 'var(--gold)' }}>Thông tin chuyển khoản hỏa tốc</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                               <BankInfo label="Ngân hàng" value="Nam A Bank (Ngân hàng TMCP Nam Á)" />
                               <BankInfo label="Số tài khoản" value="019042004" copy />
                               <BankInfo label="Chủ tài khoản" value="LE LUONG BAO NGUYEN" />
                               <BankInfo label="Số tiền" value={`${total.toLocaleString()} VNĐ`} />
                               <BankInfo label="Nội dung" value={`BX ${roomId} ${formData.phone}`} copy />
                           </div>
                           <p style={{ marginTop: '20px', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>* Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận đơn hàng của bạn trong giây lát.</p>
                       </div>
                   )}

                   {paymentMethod === 'CASH' && (
                       <div style={{ textAlign: 'center', padding: '20px 0' }}>
                           <i className="fas fa-hand-holding-usd" style={{ fontSize: '50px', color: 'var(--gold)', marginBottom: '20px' }}></i>
                           <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a' }}>Thanh toán khi nhận phòng</h4>
                           <p style={{ color: '#666', marginTop: '15px', maxWidth: '450px', margin: '15px auto', lineHeight: '1.6' }}>
                               Bạn sẽ thanh toán số tiền <strong>{total.toLocaleString()}đ</strong> trực tiếp tại quầy lễ tân khi làm thủ tục Check-in. <br/>
                               <span style={{ fontSize: '13px', color: '#888' }}>(Vui lòng mang theo CMND/CCCD để làm thủ tục)</span>
                           </p>
                       </div>
                   )}

                   {paymentMethod === 'CREDIT_CARD' && (
                       <div style={{ textAlign: 'center', padding: '20px 0' }}>
                           <i className="fas fa-lock" style={{ fontSize: '40px', color: '#10b981', marginBottom: '20px' }}></i>
                           <h4 style={{ fontSize: '18px', fontWeight: '800' }}>Cổng thanh toán bảo mật</h4>
                           <p style={{ color: '#666', marginTop: '10px' }}>Bạn sẽ được chuyển hướng đến cổng thanh toán an toàn để hoàn tất giao dịch.</p>
                       </div>
                   )}
                </div>

                <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button 
                        onClick={handleConfirmPayment} 
                        disabled={bookingLoading}
                        style={{ ...primaryBtnStyle, background: bookingLoading ? '#ccc' : 'var(--gold)' }}
                    >
                        {bookingLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <div className="loader-small"></div> Đang xử lý...
                            </span>
                        ) : 'Xác nhận & Hoàn tất đặt phòng'}
                    </button>
                    <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: '#666', padding: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                        <i className="fas fa-chevron-left" style={{ marginRight: '8px' }}></i> Quay lại thông tin liên hệ
                    </button>
                </div>
             </div>
             <div className="animate-right">
                <BookingSummary data={summaryData} />
                <div style={{ marginTop: '25px', padding: '25px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '15px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                   <p style={{ color: '#059669', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fas fa-shield-alt"></i> Thanh toán an toàn & bảo mật
                   </p>
                   <p style={{ color: '#666', fontSize: '12px', marginTop: '8px', lineHeight: '1.5' }}>Thông tin của bạn luôn được mã hóa và bảo vệ theo tiêu chuẩn quốc tế.</p>
                </div>
             </div>
          </div>
        </div>
        <style>{`
            .loader-small { width: 18px; height: 18px; border: 2px solid #fff; border-bottom-color: transparent; border-radius: 50%; animation: rotation 1s linear infinite; }
            @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f6f7', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="animate-zoom" style={{ background: '#fff', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.12)' }}>
           <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '50px', color: '#fff', textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px', fontSize: '45px' }}>
                 <i className="fas fa-check"></i>
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>Kỳ nghỉ đang chờ bạn!</h2>
              <p style={{ opacity: 0.9, marginTop: '12px', fontSize: '18px' }}>Mã đặt chỗ: <span style={{ fontWeight: '900', color: '#fff' }}>BX-{bookingId}</span></p>
           </div>
           <div style={{ padding: '60px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '50px' }}>
                 <div>
                    <img src={getDisplayImage(room?.photo_urls)} style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} alt="Room" />
                    <div style={{ marginTop: '25px', padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '5px' }}>ĐỊA CHỈ KHÁCH SẠN</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Võ Nguyên Giáp, Sơn Trà, Đà Nẵng, Việt Nam</p>
                    </div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <DetailItem label="Hạng phòng" value={room?.room_type_name} />
                        <DetailItem label="Khách lưu trú" value={formData.guestName || formData.name} />
                        <DetailItem label="Nhận phòng" value={checkIn} />
                        <DetailItem label="Trả phòng" value={checkOut} />
                    </div>
                    <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '25px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: '600', color: '#64748b' }}>Tổng số tiền cần thanh toán</span>
                          <span style={{ color: '#ff5a3d', fontSize: '28px', fontWeight: '900' }}>{total.toLocaleString()}đ</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div style={{ marginTop: '60px', display: 'flex', gap: '20px' }}>
                 <button onClick={() => window.print()} style={{ flex: 1, padding: '20px', borderRadius: '50px', border: '2px solid var(--gold)', color: 'var(--gold)', fontWeight: '800', cursor: 'pointer', background: '#fff', fontSize: '16px' }}>Tải Voucher PDF</button>
                 <button onClick={() => navigate('/')} style={{ flex: 1, padding: '20px', borderRadius: '50px', background: 'var(--gold)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '16px' }}>Về Trang Chủ</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function Progress({ step }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
       <Step num={1} label="Thông tin" active={step >= 1} current={step === 1} />
       <div style={{ width: '80px', height: '3px', borderRadius: '10px', background: step > 1 ? 'var(--gold)' : '#e2e8f0' }}></div>
       <Step num={2} label="Thanh toán" active={step >= 2} current={step === 2} />
       <div style={{ width: '80px', height: '3px', borderRadius: '10px', background: step > 2 ? 'var(--gold)' : '#e2e8f0' }}></div>
       <Step num={3} label="Hoàn tất" active={step >= 3} current={step === 3} />
    </div>
  );
}

function Step({ num, label, active, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: active ? 1 : 0.4 }}>
       <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            background: active ? (current ? 'var(--gold)' : 'var(--gold)') : '#cbd5e1', 
            color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', 
            fontWeight: '900', fontSize: '18px',
            boxShadow: current ? '0 0 20px rgba(196, 166, 97, 0.4)' : 'none'
        }}>
           {num}
       </div>
       <span style={{ fontWeight: '800', fontSize: '15px', color: active ? '#1e293b' : '#64748b' }}>{label}</span>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0', marginBottom: '30px' }}>
       <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', color: '#1e293b' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(196, 166, 97, 0.1)', color: 'var(--gold)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>
            <i className={icon}></i>
          </div>
          {title}
       </h3>
       {children}
    </div>
  );
}

function BookingInput({ label, value, placeholder, onChange }) {
  return (
    <div style={{ marginBottom: '20px' }}>
       <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
       <input 
         type="text" 
         value={value} 
         placeholder={placeholder}
         onChange={(e) => onChange?.(e.target.value)}
         style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '2px solid #f1f5f9', fontSize: '15px', outline: 'none', transition: '0.3s', fontWeight: '600' }} 
         onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
         onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
       />
    </div>
  );
}

function BookingSummary({ data }) {
  return (
    <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.08)', position: 'sticky', top: '100px', border: '1px solid #f0f0f0' }}>
       <div style={{ padding: '35px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <h4 style={{ fontWeight: '900', fontSize: '20px', color: '#1e293b' }}>{data.title}</h4>
          <p style={{ fontSize: '13px', color: 'var(--gold)', marginTop: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>BOOKING X Premium Resort</p>
       </div>
       <div style={{ padding: '35px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
             <div><p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', marginBottom: '5px' }}>NHẬN PHÒNG</p><p style={{ fontWeight: '800', color: '#1e293b' }}>{data.checkIn}</p></div>
             <div><p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', marginBottom: '5px' }}>TRẢ PHÒNG</p><p style={{ fontWeight: '800', color: '#1e293b' }}>{data.checkOut}</p></div>
          </div>
          <div style={{ borderTop: '2px dashed #f1f5f9', paddingTop: '30px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#475569' }}><span style={{ fontWeight: '600' }}>Giá phòng</span><span style={{ fontWeight: '800' }}>{data.price.toLocaleString()} VNĐ</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', color: '#475569' }}><span style={{ fontWeight: '600' }}>Thuế & Phí (10%)</span><span style={{ fontWeight: '800' }}>{data.tax.toLocaleString()} VNĐ</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '26px', fontWeight: '900' }}>
                 <span style={{ color: '#1e293b' }}>Tổng tiền</span>
                 <span style={{ color: '#ff5a3d' }}>{data.total.toLocaleString()}đ</span>
             </div>
          </div>
       </div>
    </div>
  );
}

function PaymentOption({ icon, title, desc, active, onClick }) {
  return (
    <div 
        onClick={onClick}
        style={{ 
            display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', 
            borderRadius: '20px', border: active ? '2.5px solid var(--gold)' : '2px solid #f1f5f9', 
            marginBottom: '15px', cursor: 'pointer', transition: '0.3s',
            background: active ? 'rgba(196, 166, 97, 0.02)' : '#fff' 
        }}
    >
       <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: active ? 'var(--gold)' : '#f8fafc', color: active ? '#fff' : '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '22px' }}>
            <i className={icon}></i>
       </div>
       <div style={{ flex: 1 }}>
          <span style={{ fontWeight: '800', fontSize: '17px', color: '#1e293b', display: 'block' }}>{title}</span>
          <span style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'block' }}>{desc}</span>
       </div>
       {active ? (
           <i className="fas fa-check-circle" style={{ color: 'var(--gold)', fontSize: '24px' }}></i>
       ) : (
           <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #e2e8f0' }}></div>
       )}
    </div>
  );
}

function BankInfo({ label, value, copy }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8fafc', borderRadius: '12px' }}>
            <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>{label}</span>
                <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{value}</span>
            </div>
            {copy && <button style={{ border: 'none', background: 'none', color: 'var(--gold)', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}><i className="far fa-copy"></i> SAO CHÉP</button>}
        </div>
    )
}

function DetailItem({ label, value }) {
  return (
    <div>
       <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
       <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{value}</p>
    </div>
  );
}

const primaryBtnStyle = {
  width: '100%', background: 'var(--gold)', color: '#fff', border: 'none', padding: '22px', 
  borderRadius: '50px', fontWeight: '900', fontSize: '18px', cursor: 'pointer', transition: '0.3s',
  boxShadow: '0 15px 30px rgba(196, 166, 97, 0.3)', letterSpacing: '0.5px'
};
