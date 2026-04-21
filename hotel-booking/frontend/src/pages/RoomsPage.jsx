import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    guests: '',
    minPrice: '',
    maxPrice: '',
    checkin: '',
    checkout: '',
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

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>

      <div className="card" style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-main)' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-dark)' }}>Tìm kiếm phòng</h2>
        <div className="grid3">
          <div className="input-group">
            <label className="input-label">Ngày nhận phòng</label>
            <input type="date" className="search-input" value={filters.checkin} onChange={(e) => setFilters({ ...filters, checkin: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Ngày trả phòng</label>
            <input type="date" className="search-input" value={filters.checkout} onChange={(e) => setFilters({ ...filters, checkout: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Số lượng khách</label>
            <input type="number" min="1" className="search-input" placeholder="VD: 2" value={filters.guests} onChange={(e) => setFilters({ ...filters, guests: e.target.value })} />
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="input-label">Lọc theo loại phòng</label>
            <select className="search-input" value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}>
              <option value="ALL">Tất cả loại phòng</option>
              <option value="Standard">Standard (Tiêu chuẩn)</option>
              <option value="Superior">Superior (Nâng cao)</option>
              <option value="Deluxe">Deluxe (Sang trọng)</option>
              <option value="Suite">Suite (Cao cấp)</option>
            </select>
          </div>
          <button className="btn" onClick={loadRooms} disabled={loading} style={{ padding: '12px 32px', fontSize: '16px' }}>
            {loading ? 'Đang tìm...' : 'Tìm phòng trống'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3>Danh sách phòng trống ({displayedRooms.length})</h3>
      </div>

      {displayedRooms.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <h3>Rất tiếc, không tìm thấy phòng nào phù hợp với yêu cầu của bạn.</h3>
          <p>Hãy thử thay đổi ngày hoặc bộ lọc khác.</p>
        </div>
      ) : (
        <div className="room-grid">
          {displayedRooms.map((room) => (
            <article key={room.id} className="card room-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={room.photo_urls || `https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80`}
                  alt={room.room_type_name}
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
                {room.status === 'AVAILABLE' && (
                  <span className="badge badge-green" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '12px' }}>Phòng trống</span>
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', margin: 0 }}>
                    {room.room_type_name || 'Phòng Standard'} - {room.room_number}
                  </h3>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', gap: '12px' }}>
                  <span>Tầng: {room.floor}</span> • <span>Sức chứa: Tối đa {room.max_occupancy || 2} khách</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Giá mỗi đêm</span>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--secondary)' }}>
                      {Number(room.base_price || 0).toLocaleString('vi-VN')} VND
                    </div>
                  </div>
                  <Link className="btn" to={`/rooms/${room.id}`} style={{ padding: '10px 20px', fontSize: '14px' }}>
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
