import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: user?.first_name || '',
    phone: '',
    email: user?.email || '',
    guestName: '',
  });

  const selectedRoom = {
    title: 'Deluxe Ocean View - Standard',
    id: 'XT-' + Math.floor(Math.random() * 9000 + 1000),
    price: 3600000,
    tax: 360000,
    total: 3960000,
    checkIn: '15 Th05 2026',
    checkOut: '17 Th05 2026',
    nights: 2
  };

  const handleNext = () => setStep(step + 1);

  // --- GIAO DIỆN BƯỚC 1: ĐIỀN THÔNG TIN ---
  if (step === 1) {
    return (
      <div style={{ backgroundColor: '#f5f6f7', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}> {/* CĂN GIỮA Ở ĐÂY */}
          <Progress step={1} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', marginTop: '40px' }}>
             <div className="animate-left">
                <Section title="Thông tin liên hệ" icon="far fa-envelope">
                   <BookingInput label="Họ tên*" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                      <BookingInput label="Số điện thoại*" placeholder="+84" onChange={(v) => setFormData({...formData, phone: v})} />
                      <BookingInput label="Email*" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
                   </div>
                </Section>
                <Section title="Thông tin khách" icon="far fa-user">
                   <BookingInput label="Họ tên khách*" placeholder="Nhập tên người lưu trú" onChange={(v) => setFormData({...formData, guestName: v})} />
                </Section>
                <button onClick={handleNext} style={primaryBtnStyle}>Tiếp tục</button>
             </div>
             <div className="animate-right">
                <BookingSummary data={selectedRoom} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN BƯỚC 2: THANH TOÁN ---
  if (step === 2) {
    return (
      <div style={{ backgroundColor: '#f5f6f7', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}> {/* CĂN GIỮA Ở ĐÂY */}
          <Progress step={2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', marginTop: '40px' }}>
             <div className="animate-left">
                <Section title="Phương thức thanh toán" icon="fas fa-credit-card">
                   <PaymentOption icon="fas fa-qrcode" title="QR Code / MoMo / ZaloPay" active />
                   <PaymentOption icon="fas fa-university" title="Chuyển khoản ngân hàng" />
                   <PaymentOption icon="far fa-credit-card" title="Thẻ Visa / Mastercard" />
                </Section>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=XTRAVEL-PAYMENT-${selectedRoom.id}`} alt="QR" style={{ width: '250px', marginBottom: '20px' }} />
                   <p style={{ fontWeight: '800', fontSize: '20px', color: '#1a1a1a' }}>Quét mã để thanh toán</p>
                   <p style={{ color: '#666', marginTop: '10px', fontSize: '15px' }}>Số tiền: <span style={{ color: '#ff5a3d', fontWeight: '900', fontSize: '18px' }}>{selectedRoom.total.toLocaleString()} VNĐ</span></p>
                </div>
                <button onClick={handleNext} style={{ ...primaryBtnStyle, background: '#10b981', marginTop: '30px' }}>Xác nhận đã thanh toán</button>
             </div>
             <div className="animate-right">
                <BookingSummary data={selectedRoom} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN BƯỚC 3: THÀNH CÔNG ---
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}> {/* VOUCHER CŨNG CĂN GIỮA */}
        <div className="animate-zoom" style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }}>
           <div style={{ background: '#10b981', padding: '40px', color: '#fff', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', fontSize: '40px' }}>
                 <i className="fas fa-check"></i>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800' }}>Thanh toán thành công!</h2>
              <p style={{ opacity: 0.9, marginTop: '10px' }}>Mã đặt chỗ của bạn: <strong>{selectedRoom.id}</strong></p>
           </div>
           <div style={{ padding: '50px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
                 <div>
                    <img src="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400" style={{ width: '100%', borderRadius: '12px' }} alt="Room" />
                 </div>
                 <div>
                    <DetailItem label="Hạng phòng" value={selectedRoom.title} />
                    <DetailItem label="Nhận phòng" value={selectedRoom.checkIn} />
                    <DetailItem label="Trả phòng" value={selectedRoom.checkOut} />
                    <DetailItem label="Khách lưu trú" value={formData.guestName || formData.name} />
                    <div style={{ borderTop: '2px dashed #eee', paddingTop: '20px', marginTop: '20px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '900' }}>
                          <span>Tổng cộng</span>
                          <span style={{ color: '#ff5a3d' }}>{selectedRoom.total.toLocaleString()} VNĐ</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div style={{ marginTop: '50px', display: 'flex', gap: '15px' }}>
                 <button onClick={() => window.print()} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '2px solid #0070f3', color: '#0070f3', fontWeight: '800', cursor: 'pointer', background: '#fff' }}>In Voucher</button>
                 <button onClick={() => navigate('/')} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: '#0070f3', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Về Trang Chủ</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Helper components giữ nguyên but refined padding
function Progress({ step }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
       <Step num={1} label="Thông tin" active={step >= 1} />
       <div style={{ width: '60px', height: '2px', background: step > 1 ? '#0070f3' : '#ddd' }}></div>
       <Step num={2} label="Thanh toán" active={step >= 2} />
       <div style={{ width: '60px', height: '2px', background: step > 2 ? '#0070f3' : '#ddd' }}></div>
       <Step num={3} label="Hoàn tất" active={step >= 3} />
    </div>
  );
}

function Step({ num, label, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: active ? 1 : 0.5 }}>
       <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: active ? '#0070f3' : '#888', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800' }}>{num}</div>
       <span style={{ fontWeight: '700', fontSize: '15px' }}>{label}</span>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
       <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className={icon} style={{ color: '#0070f3' }}></i> {title}
       </h3>
       {children}
    </div>
  );
}

function BookingInput({ label, value, placeholder, onChange }) {
  return (
    <div style={{ marginBottom: '18px' }}>
       <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>{label}</label>
       <input 
         type="text" 
         defaultValue={value} 
         placeholder={placeholder}
         onChange={(e) => onChange?.(e.target.value)}
         style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1.5px solid #eee', fontSize: '14px', outline: 'none' }} 
       />
    </div>
  );
}

function BookingSummary({ data }) {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.08)', position: 'sticky', top: '100px' }}>
       <div style={{ padding: '30px', background: '#f8fafc', borderBottom: '1px solid #eee' }}>
          <h4 style={{ fontWeight: '800', fontSize: '18px' }}>{data.title}</h4>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>XTRAVEL Premium Resort</p>
       </div>
       <div style={{ padding: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
             <div><p style={{ fontSize: '11px', color: '#888', fontWeight: '800' }}>NHẬN PHÒNG</p><p style={{ fontWeight: '700' }}>{data.checkIn}</p></div>
             <div><p style={{ fontSize: '11px', color: '#888', fontWeight: '800' }}>TRẢ PHÒNG</p><p style={{ fontWeight: '700' }}>{data.checkOut}</p></div>
          </div>
          <div style={{ borderTop: '2px dashed #eee', paddingTop: '25px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span>Giá phòng</span><span style={{ fontWeight: '700' }}>{data.price.toLocaleString()} VNĐ</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}><span>Thuế & Phí</span><span style={{ fontWeight: '700' }}>{data.tax.toLocaleString()} VNĐ</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: '900' }}><span>Tổng cộng</span><span style={{ color: '#ff5a3d' }}>{data.total.toLocaleString()} VNĐ</span></div>
          </div>
       </div>
    </div>
  );
}

function PaymentOption({ icon, title, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '12px', border: active ? '2px solid #0070f3' : '1.5px solid #eee', marginBottom: '15px', cursor: 'pointer', background: active ? '#f0f7ff' : '#fff' }}>
       <i className={icon} style={{ fontSize: '22px', color: active ? '#0070f3' : '#666' }}></i>
       <span style={{ fontWeight: '700', fontSize: '16px' }}>{title}</span>
       {active && <i className="fas fa-check-circle" style={{ marginLeft: 'auto', color: '#0070f3' }}></i>}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div style={{ marginBottom: '20px' }}>
       <p style={{ fontSize: '11px', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>{label}</p>
       <p style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>{value}</p>
    </div>
  );
}

const primaryBtnStyle = {
  width: '100%', background: '#0070f3', color: '#fff', border: 'none', padding: '20px', 
  borderRadius: '50px', fontWeight: '800', fontSize: '18px', cursor: 'pointer', transition: '0.3s',
  boxShadow: '0 10px 25px rgba(0,112,243,0.3)'
};
