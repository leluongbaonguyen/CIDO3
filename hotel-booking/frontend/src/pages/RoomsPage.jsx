import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function RoomsPage() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    guests: searchParams.get('guests') || '',
    minPrice: '',
    maxPrice: '',
    checkin: searchParams.get('checkin') || '',
    checkout: searchParams.get('checkout') || '',
    roomType: 'ALL'
  });
  const [loading, setLoading] = useState(false);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.guests) params.append('guests', filters.guests);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.checkin) params.append('checkin', filters.checkin);
      if (filters.checkout) params.append('checkout', filters.checkout);

      const data = await api(`/rooms?${params.toString()}`);
      setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const displayedRooms = filters.roomType === 'ALL'
    ? rooms
    : rooms.filter(r => r.room_type_name?.toLowerCase().includes(filters.roomType.toLowerCase()));

  const getImageUrl = (photoUrls) => {
    try {
      if (!photoUrls) return 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80';
      const parsed = JSON.parse(photoUrls);
      return parsed[0] || 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80';
    } catch (e) {
      return photoUrls; // In case it's a raw string
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>

      <div className="card" style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-surface)' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-dark)' }}>Tìm kiếm phòng</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Từ khóa</label>
            <input type="text" placeholder="VD: Standard, Deluxe..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Ngày nhận phòng</label>
            <input type="date" value={filters.checkin} onChange={(e) => setFilters({ ...filters, checkin: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Ngày trả phòng</label>
            <input type="date" value={filters.checkout} onChange={(e) => setFilters({ ...filters, checkout: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Số khách</label>
            <input type="number" min="1" placeholder="VD: 2" value={filters.guests} onChange={(e) => setFilters({ ...filters, guests: e.target.value })} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '8px' }}>Lọc theo loại phòng</label>
            <select value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })} style={{ width: '100%' }}>
              <option value="ALL">Tất cả loại phòng</option>
              <option value="Standard">Standard (Tiêu chuẩn)</option>
              <option value="Superior">Superior (Nâng cao)</option>
              <option value="Deluxe">Deluxe (Sang trọng)</option>
              <option value="Suite">Suite (Cao cấp)</option>
            </select>
          </div>
          <button onClick={loadRooms} disabled={loading} style={{ backgroundColor: 'var(--secondary)', color: '#fff', border: 'none', padding: '12px 32px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer', height: '48px', fontWeight: '600', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = 'var(--secondary-hover)'} onMouseLeave={e => e.target.style.backgroundColor = 'var(--secondary)'}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', color: 'var(--text-dark)' }}>Kết quả tìm kiếm ({displayedRooms.length})</h3>
      </div>

      {displayedRooms.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--border-light)' }}></i>
          <h3>Không tìm thấy phòng nào phù hợp</h3>
          <p>Hãy thử thay đổi tiêu chí tìm kiếm hoặc xóa bộ lọc.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {displayedRooms.map((room) => (
            <div key={room.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <Link to={`/rooms/${room.id}`}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={getImageUrl(room.photo_urls)}
                    alt={room.room_type_name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  {room.status === 'AVAILABLE' && (
                    <span className="badge badge-green" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '12px' }}>Phòng trống</span>
                  )}
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 200px)' }}>
                  <h3 style={{ fontSize: '16px', color: 'var(--text-dark)', margin: '0 0 8px 0', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {room.room_type_name || 'Phòng Standard'}
                  </h3>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <i className="fas fa-users" style={{ color: 'var(--text-light)' }}></i> {room.max_occupancy || 2} khách
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Giá / đêm / phòng</span>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--secondary)' }}>
                        {Number(room.base_price || 0).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
