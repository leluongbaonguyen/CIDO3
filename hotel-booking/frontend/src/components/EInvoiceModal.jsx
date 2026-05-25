import React from 'react';

// Advanced Vietnamese Number to Words Conversion
function numberToVietnameseWords(num) {
  if (!num || num === 0) return 'Không đồng chẵn';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const places = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  
  let str = '';
  let i = 0;
  
  const readGroup = (group) => {
    let read = '';
    const h = Math.floor(group / 100);
    const t = Math.floor((group % 100) / 10);
    const u = group % 10;
    
    if (h > 0) {
      read += units[h] + ' trăm ';
      if (t === 0 && u > 0) read += 'lẻ ';
    } else if (t > 0 || u > 0) {
      // For groups after the first one that might have 0 hundreds
      read += 'không trăm ';
      if (t === 0 && u > 0) read += 'lẻ ';
    }
    
    if (t > 0) {
      if (t === 1) read += 'mười ';
      else read += units[t] + ' mươi ';
    }
    
    if (u > 0) {
      if (t > 1 && u === 1) read += 'mốt';
      else if (t > 0 && u === 5) read += 'lăm';
      else read += units[u];
    }
    return read;
  };
  
  let temp = num;
  while (temp > 0) {
    const group = temp % 1000;
    if (group > 0 || i === 0) {
      const gStr = readGroup(group);
      str = gStr + ' ' + places[i] + ' ' + str;
    }
    temp = Math.floor(temp / 1000);
    i++;
  }
  
  // Format casing and clean up spaces
  str = str.trim().replace(/\s+/g, ' ');
  if (str.startsWith('không trăm lẻ ')) str = str.slice(14);
  if (str.startsWith('không trăm ')) str = str.slice(11);
  
  return str.charAt(0).toUpperCase() + str.slice(1) + ' đồng chẵn.';
}

export default function EInvoiceModal({ booking, onClose }) {
  const total = Number(booking.total_amount || booking.booking_amount || 0);
  const subtotal = Math.round(total / 1.1);
  const vat = total - subtotal;
  
  // Calculate nights
  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const diffTime = Math.abs(checkOut - checkIn);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const ratePerNight = Math.round(subtotal / nights);
  const isCompleted = booking.status === 'COMPLETED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      backgroundColor: 'rgba(15,23,42,0.7)',
      backdropFilter: 'blur(10px)',
      display: 'block',
      padding: '40px 20px', 
      overflowY: 'auto'
    }}>
      {/* Dynamic Printing Style rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-sheet, .invoice-sheet * {
            visibility: visible;
          }
          .invoice-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .invoice-actions {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Actions bar (hidden in print) */}
        <div className="invoice-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '15px 30px', borderRadius: '16px' }}>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: '800' }}>
            {isCompleted ? (
              <>
                <i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '10px' }}></i> HÓA ĐƠN ĐỎ ĐÃ KÝ SỐ ĐIỆN TỬ CHÍNH THỨC (VAT)
              </>
            ) : (
              <>
                <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--gold)', marginRight: '10px' }}></i> PHIẾU THU TẠM TÍNH (GUEST FOLIO - CHECK-IN RECEIPT)
              </>
            )}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} style={{ padding: '10px 20px', background: 'var(--gold)', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-print"></i> {isCompleted ? 'IN HÓA ĐƠN ĐỎ' : 'IN PHIẾU TẠM TÍNH'}
            </button>
            <button onClick={onClose} style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              ĐÓNG
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="invoice-sheet" style={{
          backgroundColor: '#fff', borderRadius: '24px', padding: '40px 50px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
          fontFamily: '"Times New Roman", Times, serif', color: '#000',
          position: 'relative', overflow: 'hidden'
        }}>
          
          {/* Watermark Logo */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '160px', color: '#f1f5f9', opacity: 0.15, fontWeight: '900', userSelect: 'none', pointerEvents: 'none', fontFamily: '"Playfair Display", serif' }}>
            BOOKING X
          </div>

          {/* 1. HEADER NATIONAL HEADING */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <h4 style={{ textTransform: 'uppercase', fontSize: '13px', margin: 0, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
              <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '3px 0 0 50px', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</p>
              
              <div style={{ marginTop: '15px', fontSize: '12px', lineHeight: '1.4' }}>
                <strong>Đơn vị cung cấp:</strong> CÔNG TY CP ĐẦU TƯ KHÁCH SẠN XTRAVEL<br />
                <strong>Mã số thuế (MST):</strong> 0109988776<br />
                <strong>Địa chỉ:</strong> 35 Trường Sa, P. Hòa Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.4' }}>
              {isCompleted ? (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444', margin: '0 0 5px 0' }}>HÓA ĐƠN GIÁ TRỊ GIA TĂNG</h3>
                  <span style={{ fontSize: '11px', fontStyle: 'italic' }}>(Hóa đơn điện tử gốc phát hành thuế)</span><br />
                  <strong>Mẫu số (Form):</strong> 01GTKT0/001<br />
                  <strong>Ký hiệu (Serial):</strong> XT/26P<br />
                  <strong>Số (Invoice No):</strong> BK-{booking.booking_code || booking.id}
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 5px 0' }}>PHIẾU THU TẠM TÍNH</h3>
                  <span style={{ fontSize: '11px', fontStyle: 'italic' }}>(Guest Folio - Check-in Bill)</span><br />
                  <strong>Mã booking:</strong> {booking.booking_code || booking.id}<br />
                  <strong>Ngày Check-in:</strong> {new Date(booking.check_in_date).toLocaleDateString()}<br />
                  <strong>Trạng thái:</strong> Tạm thu (Provisional)
                </>
              )}
            </div>
          </div>

          {/* 2. INVOICE TITLE */}
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
              {isCompleted ? 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG (GTGT)' : 'PHIẾU THU TẠM TÍNH (GUEST FOLIO)'}
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '12px', margin: '5px 0 0 0' }}>
              Ngày (Date) {new Date().getDate()} tháng (month) {new Date().getMonth() + 1} năm (year) {new Date().getFullYear()}
            </p>
          </div>

          {/* 3. BUYER DETAILS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px 30px', fontSize: '13px', marginBottom: '25px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div>
              <strong>Khách hàng (Customer):</strong> {booking.customer_name || 'Khách hàng vãng lai'}
            </div>
            <div>
              <strong>Số điện thoại:</strong> {booking.customer_phone || 'Chưa cập nhật'}
            </div>
            <div>
              <strong>Số CMND / CCCD:</strong> {booking.identity_number || booking.id_number || 'Chưa cập nhật'}
            </div>
            <div>
              <strong>Hình thức thanh toán:</strong> Chuyển khoản (Bank Transfer)
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong>Địa chỉ (Address):</strong> {booking.address || '35 Trường Sa, Quận Ngũ Hành Sơn, Đà Nẵng'}
            </div>
          </div>

          {/* 4. ITEM DETAILS TABLE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', marginBottom: '25px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', width: '45px' }}>STT</th>
                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Tên dịch vụ lưu trú (Accommodation Details)</th>
                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', width: '70px' }}>ĐVT</th>
                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', width: '70px' }}>Số lượng</th>
                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold', width: '110px' }}>Đơn giá (VND)</th>
                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold', width: '130px' }}>Thành tiền (VND)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>1</td>
                <td style={{ border: '1px solid #000', padding: '12px', lineHeight: '1.4' }}>
                  <strong>Dịch vụ lưu trú phòng:</strong> {booking.room_type_name}<br />
                  Số phòng (Room No): {booking.room_number || 'Tự động xếp'}<br />
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    (Thời gian lưu trú: {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()})
                  </span>
                </td>
                <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>Đêm</td>
                <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'center' }}>{nights}</td>
                <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'right' }}>{ratePerNight.toLocaleString()}</td>
                <td style={{ border: '1px solid #000', padding: '12px', textAlign: 'right' }}>{subtotal.toLocaleString()}</td>
              </tr>
              {/* Padding empty row */}
              <tr style={{ height: '40px' }}>
                <td style={{ border: '1px solid #000', padding: '12px' }}></td>
                <td style={{ border: '1px solid #000', padding: '12px' }}></td>
                <td style={{ border: '1px solid #000', padding: '12px' }}></td>
                <td style={{ border: '1px solid #000', padding: '12px' }}></td>
                <td style={{ border: '1px solid #000', padding: '12px' }}></td>
                <td style={{ border: '1px solid #000', padding: '12px' }}></td>
              </tr>
            </tbody>
          </table>

          {/* 5. PRICE CALCULATION AND TAX SUMMARY */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', fontSize: '13px', marginBottom: '35px' }}>
            <div style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <strong>Số tiền bằng chữ (In words):</strong><br />
              <span style={{ color: '#475569', fontWeight: 'bold' }}>{numberToVietnameseWords(total)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cộng tiền hàng (Subtotal):</span>
                <strong>{subtotal.toLocaleString()} VND</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Thuế suất GTGT (VAT Rate):</span>
                <strong>10%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiền thuế GTGT (VAT Amount):</span>
                <strong>{vat.toLocaleString()} VND</strong>
              </div>
              <div style={{ height: '1.5px', background: '#000', margin: '3px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>Tổng cộng thanh toán:</span>
                <strong style={{ color: '#ef4444', fontSize: '17px' }}>{total.toLocaleString()} VND</strong>
              </div>
            </div>
          </div>

          {/* 6. SIGNATURES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
            <div>
              <strong>NGƯỜI MUA HÀNG (Buyer)</strong><br />
              <span style={{ fontStyle: 'italic', fontSize: '11px' }}>(Ký, ghi rõ họ tên)</span>
              <div style={{ height: '90px' }}></div>
              <strong>{booking.customer_name || 'Khách hàng'}</strong>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {isCompleted ? (
                <>
                  <strong>NGƯỜI BÁN HÀNG (Seller)</strong><br />
                  <span style={{ fontStyle: 'italic', fontSize: '11px' }}>(Ký, đóng dấu điện tử)</span>
                  
                  {/* Digital Stamp Seal */}
                  <div style={{ 
                    border: '3px double #ef4444', borderRadius: '10px', color: '#ef4444',
                    padding: '8px 12px', fontSize: '10.5px', fontWeight: 'bold', width: '220px',
                    textAlign: 'center', textTransform: 'uppercase', transform: 'rotate(-4deg)',
                    margin: '20px 0', backgroundColor: 'rgba(239, 68, 68, 0.02)',
                    boxShadow: '0 0 10px rgba(239,68,68,0.05)'
                  }}>
                    <span style={{ fontSize: '11.5px' }}>✔ ĐÃ KÝ SỐ (SIGNED DIGITAL)</span><br />
                    CÔNG TY CP KHÁCH SẠN XTRAVEL<br />
                    Ký ngày: {new Date().toLocaleDateString('vi-VN')}
                  </div>
                  
                  <strong>LỄ TÂN TRƯỞNG</strong>
                </>
              ) : (
                <>
                  <strong>NGƯỜI THU TIỀN (Receptionist)</strong><br />
                  <span style={{ fontStyle: 'italic', fontSize: '11px' }}>(Ký, ghi rõ họ tên)</span>
                  <div style={{ height: '90px' }}></div>
                  <strong>NHÂN VIÊN LỄ TÂN</strong>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
