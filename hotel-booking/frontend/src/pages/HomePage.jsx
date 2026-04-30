import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('hotels');
  const [rooms, setRooms] = useState([]);
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    checkin: '',
    checkout: '',
    guests: 1
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await api('/rooms');
        // Group by room_type to show unique room types on homepage
        const uniqueTypes = [];
        const map = new Map();
        for (const item of data) {
          if (!map.has(item.room_type_id)) {
            map.set(item.room_type_id, true);
            uniqueTypes.push({
              id: item.id,
              name: item.room_type_name,
              image: item.photo_urls ? JSON.parse(item.photo_urls)[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&w=600&q=80',
              location: 'Việt Nam',
              rating: 4.8,
              reviews: Math.floor(Math.random() * 1000) + 100,
              price: new Intl.NumberFormat('vi-VN').format(item.base_price)
            });
          }
        }
        setRooms(uniqueTypes.slice(0, 4)); // Show max 4
      } catch (e) {
        console.error("Failed to fetch rooms:", e);
      }
    };
    fetchRooms();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.keyword) params.append('keyword', searchForm.keyword);
    if (searchForm.checkin) params.append('checkin', searchForm.checkin);
    if (searchForm.checkout) params.append('checkout', searchForm.checkout);
    if (searchForm.guests) params.append('guests', searchForm.guests);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', height: '600px', backgroundColor: 'var(--primary)', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1582610116397-edb318620f90?w=1600&q=80" alt="XTRAVEL Resort Pool" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)' }}></div>
        <div className="container" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
          <h1 style={{ color: '#fff', fontSize: '64px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '2px 4px 8px rgba(0,0,0,0.4)', margin: 0, lineHeight: '1.2' }}>XTRAVEL</h1>
          <h2 style={{ color: '#fff', fontSize: '48px', fontWeight: '600', textShadow: '2px 4px 8px rgba(0,0,0,0.4)', margin: '10px 0 0 0', lineHeight: '1.2' }}>Kính Chào Quý Khách</h2>
        </div>
      </section>

      {/* Search Widget */}
      <section className="container" style={{ position: 'relative', marginTop: '-150px', zIndex: 10 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', padding: '24px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '10px' }}>
            <div onClick={() => setActiveTab('hotels')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 'hotels' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'hotels' ? '600' : '500', position: 'relative' }}>
              <i className="fas fa-bed"></i> Đặt phòng
              {activeTab === 'hotels' && <div style={{ position: 'absolute', bottom: '-11px', left: 0, right: 0, height: '3px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>}
            </div>
            <div onClick={() => setActiveTab('restaurants')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 'restaurants' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'restaurants' ? '600' : '500', position: 'relative' }}>
              <i className="fas fa-utensils"></i> Nhà hàng & Dịch vụ
              {activeTab === 'restaurants' && <div style={{ position: 'absolute', bottom: '-11px', left: 0, right: 0, height: '3px', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>}
            </div>
          </div>

          {/* Search Inputs */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Hạng phòng bạn muốn tìm?</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}></i>
                <input type="text" placeholder="VD: Standard, Deluxe, Suite..." value={searchForm.keyword} onChange={e => setSearchForm({...searchForm, keyword: e.target.value})} style={{ width: '100%', paddingLeft: '40px !important' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Nhận phòng</label>
              <input type="date" value={searchForm.checkin} onChange={e => setSearchForm({...searchForm, checkin: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Trả phòng</label>
              <input type="date" value={searchForm.checkout} onChange={e => setSearchForm({...searchForm, checkout: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Số Khách</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-user" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}></i>
                <input type="number" min="1" value={searchForm.guests} onChange={e => setSearchForm({...searchForm, guests: e.target.value})} style={{ width: '100%', paddingLeft: '40px !important' }} />
              </div>
            </div>
            <div>
              <button onClick={handleSearch} style={{ backgroundColor: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', height: '48px', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = 'var(--secondary-hover)'} onMouseLeave={e => e.target.style.backgroundColor = 'var(--secondary)'}>
                <i className="fas fa-search"></i> Tìm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Hotels */}
      <section className="container" style={{ marginTop: '60px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '8px' }}>Các Hạng Phòng Nổi Bật Tại XTRAVEL</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Trải nghiệm dịch vụ lưu trú 5 sao với mức giá ưu đãi nhất.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {rooms.map(room => (
            <div key={room.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <Link to={`/rooms/${room.id}`}>
                <div style={{ position: 'relative' }}>
                  <img src={room.image} alt={room.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow-sm)' }}>
                    <i className="fas fa-star" style={{ color: '#f59e0b' }}></i> {room.rating}
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</h3>
                  <div style={{ color: 'var(--text-light)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    <i className="fas fa-building"></i> XTRAVEL Hotel
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({room.reviews} đánh giá)</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--secondary)' }}>{room.price} ₫</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
          {rooms.length === 0 && (
             <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Không có hạng phòng nào lúc này.
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
