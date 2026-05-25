import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getRoomDetail } from '../api/roomApi';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy params từ URL nếu có (từ trang danh sách)
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const adults = searchParams.get('adults') || '2';
  const children = searchParams.get('children') || '0';

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
        try {
            setLoading(true);
            const data = await getRoomDetail(id);
            setRoom(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchDetail();
  }, [id]);

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
        alert('Vui lòng chọn ngày nhận và trả phòng.');
        return;
    }
    navigate(`/booking?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`);
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

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#c4a661', background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải không gian nghỉ dưỡng...</div>;
  if (error) return <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '80px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', fontSize: '14px', fontWeight: '600' }}>
          <Link to="/rooms" style={{ color: '#c4a661', textDecoration: 'none' }}><i className="fas fa-arrow-left"></i> Quay lại danh sách phòng</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '50px' }}>
          <div className="animate-left">
            <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', height: '550px', marginBottom: '30px' }}>
              <img src={getDisplayImage(room.photo_urls)} alt={room.room_type_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '25px', fontFamily: '"Playfair Display", serif' }}>Trải nghiệm {room.room_type_name}</h2>
              <p style={{ color: '#4b5563', lineHeight: '2.1', fontSize: '18px', marginBottom: '35px' }}>{room.description || 'Phòng nghỉ sang trọng với đầy đủ tiện nghi hiện đại.'}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <InfoItem icon="fa-expand" label="Diện tích" value="45m² - 250m²" />
                <InfoItem icon="fa-eye" label="Tầm nhìn" value="Đà Nẵng & Biển Mỹ Khê" />
                <InfoItem icon="fa-bed" label="Loại giường" value="King / Twin Size" />
                <InfoItem icon="fa-users" label="Sức chứa" value={`Tối đa ${room.max_occupancy} khách`} />
              </div>
            </div>

            {room.amenities && room.amenities.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginTop: '30px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '25px', fontFamily: '"Playfair Display", serif' }}>Tiện ích cao cấp đi kèm</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {room.amenities.map(amenity => (
                    <div key={amenity.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', borderRadius: '15px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(196, 166, 97, 0.1)', color: 'var(--gold)' }}>
                        <i className={`fas ${amenity.icon || 'fa-check-circle'}`} style={{ fontSize: '16px' }}></i>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="animate-right">
            <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', position: 'sticky', top: '120px' }}>
              <span style={{ color: '#c4a661', fontWeight: '800', fontSize: '12px', letterSpacing: '2px' }}>GIÁ ƯU ĐÃI</span>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#1a1a1a', margin: '10px 0 30px' }}>{Number(room.base_price).toLocaleString()} <span style={{ fontSize: '16px', fontWeight: '600' }}>VNĐ/ĐÊM</span></div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#666', marginBottom: '12px' }}>NGÀY LƯU TRÚ</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#888', fontWeight: '800' }}>NHẬN PHÒNG</span>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#888', fontWeight: '800' }}>TRẢ PHÒNG</span>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee' }} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleBooking} 
                style={{ width: '100%', background: 'var(--gold)', color: '#fff', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 30px rgba(196, 166, 97, 0.3)' }}
              >
                ĐẶT PHÒNG NGAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#fcf8ec', color: '#c4a661', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}><i className={`fas ${icon}`}></i></div>
      <div>
        <span style={{ fontSize: '11px', color: '#888', fontWeight: '700', textTransform: 'uppercase' }}>{label}</span>
        <p style={{ fontWeight: '700', color: '#1a1a1a', fontSize: '16px' }}>{value}</p>
      </div>
    </div>
  );
}
