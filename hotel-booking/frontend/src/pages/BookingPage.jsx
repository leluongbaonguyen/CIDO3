import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoomDetail } from '../api/roomApi';
import { createBooking, validateVoucher } from '../api/bookingApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

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
  const [bookingQrToken, setBookingQrToken] = useState('');
  const [bookingObj, setBookingObj] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('QR_CODE');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [discountCode, setDiscountCode] = useState('');
  const [voucherPercent, setVoucherPercent] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const pdfUrl = `http://localhost:5000${bookingObj?.voucherPdfUrl || `/uploads/vouchers/Voucher_${bookingObj?.booking_code || bookingObj?.bookingCode || `BK${bookingId}`}.pdf`}`;
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Lỗi khi tải PDF:', err);
      alert('Không thể tải PDF, vui lòng thử lại.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn') === 'null' ? null : searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut') === 'null' ? null : searchParams.get('checkOut');
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');

  const [formData, setFormData] = useState({
    name: user?.fullName || user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '') || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '') || '',
    phone: user?.phone || '',
    email: user?.email || '',
    guestName: '',
  });

  // Dynamically update form details once the user context is loaded/updated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.fullName || user.full_name || (user.first_name ? `${user.first_name} ${user.last_name || ''}` : '') || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : '') || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

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
  }, [roomId, navigate, user]);

  const handleApplyVoucher = async () => {
    if (!discountCode) return;
    setIsValidatingVoucher(true);
    setVoucherMessage('');
    try {
      const res = await validateVoucher(discountCode);
      if (res.valid) {
        setVoucherPercent(res.percentage);
        setVoucherMessage(res.message);
      } else {
        setVoucherPercent(0);
        setVoucherMessage(res.message || 'Mã không hợp lệ');
      }
    } catch (err) {
      setVoucherPercent(0);
      setVoucherMessage(err.message || 'Mã không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const calculateDetailedAmount = () => {
    if (!room || !checkIn || !checkOut) {
      return {
        nights: 1,
        baseRoomCharge: 0,
        weekendSurcharge: 0,
        holidaySurcharge: 0,
        extraOccupantSurcharge: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        memberDiscountPercent: 0
      };
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    let calcNights = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (calcNights <= 0) calcNights = 1;

    let baseRoomCharge = 0;
    let weekendSurcharge = 0;
    let holidaySurcharge = 0;

    const holidays = ['01/01', '30/04', '01/05', '02/09'];

    for (let i = 0; i < calcNights; i++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + i);

      const dayOfWeek = currentDay.getDay();
      let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
      
      const dd = String(currentDay.getDate()).padStart(2, '0');
      const mm = String(currentDay.getMonth() + 1).padStart(2, '0');
      const dayMonthStr = `${dd}/${mm}`;
      let isHoliday = holidays.includes(dayMonthStr);

      let nightBase = Number(room.base_price);
      baseRoomCharge += nightBase;

      if (isWeekend) {
        weekendSurcharge += nightBase * 0.10;
      }
      if (isHoliday) {
        holidaySurcharge += nightBase * 0.20;
      }
    }

    const totalGuests = adults + children;
    const extraGuests = Math.max(0, totalGuests - 2);
    const extraOccupantSurcharge = extraGuests * (Number(room.base_price) * 0.15) * calcNights;

    const subtotal = baseRoomCharge + weekendSurcharge + holidaySurcharge + extraOccupantSurcharge;

    let discountPercent = voucherPercent;
    let memberDiscountPercent = 0;
    if (user) {
      const fullName = user.fullName || user.full_name || '';
      const email = user.email || '';
      if (fullName.toUpperCase().includes('VIP') || email.toUpperCase().includes('VIP')) {
        memberDiscountPercent = 5;
      }
    }

    const voucherDiscount = (subtotal * discountPercent) / 100;
    const memberDiscount = (subtotal * memberDiscountPercent) / 100;
    const totalDiscount = voucherDiscount + memberDiscount;

    const total = Math.max(subtotal - totalDiscount, 0);

    return {
      nights: calcNights,
      baseRoomCharge,
      weekendSurcharge,
      holidaySurcharge,
      extraOccupantSurcharge,
      subtotal,
      discountAmount: totalDiscount,
      total,
      memberDiscountPercent
    };
  };

  const {
    nights,
    baseRoomCharge,
    weekendSurcharge,
    holidaySurcharge,
    extraOccupantSurcharge,
    subtotal,
    discountAmount,
    total,
    memberDiscountPercent
  } = calculateDetailedAmount();

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

        const bookingData = {
            roomId: parseInt(roomId),
            checkInDate: checkIn,
            checkOutDate: checkOut,
            adults,
            children,
            totalGuests: adults + children,
            paymentMethod,
            note: `Khách liên hệ: ${formData.name}, SĐT: ${formData.phone}. Khách lưu trú: ${formData.guestName || formData.name}`,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            discountCode: discountCode || null
        };

        const res = await createBooking(bookingData);
        const newBookingId = res.bookingId || res.booking?.id;
        const newQrToken = res.booking?.qrToken || res.booking?.qr_token || '';
        setBookingId(newBookingId);
        setBookingQrToken(newQrToken);
        setBookingObj(res.booking);

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
    baseRoomCharge,
    weekendSurcharge,
    holidaySurcharge,
    extraOccupantSurcharge,
    subtotal,
    discountAmount,
    total,
    id: bookingId || 'PENDING'
  };

  if (step === 1) {
    return (
      <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Progress step={1} />
          <div style={{ marginTop: '20px', padding: '15px', background: '#e0f2fe', borderRadius: '12px', textAlign: 'center', color: '#0369a1', fontWeight: '600', fontSize: '14px' }}>
              <i className="fas fa-info-circle"></i> Luồng đặt phòng hỗ trợ đặt nhanh không cần tài khoản. Bạn cũng có thể đăng nhập trước để đồng bộ và theo dõi lịch sử đơn đặt.
          </div>
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
                <BookingSummary 
                  data={summaryData} 
                  discountCode={discountCode} 
                  setDiscountCode={setDiscountCode} 
                  handleApplyVoucher={handleApplyVoucher} 
                  voucherMessage={voucherMessage} 
                  isValidatingVoucher={isValidatingVoucher} 
                />
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
                <BookingSummary 
                  data={summaryData} 
                  discountCode={discountCode} 
                  setDiscountCode={setDiscountCode} 
                  handleApplyVoucher={handleApplyVoucher} 
                  voucherMessage={voucherMessage} 
                  isValidatingVoucher={isValidatingVoucher} 
                />
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
              <p style={{ opacity: 0.9, marginTop: '12px', fontSize: '18px' }}>Mã đặt chỗ: <span style={{ fontWeight: '900', color: '#fff' }}>{bookingObj?.booking_code || bookingObj?.bookingCode || `BX-${bookingId}`}</span></p>
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
              
              {formData.email && (
                <div style={{ marginTop: '30px', padding: '15px 25px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <i className="fas fa-paper-plane" style={{ fontSize: '18px', color: '#10b981' }}></i>
                    <span>Hệ thống đang gửi email xác nhận kèm Voucher PDF chính thức tới địa chỉ <strong>{formData.email}</strong>. Quý khách vui lòng kiểm tra hộp thư (hoặc mục Spam).</span>
                </div>
              )}

              <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                 <button onClick={handleDownloadPDF} disabled={isDownloadingPdf} style={{ flex: 1, padding: '20px', borderRadius: '50px', border: '2px solid var(--gold)', color: 'var(--gold)', fontWeight: '800', cursor: isDownloadingPdf ? 'wait' : 'pointer', background: '#fff', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    {isDownloadingPdf ? (
                        <><div className="loader-small" style={{ borderColor: 'var(--gold)' }}></div> Đang tạo Voucher...</>
                    ) : (
                        <><i className="fas fa-file-pdf"></i> Tải Voucher PDF cao cấp</>
                    )}
                 </button>
                 <button onClick={() => navigate('/')} style={{ flex: 1, padding: '20px', borderRadius: '50px', background: 'var(--gold)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '16px' }}>Về Trang Chủ</button>
              </div>
           </div>

           {/* MẪU VOUCHER ẨN CHỜ XUẤT PDF (THIẾT KẾ HOÀNG GIA) */}
           <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', overflow: 'hidden' }}>
             <div id="pdf-voucher-template" style={{ width: '800px', background: '#fff', fontFamily: "'Playfair Display', serif", color: '#1e293b' }}>
                <div style={{ padding: '60px', background: 'var(--black)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '6px solid var(--gold)' }}>
                    <div>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'var(--gold)', margin: 0, letterSpacing: '2px' }}>X-TRAVEL</h1>
                        <p style={{ fontSize: '16px', letterSpacing: '5px', textTransform: 'uppercase', marginTop: '10px', opacity: 0.9, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Luxury Resort & Spa</p>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <p style={{ fontSize: '13px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5px 0', color: 'var(--gold)' }}>Booking Reference</p>
                        <h2 style={{ fontSize: '34px', fontWeight: '900', margin: 0 }}>BX-{bookingId}</h2>
                    </div>
                </div>
                
                <div style={{ padding: '60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                   <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--gold)', marginBottom: '40px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 40px 0' }}>Official Reservation Voucher</h3>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                      <div>
                          <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Khách hàng / Guest</p>
                          <p style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{formData.guestName || formData.name}</p>
                      </div>
                      <div>
                          <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Hạng phòng / Room Type</p>
                          <p style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{room?.room_type_name}</p>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '35px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                       <div>
                           <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Nhận phòng / Check-in</p>
                           <p style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{checkIn}</p>
                           <p style={{ fontSize: '14px', color: '#64748b', margin: '5px 0 0 0', fontWeight: '600' }}>Từ 14:00 (From 2:00 PM)</p>
                       </div>
                       <div>
                           <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Trả phòng / Check-out</p>
                           <p style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{checkOut}</p>
                           <p style={{ fontSize: '14px', color: '#64748b', margin: '5px 0 0 0', fontWeight: '600' }}>Trước 12:00 (Before 12:00 PM)</p>
                       </div>
                   </div>

                   <div style={{ marginTop: '50px', borderTop: '2px dashed #cbd5e1', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                       <div>
                           <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Đã thanh toán / Total Paid</p>
                           <p style={{ fontSize: '40px', fontWeight: '900', color: 'var(--gold)', margin: 0 }}>{total.toLocaleString()} VNĐ</p>
                           <p style={{ fontSize: '14px', color: '#10b981', margin: '8px 0 0 0', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>Đã xác nhận / Confirmed</p>
                       </div>
                       <div style={{ width: '320px', height: '320px', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '10px', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                           <QRCodeCanvas value={`BOOKINGX_CHECKIN_TOKEN=${bookingQrToken || `BX-${bookingId}`}`} size={300} />
                       </div>
                   </div>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '30px 60px', textAlign: 'center', borderTop: '1px solid #e2e8f0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                   <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', margin: 0 }}>Vui lòng xuất trình Voucher này cùng với CCCD/Hộ chiếu khi làm thủ tục nhận phòng.</p>
                   <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', margin: '5px 0 0 0' }}>Please present this voucher along with your ID/Passport upon check-in.</p>
                   <p style={{ fontSize: '12px', color: '#94a3b8', margin: '20px 0 0 0', fontWeight: '700', letterSpacing: '1px' }}>X-TRAVEL RESORT • VÕ NGUYÊN GIÁP, ĐÀ NẴNG • CONTACT@XTRAVEL.COM</p>
                </div>
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

function BookingSummary({ data, discountCode, setDiscountCode, handleApplyVoucher, voucherMessage, isValidatingVoucher }) {
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
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#475569', fontSize: '14px' }}>
               <span style={{ fontWeight: '600' }}>Giá phòng cơ bản</span>
               <span style={{ fontWeight: '800' }}>{data.baseRoomCharge.toLocaleString()} VNĐ</span>
             </div>
             {data.weekendSurcharge > 0 && (
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#475569', fontSize: '14px' }}>
                 <span style={{ fontWeight: '600' }}>Phụ thu cuối tuần (Thứ 7/CN +10%)</span>
                 <span style={{ fontWeight: '800', color: '#b45309' }}>+{data.weekendSurcharge.toLocaleString()} VNĐ</span>
               </div>
             )}
             {data.holidaySurcharge > 0 && (
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#475569', fontSize: '14px' }}>
                 <span style={{ fontWeight: '600' }}>Phụ thu lễ tết (+20%)</span>
                 <span style={{ fontWeight: '800', color: '#b45309' }}>+{data.holidaySurcharge.toLocaleString()} VNĐ</span>
               </div>
             )}
             {data.extraOccupantSurcharge > 0 && (
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#475569', fontSize: '14px' }}>
                 <span style={{ fontWeight: '600' }}>Phụ thu quá số người (+15%/người)</span>
                 <span style={{ fontWeight: '800', color: '#b45309' }}>+{data.extraOccupantSurcharge.toLocaleString()} VNĐ</span>
               </div>
             )}
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#475569', fontSize: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
               <span style={{ fontWeight: '700' }}>Thành tiền chưa giảm</span>
               <span style={{ fontWeight: '800' }}>{data.subtotal.toLocaleString()} VNĐ</span>
             </div>
             {data.discountAmount > 0 && (
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#16a34a', fontSize: '14px' }}>
                 <span style={{ fontWeight: '700' }}>Tổng giảm giá</span>
                 <span style={{ fontWeight: '800' }}>-{data.discountAmount.toLocaleString()} VNĐ</span>
               </div>
             )}
             
             {/* Voucher Input */}
             <div style={{ marginTop: '25px', marginBottom: '25px', background: '#f8fafc', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
               <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Mã giảm giá (Voucher)</label>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <input 
                   type="text" 
                   value={discountCode} 
                   onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                   placeholder="NHẬP MÃ" 
                   style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', fontWeight: '700' }}
                 />
                 <button 
                   onClick={handleApplyVoucher}
                   disabled={isValidatingVoucher}
                   style={{ padding: '10px 15px', background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                 >
                   {isValidatingVoucher ? 'Đang check...' : 'ÁP DỤNG'}
                 </button>
               </div>
               {voucherMessage && (
                 <div style={{ fontSize: '11px', color: voucherMessage.includes('thành công') ? '#16a34a' : '#dc2626', fontWeight: '700', marginTop: '6px' }}>
                   {voucherMessage}
                 </div>
               )}
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '26px', fontWeight: '900', borderTop: '2px dashed #f1f5f9', paddingTop: '20px' }}>
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
