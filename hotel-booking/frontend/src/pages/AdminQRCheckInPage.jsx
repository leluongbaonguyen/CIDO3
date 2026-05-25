import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import jsQR from 'jsqr';

export default function AdminQRCheckInPage() {
  const { user } = useAuth();
  const [errorType, setErrorType] = useState(''); // 'already_checked_in' | 'general_error' | 'camera_error' | ''
  const [generalError, setGeneralError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);

  // Initialize/Start the camera automatically on mount or when scanning becomes true
  useEffect(() => {
    if (!scanning) return;

    // Reset previous states
    setErrorType('');
    setGeneralError('');
    setSuccessBooking(null);
    setAlreadyCheckedIn(null);

    // Give the DOM a tiny moment to render the #reader div
    const timer = setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        (decodedText) => {
          // Play a scan beep sound or trigger vibration if supported
          if (navigator.vibrate) navigator.vibrate(100);
          
          html5QrCode.stop().then(() => {
            setScanning(false);
            handleQRResult(decodedText);
          }).catch(err => console.error("Lỗi khi dừng camera:", err));
        },
        (errorMessage) => {
          // Verbose qr parse errors are ignored
        }
      ).catch((err) => {
        console.error("Camera start failed:", err);
        setErrorType('camera_error');
        setScanning(false);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(err => console.log("Lỗi khi tắt camera:", err));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [scanning]);

  const handleQRCheckin = async (decodedText) => {
    try {
      const token = localStorage.getItem('token');
      
      // Định dạng ngày giờ quét YYYY-MM-DD HH:mm:ss
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const scanTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      let qrTokenVal = decodedText;
      try {
        const parsed = JSON.parse(decodedText);
        qrTokenVal = parsed.qrToken || parsed.qr_token || parsed.token || parsed.bookingCode || decodedText;
      } catch (e) {
        if (typeof decodedText === 'string') {
          const tokenMatch = decodedText.match(/BOOKINGX_CHECKIN_TOKEN=(.+)/i);
          if (tokenMatch) {
            qrTokenVal = tokenMatch[1];
          }
        }
      }

      if (!qrTokenVal) {
        setGeneralError('Mã QR không hợp lệ.');
        setErrorType('general_error');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/bookings/qr-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          qrToken: qrTokenVal,
          qrCode: decodedText,
          staffId: user?.id,
          scanTime: scanTime
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.message === 'Đơn đặt phòng này đã được check-in trước đó.') {
          setAlreadyCheckedIn({
            checkedInTime: data.checkedInTime,
            checkedInStaff: data.checkedInStaff,
            booking: data.booking
          });
          setErrorType('already_checked_in');
        } else {
          setGeneralError(data.message || 'Mã QR không hợp lệ hoặc lỗi hệ thống.');
          setErrorType('general_error');
        }
      } else {
        setSuccessBooking(data.booking);
        setErrorType('');
        // Stop scanning when successfully checked in
        setScanning(false);
      }
    } catch (err) {
      console.error(err);
      setGeneralError(err.message || 'Lỗi kết nối máy chủ backend.');
      setErrorType('general_error');
    }
  };

  const handleQRResult = async (result) => {
    console.log("QR đọc được:", result);
    await handleQRCheckin(result);
  };

  const handleUploadQRImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset previous states when uploading new image
    setSuccessBooking(null);
    setAlreadyCheckedIn(null);
    setGeneralError('');
    setErrorType('');

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Scale down large images (e.g. max 800px) to optimize QR detection accuracy and speed
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        // Safe resolution of default import function for UMD / CommonJS modules in Vite
        const qrCodeFn = typeof jsQR === 'function' ? jsQR : (jsQR.default || jsQR);
        const qrCode = qrCodeFn(
          imageData.data,
          imageData.width,
          imageData.height
        );

        if (!qrCode) {
          alert("Không đọc được mã QR từ ảnh. Vui lòng chọn ảnh rõ nét hơn.");
          setGeneralError("Không đọc được mã QR từ ảnh. Vui lòng chọn ảnh rõ nét hơn.");
          setErrorType('general_error');
          return;
        }

        console.log("QR đọc được từ ảnh:", qrCode.data);
        await handleQRCheckin(qrCode.data);
      } catch (err) {
        console.error("Lỗi khi xử lý giải mã QR từ ảnh:", err);
        setGeneralError("Lỗi hệ thống khi xử lý ảnh QR.");
        setErrorType('general_error');
      } finally {
        URL.revokeObjectURL(imageUrl);
      }
    };

    img.onerror = () => {
      alert("Không thể đọc ảnh. Vui lòng chọn ảnh khác.");
      setGeneralError("Không thể đọc ảnh. Vui lòng chọn ảnh khác.");
      setErrorType('general_error');
      URL.revokeObjectURL(imageUrl);
    };

    img.src = imageUrl;

    // Reset value so change event triggers even if the user selects the same file again
    event.target.value = '';
  };

  const resetScanner = () => {
    setSuccessBooking(null);
    setAlreadyCheckedIn(null);
    setGeneralError('');
    setErrorType('');
    setScanning(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleString('vi-VN');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @keyframes laserMove {
          0% { top: 4%; }
          50% { top: 96%; }
          100% { top: 4%; }
        }
        .laser-line {
          position: absolute;
          left: 4%;
          width: 92%;
          height: 3px;
          background: #10b981;
          box-shadow: 0 0 10px #10b981, 0 0 20px #10b981;
          animation: laserMove 2.5s infinite linear;
          z-index: 10;
        }
        .qr-reader video, #reader video {
          width: 100% !important;
          height: 420px !important;
          object-fit: cover !important;
        }
        .qr-box, .scanner-viewfinder {
          position: relative;
          overflow: hidden;
          background: #0f172a;
          border-radius: 20px;
          border: 4px solid #00c878;
          box-shadow: 0 0 20px rgba(0, 200, 120, 0.8);
          min-height: 420px;
        }
        .scanner-corners {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 11;
        }
        .scanner-corners::before,
        .scanner-corners::after,
        .scanner-corner-bl,
        .scanner-corner-br {
          position: absolute;
          width: 30px;
          height: 30px;
          border-color: #10b981;
          border-style: solid;
        }
        .scanner-corners::before {
          content: '';
          top: 20px;
          left: 20px;
          border-width: 4px 0 0 4px;
        }
        .scanner-corners::after {
          content: '';
          top: 20px;
          right: 20px;
          border-width: 4px 4px 0 0;
        }
        .scanner-corner-bl {
          bottom: 20px;
          left: 20px;
          border-width: 0 0 4px 4px;
        }
        .scanner-corner-br {
          bottom: 20px;
          right: 20px;
          border-width: 0 4px 4px 0;
        }
        .upload-qr-btn {
          display: inline-block;
          margin-top: 16px;
          padding: 12px 20px;
          background: #d6b85a;
          color: #111827;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          transition: 0.2s;
          width: 100%;
          border: 1px solid rgba(214, 184, 90, 0.3);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .upload-qr-btn:hover {
          background: #c9a94c;
          transform: translateY(-1px);
        }
        .booking-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media(max-width: 768px) {
          .booking-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header section */}
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className="fas fa-qrcode" style={{ color: 'var(--gold)' }}></i>
          Quét QR Check-in
        </h2>
        <p style={{ color: 'var(--gray)', fontSize: '15px' }}>
          Hệ thống Booking X - Quét mã QR trên voucher/phiếu đặt phòng của khách hàng để nhận phòng nhanh chóng.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
        
        {/* LEFT COLUMN: Camera/Scanner Container */}
        <div>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: scanning ? '#10b981' : '#ef4444', display: 'inline-block', animation: scanning ? 'pulse-skeleton 1.5s infinite' : 'none' }}></span>
              {scanning ? 'Camera đang hoạt động...' : 'Camera đã tắt'}
            </h3>

            {scanning ? (
              <div className="scanner-viewfinder qr-reader qr-box">
                <div id="reader" style={{ width: '100%', height: '100%', border: 'none' }}></div>
                <div className="laser-line"></div>
                <div className="scanner-corners">
                  <div className="scanner-corner-bl"></div>
                  <div className="scanner-corner-br"></div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '20px', padding: '60px 20px', textAlign: 'center' }}>
                {errorType === 'camera_error' ? (
                  <>
                    <div style={{ width: '70px', height: '70px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <i className="fas fa-video-slash" style={{ fontSize: '30px', color: '#ef4444' }}></i>
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Lỗi truy cập thiết bị</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '350px', margin: '0 auto 25px', lineHeight: '1.5' }}>
                      Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập hoặc thiết bị camera.
                    </p>
                    <button onClick={resetScanner} className="btn-gold" style={{ padding: '12px 25px', fontSize: '14px' }}>
                      <i className="fas fa-redo"></i> Cấp quyền & Thử lại
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ width: '70px', height: '70px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <i className="fas fa-camera" style={{ fontSize: '30px', color: '#10b981' }}></i>
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Đã hoàn tất quét mã</h4>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
                      Để tiếp tục xử lý voucher khác, vui lòng khởi động lại camera.
                    </p>
                    <button onClick={resetScanner} className="btn-gold" style={{ padding: '12px 25px', fontSize: '14px' }}>
                      <i className="fas fa-sync-alt"></i> Tiếp tục quét mới
                    </button>
                  </>
                )}
              </div>
            )}

            <div style={{ marginTop: '10px', marginBottom: '15px', textAlign: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadQRImage}
                style={{ display: 'none' }}
                id="qr-image-upload"
              />
              <label htmlFor="qr-image-upload" className="upload-qr-btn" style={{ marginTop: 0 }}>
                <i className="fas fa-upload" style={{ marginRight: '8px' }}></i>
                Tải ảnh QR lên để quét
              </label>
            </div>

            <div style={{ marginTop: '20px', background: 'var(--gold-light)', padding: '15px', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p style={{ fontSize: '13px', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <i className="fas fa-info-circle"></i>
                Lưu ý: Hướng camera trực tiếp vào mã QR trên điện thoại hoặc bản in voucher của khách hàng. Hãy chắc chắn phòng quét đủ ánh sáng.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Details Card */}
        <div>
          <div style={{ background: '#fff', padding: '35px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', minHeight: '430px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div>
              {/* 1. INITIAL WAITING STATE */}
              {!errorType && !successBooking && (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
                  <div style={{ animation: 'pulse-skeleton 2s infinite', display: 'inline-block', marginBottom: '20px' }}>
                    <i className="fas fa-qrcode" style={{ fontSize: '70px', color: 'var(--gold)', opacity: 0.8 }}></i>
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Đang chờ mã QR...</h4>
                  <p style={{ fontSize: '14px', maxWidth: '380px', margin: '0 auto', lineHeight: '1.6' }}>
                    Hãy hướng camera vào mã QR trên Voucher của khách hàng
                  </p>
                </div>
              )}

              {/* 2. SUCCESS CHECK-IN STATE */}
              {successBooking && (
                <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                  <div style={{ background: '#d1fae5', border: '1px solid #10b981', color: '#065f46', padding: '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '28px', color: '#10b981' }}></i>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '800' }}>Check-in thành công.</h4>
                      <p style={{ fontSize: '13px', opacity: 0.9 }}>Hệ thống đã tự động xác nhận khách nhận phòng và cập nhật trạng thái.</p>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    Thông tin đơn đặt phòng
                  </h3>

                  <div className="booking-info-grid" style={{ marginBottom: '25px' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã đơn đặt phòng</p>
                      <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--gold-dark)' }}>{successBooking.booking_code}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trạng thái check-in</p>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: '#d1fae5', color: '#065f46', borderRadius: '6px', fontWeight: '800', fontSize: '12px', marginTop: '4px' }}>
                        Đã nhận phòng
                      </span>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Khách hàng</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{successBooking.customer_name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Số điện thoại</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{successBooking.phone}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Loại phòng</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{successBooking.room_type_name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phòng được gán</p>
                      <p style={{ fontWeight: '800', fontSize: '16px', color: '#1e293b' }}>
                        <i className="fas fa-door-open" style={{ marginRight: '6px', color: 'var(--gold)' }}></i>
                        Phòng {successBooking.room_number}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày nhận phòng</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{formatDate(successBooking.check_in_date)}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày trả phòng</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{formatDate(successBooking.check_out_date)}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng thanh toán</p>
                      <p style={{ fontWeight: '800', fontSize: '16px', color: '#1e293b' }}>{formatCurrency(successBooking.total_amount)}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phương thức</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{successBooking.payment_method}</p>
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #475569' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Check-in lúc:</span> <strong style={{ color: '#334155' }}>{formatTime(successBooking.scan_time)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Nhân viên thực hiện:</span> <strong style={{ color: '#334155' }}>{successBooking.staff_name}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. EXCEPTION STATE: ALREADY CHECKED IN */}
              {errorType === 'already_checked_in' && alreadyCheckedIn && (
                <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                  <div style={{ background: '#fef3c7', border: '1px solid #d97706', color: '#92400e', padding: '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '28px', color: '#d97706' }}></i>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: '800' }}>Đơn đặt phòng này đã được check-in trước đó.</h4>
                      <p style={{ fontSize: '13px', opacity: 0.9 }}>Không thể thực hiện check-in lặp lại cho đơn hàng này.</p>
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '15px', borderRadius: '12px', marginBottom: '25px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#b45309', marginBottom: '8px' }}>Thông tin check-in trước đó:</h5>
                    <ul style={{ fontSize: '13.5px', color: '#92400e', paddingLeft: '20px', lineHeight: '1.6' }}>
                      <li>Thời gian check-in: <strong>{formatTime(alreadyCheckedIn.checkedInTime)}</strong></li>
                      <li>Nhân viên thực hiện: <strong>{alreadyCheckedIn.checkedInStaff}</strong></li>
                    </ul>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '20px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    Thông tin đơn đặt phòng
                  </h3>

                  <div className="booking-info-grid">
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Mã đơn đặt phòng</p>
                      <p style={{ fontWeight: '850', fontSize: '16px', color: '#475569' }}>{alreadyCheckedIn.booking.booking_code}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Trạng thái</p>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontWeight: '800', fontSize: '12px', marginTop: '4px' }}>
                        Đang ở phòng ({alreadyCheckedIn.booking.status})
                      </span>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Khách hàng</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{alreadyCheckedIn.booking.customer_name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Số điện thoại</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{alreadyCheckedIn.booking.phone}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Loại phòng</p>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{alreadyCheckedIn.booking.room_type_name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Số phòng</p>
                      <p style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>Phòng {alreadyCheckedIn.booking.room_number}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. OTHER GENERAL ERRORS */}
              {errorType === 'general_error' && (
                <div style={{ animation: 'fadeInUp 0.5s ease-out', textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: '70px', height: '70px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <i className="fas fa-times-circle" style={{ fontSize: '38px', color: '#ef4444' }}></i>
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444', marginBottom: '15px' }}>Thao tác check-in thất bại</h4>
                  <p style={{ color: '#334155', fontSize: '16px', fontWeight: '600', maxWidth: '400px', margin: '0 auto 25px', lineHeight: '1.6', background: '#fff1f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                    {generalError}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: '1.5' }}>
                    Vui lòng bấm nút dưới đây hoặc khởi động lại camera để quét lại voucher khác hoặc kiểm tra tình trạng đơn trong danh sách đặt phòng.
                  </p>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            {(!scanning && errorType !== 'camera_error') && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
                <button onClick={resetScanner} className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px' }}>
                  <i className="fas fa-qrcode"></i> QUÉT VOUCHER KHÁC
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
