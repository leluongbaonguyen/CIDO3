import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    floor: 1,
    status: 'AVAILABLE',
    room_type_id: '',
    notes: ''
  });

  const load = async () => {
    try {
        const data = await api('/admin/rooms');
        setRooms(data);
        const types = await api('/admin/room-types');
        setRoomTypes(types);
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) return;
    try {
      await api(`/admin/rooms/${id}`, { method: 'DELETE' });
      load();
    } catch (error) {
      alert('Không thể xóa: ' + error.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
      try {
          const room = rooms.find(r => r.id === id);
          await api(`/admin/rooms/${id}`, { method: 'PUT', body: { ...room, status: newStatus } });
          load();
      } catch (error) {
          alert('Lỗi cập nhật trạng thái');
      }
  };

  const filteredRooms = rooms.filter(r => 
    r.room_number?.toString().includes(search) || 
    r.room_type_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE': return <span style={{ padding: '6px 12px', borderRadius: '50px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '700' }}>CÓ SẴN</span>;
      case 'OCCUPIED': return <span style={{ padding: '6px 12px', borderRadius: '50px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: '700' }}>ĐANG Ở</span>;
      case 'MAINTENANCE': return <span style={{ padding: '6px 12px', borderRadius: '50px', background: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: '700' }}>BẢO TRÌ</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Quản lý phòng nghỉ</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Kiểm soát trạng thái thực tế của 100 phòng tại resort.</p>
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
                style={{ width: '350px', paddingLeft: '44px !important', background: '#f8fafc !important' }} 
              />
           </div>
           <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Tổng số: {filteredRooms.length} phòng</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Số phòng</th>
              <th>Vị trí</th>
              <th>Hạng phòng</th>
              <th>Giá niêm yết</th>
              <th>Vận hành</th>
              <th style={{ textAlign: 'center' }}>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id} className="table-row">
                <td style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '16px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: room.status === 'AVAILABLE' ? '#10b981' : '#ef4444' }}></div>
                      {room.room_number}
                   </div>
                </td>
                <td>Tầng {room.floor}</td>
                <td>
                   <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{room.room_type_name}</div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>BOOKING X Original</div>
                </td>
                <td style={{ fontWeight: '700' }}>{Number(room.base_price).toLocaleString()}đ</td>
                <td>
                   <select 
                     value={room.status} 
                     onChange={(e) => handleStatusChange(room.id, e.target.value)}
                     style={{ border: 'none !important', background: 'transparent !important', padding: '0 !important', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', width: 'auto !important' }}
                   >
                     <option value="AVAILABLE">Sẵn sàng đón khách</option>
                     <option value="OCCUPIED">Khách đang lưu trú</option>
                     <option value="MAINTENANCE">Đang bảo trì/Sửa chữa</option>
                   </select>
                </td>
                <td style={{ textAlign: 'center' }}>
                   <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button onClick={() => handleOpenModal(room)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDelete(room.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,15,29,0.85)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.4s ease' }}>
          <form onSubmit={handleSubmit} style={{ 
            backgroundColor: '#0a0f1d', width: '550px', borderRadius: '32px', padding: '50px', 
            border: '1px solid rgba(196, 166, 97, 0.2)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Decorative Gold Glow */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(196, 166, 97, 0.1) 0%, transparent 70%)' }}></div>
            
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--gold)', marginBottom: '40px', fontFamily: '"Playfair Display", serif', letterSpacing: '1px' }}>
               {editingRoom ? 'Hiệu chỉnh thông tin' : 'Thiết lập phòng mới'}
            </h3>

            <div style={{ display: 'grid', gap: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                   <div>
                       <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Số phòng</label>
                       <input required placeholder="101" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} 
                         style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196, 166, 97, 0.3)', borderRadius: '12px', color: '#fff', padding: '15px' }} />
                   </div>
                   <div>
                       <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Tầng</label>
                       <input required type="number" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} 
                         style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196, 166, 97, 0.3)', borderRadius: '12px', color: '#fff', padding: '15px' }} />
                   </div>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Hạng phòng</label>
                    <select required value={formData.room_type_id} onChange={e => setFormData({...formData, room_type_id: e.target.value})} 
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196, 166, 97, 0.3)', borderRadius: '12px', color: '#fff', padding: '15px' }}>
                        <option value="" style={{ background: '#0a0f1d' }}>-- Chọn hạng phòng niêm yết --</option>
                        {roomTypes.map(t => <option key={t.id} value={t.id} style={{ background: '#0a0f1d' }}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Ghi chú vận hành</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} 
                      style={{ width: '100%', height: '120px', padding: '15px', borderRadius: '12px', border: '1px solid rgba(196, 166, 97, 0.3)', background: 'rgba(255,255,255,0.03)', color: '#fff', resize: 'none' }} />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '50px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '16px 35px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: '700', cursor: 'pointer', fontSize: '13px', transition: '0.3s' }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.target.style.background = 'transparent'}>ĐÓNG</button>
              <button type="submit" className="btn-gold" style={{ padding: '16px 40px', fontSize: '13px', borderRadius: '14px', boxShadow: '0 10px 25px rgba(196, 166, 97, 0.3)' }}>XÁC NHẬN LƯU</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
