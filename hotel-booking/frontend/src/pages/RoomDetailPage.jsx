import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockRooms } from '../data/mockRooms';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Tìm phòng trong bộ dữ liệu 100 phòng
  const room = mockRooms.find(r => r.id === parseInt(id)) || mockRooms[0];

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setLoading(false), 500);
  }, [id]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#0070f3' }}>Đang tải không gian nghỉ dưỡng...</div>;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '80px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', fontSize: '14px', fontWeight: '600' }}>
          <Link to="/rooms" style={{ color: '#0070f3', textDecoration: 'none' }}><i className="fas fa-arrow-left"></i> Quay lại danh sách phòng</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '50px' }}>
          <div className="animate-left">
            <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', height: '550px', marginBottom: '30px' }}>
              <img src={room.img} alt={room.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '25px', fontFamily: '"Playfair Display", serif' }}>Trải nghiệm {room.baseName}</h2>
              <p style={{ color: '#4b5563', lineHeight: '2.1', fontSize: '18px', marginBottom: '35px' }}>{room.desc}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <InfoItem icon="fa-expand" label="Diện tích" value="45m² - 250m²" />
                <InfoItem icon="fa-eye" label="Tầm nhìn" value="Đà Nẵng & Biển Mỹ Khê" />
                <InfoItem icon="fa-bed" label="Loại giường" value="King / Twin Size" />
                <InfoItem icon="fa-snowflake" label="Tiện ích" value="Điều hòa, Minibar, Safe" />
              </div>
            </div>
          </div>

          <div className="animate-right">
            <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)', position: 'sticky', top: '120px' }}>
              <span style={{ color: '#c4a661', fontWeight: '800', fontSize: '12px', letterSpacing: '2px' }}>GIÁ ƯU ĐÃI</span>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#1a1a1a', margin: '10px 0 30px' }}>{room.price} <span style={{ fontSize: '16px', fontWeight: '600' }}>VNĐ</span></div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#666', marginBottom: '12px' }}>NGÀY LƯU TRÚ</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input type="date" className="premium-input" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }} />
                  <input type="date" className="premium-input" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }} />
                </div>
              </div>

              <button onClick={() => navigate('/booking')} style={{ width: '100%', background: '#ff5a3d', color: '#fff', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 30px rgba(255,90,61,0.3)' }}>ĐẶT PHÒNG NGAY</button>
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
      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f0f7ff', color: '#0070f3', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}><i className={`fas ${icon}`}></i></div>
      <div>
        <span style={{ fontSize: '11px', color: '#888', fontWeight: '700', textTransform: 'uppercase' }}>{label}</span>
        <p style={{ fontWeight: '700', color: '#1a1a1a', fontSize: '16px' }}>{value}</p>
      </div>
    </div>
  );
}
