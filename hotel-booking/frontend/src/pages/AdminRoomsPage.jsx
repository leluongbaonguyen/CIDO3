import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);

  // Reset pagination when search changes
  useEffect(() => {
    setVisibleCount(10);
    setIsScrollingLoading(false);
  }, [search]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingLoading || visibleCount >= filteredRooms.length || loading) return;
      
      const threshold = 100;
      const totalHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;
      
      if (totalHeight - scrollPosition < threshold) {
        setIsScrollingLoading(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 10);
          setIsScrollingLoading(false);
        }, 800);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollingLoading, visibleCount, rooms.length, loading, search]);
  const [formData, setFormData] = useState({
    room_number: '',
    floor: 1,
    status: 'AVAILABLE',
    room_type_id: '',
    notes: ''
  });

  const load = async () => {
    try {
        setLoading(true);
        const data = await api('/admin/rooms');
        setRooms(data);
        const types = await api('/admin/room-types');
        setRoomTypes(types);
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        room_number: room.room_number,
        floor: room.floor,
        status: room.status,
        room_type_id: room.room_type_id,
        notes: room.notes || ''
      });
    } else {
      setEditingRoom(null);
      setFormData({
        room_number: '',
        floor: 1,
        status: 'AVAILABLE',
        room_type_id: roomTypes[0]?.id || '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api(`/admin/rooms/${editingRoom.id}`, { method: 'PUT', body: formData });
      } else {
        await api('/admin/rooms', { method: 'POST', body: formData });
      }
      setShowModal(false);
      load();
    } catch (error) {
      alert('Lỗi lưu dữ liệu: ' + error.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
      try {
          await api(`/admin/rooms/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
          load();
      } catch (error) {
          alert('Lỗi cập nhật trạng thái');
      }
  };

  const filteredRooms = rooms.filter(r => 
    r.room_number?.toString().includes(search) || 
    r.room_type_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getDisplayStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE': return <span style={{ padding: '6px 12px', borderRadius: '50px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '800' }}>TRỐNG</span>;
      case 'BOOKED': return <span style={{ padding: '6px 12px', borderRadius: '50px', background: '#e0f2fe', color: '#0ea5e9', fontSize: '11px', fontWeight: '800' }}>ĐÃ ĐẶT</span>;
      case 'OCCUPIED': return <span style={{ padding: '6px 12px', borderRadius: '50px', background: '#f3e8ff', color: '#7e22ce', fontSize: '11px', fontWeight: '800' }}>ĐANG Ở</span>;
      case 'CLEANING': return <span style={{ padding: '6px 12px', borderRadius: '50px', background: '#ffedd5', color: '#9a3412', fontSize: '11px', fontWeight: '800' }}>ĐANG DỌN</span>;
      case 'MAINTENANCE': return <span style={{ padding: '6px 12px', borderRadius: '50px', background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: '800' }}>BẢO TRÌ</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Quản lý phòng nghỉ</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Kiểm soát trạng thái thực tế và tình trạng đặt chỗ.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-premium">
          <i className="fas fa-plus"></i> Khởi tạo phòng mới
        </button>
      </div>

      <div className="premium-table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <div style={{ position: 'relative' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" placeholder="Tìm số phòng, tầng hoặc loại..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: '350px', paddingLeft: '44px', background: '#f8fafc' }} 
              />
           </div>
           <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Tổng số: {filteredRooms.length} phòng</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Số phòng</th>
              <th>Hạng phòng</th>
              <th>Vận hành</th>
              <th>Tình trạng</th>
              <th>Khách hiện tại</th>
              <th style={{ textAlign: 'center' }}>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="table-row">
                  <td>
                    <div className="skeleton-pulse" style={{ width: '80px', height: '20px' }}></div>
                  </td>
                  <td>
                    <div className="skeleton-pulse" style={{ width: '150px', height: '20px' }}></div>
                  </td>
                  <td>
                    <div className="skeleton-pulse" style={{ width: '100px', height: '24px', borderRadius: '8px' }}></div>
                  </td>
                  <td>
                    <div className="skeleton-pulse" style={{ width: '70px', height: '20px', borderRadius: '50px' }}></div>
                  </td>
                  <td>
                    <div className="skeleton-pulse" style={{ width: '120px', height: '20px' }}></div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div className="skeleton-pulse" style={{ width: '36px', height: '36px', borderRadius: '10px' }}></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredRooms.length > 0 ? (
              <>
                {filteredRooms.slice(0, visibleCount).map((room) => (
                  <tr key={room.id} className="table-row">
                    <td style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '16px' }}>
                        {room.room_number} (Tầng {room.floor})
                    </td>
                    <td>
                       <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{room.room_type_name}</div>
                    </td>
                    <td>
                       <select 
                         value={room.status} 
                         onChange={(e) => handleStatusChange(room.id, e.target.value)}
                         style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                       >
                         <option value="AVAILABLE">AVAILABLE</option>
                         <option value="OCCUPIED">OCCUPIED</option>
                         <option value="CLEANING">CLEANING</option>
                         <option value="MAINTENANCE">MAINTENANCE</option>
                       </select>
                    </td>
                    <td>{getDisplayStatusBadge(room.displayStatus)}</td>
                    <td>
                        {room.currentBooking ? (
                            <div style={{ fontSize: '13px' }}>
                                <div style={{ fontWeight: '700' }}>{room.currentBooking.customer_name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{room.currentBooking.booking_code}</div>
                            </div>
                        ) : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button onClick={() => handleOpenModal(room)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                       </div>
                    </td>
                  </tr>
                ))}
                {isScrollingLoading && (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="table-row">
                      <td>
                        <div className="skeleton-pulse" style={{ width: '80px', height: '20px' }}></div>
                      </td>
                      <td>
                        <div className="skeleton-pulse" style={{ width: '150px', height: '20px' }}></div>
                      </td>
                      <td>
                        <div className="skeleton-pulse" style={{ width: '100px', height: '24px', borderRadius: '8px' }}></div>
                      </td>
                      <td>
                        <div className="skeleton-pulse" style={{ width: '70px', height: '20px', borderRadius: '50px' }}></div>
                      </td>
                      <td>
                        <div className="skeleton-pulse" style={{ width: '120px', height: '20px' }}></div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div className="skeleton-pulse" style={{ width: '36px', height: '36px', borderRadius: '10px' }}></div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </>
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Không tìm thấy phòng nghỉ nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,15,29,0.85)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ 
            backgroundColor: '#fff', width: '500px', borderRadius: '24px', padding: '40px', 
            boxShadow: '0 40px 100px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px' }}>
               {editingRoom ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}
            </h3>

            <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div>
                       <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Số phòng</label>
                       <input required value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} 
                         style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
                   </div>
                   <div>
                       <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Tầng</label>
                       <input required type="number" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} 
                         style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
                   </div>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Hạng phòng</label>
                    <select required value={formData.room_type_id} onChange={e => setFormData({...formData, room_type_id: e.target.value})} 
                      style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <option value="">-- Chọn hạng phòng --</option>
                        {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '40px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>HỦY</button>
              <button type="submit" className="btn-gold" style={{ padding: '12px 30px', borderRadius: '10px', background: 'var(--gold)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' }}>LƯU THAY ĐỔI</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
