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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'AVAILABLE': return { color: '#10b981', backgroundColor: '#dcfce7' };
      case 'OCCUPIED': return { color: '#ef4444', backgroundColor: '#fee2e2' };
      case 'MAINTENANCE': return { color: '#f59e0b', backgroundColor: '#fef3c7' };
      default: return { color: '#64748b', backgroundColor: '#f1f5f9' };
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý danh sách phòng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Quản lý toàn bộ hệ thống phòng vật lý và trạng thái vận hành.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgb(14 165 233 / 0.3)' }}
        >
          <i className="fas fa-plus"></i> Thêm phòng mới
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <input 
            type="text" 
            placeholder="Tìm theo số phòng hoặc loại..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '300px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Số phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Tầng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Loại phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Giá gốc</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', fontWeight: '700' }}>{room.room_number}</td>
                <td style={{ padding: '16px 24px' }}>{room.floor}</td>
                <td style={{ padding: '16px 24px' }}>{room.room_type_name}</td>
                <td style={{ padding: '16px 24px' }}>{Number(room.base_price).toLocaleString()}đ</td>
                <td style={{ padding: '16px 24px' }}>
                  <select 
                    value={room.status} 
                    onChange={(e) => handleStatusChange(room.id, e.target.value)}
                    style={{ ...getStatusStyle(room.status), border: 'none', padding: '6px 12px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang ở</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button onClick={() => handleOpenModal(room)} style={{ color: '#0ea5e9', marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleDelete(room.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', width: '450px', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ margin: 0 }}>{editingRoom ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}</h3>
            <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Số phòng</label>
                    <input required placeholder="Ví dụ: 101" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Tầng</label>
                    <input required type="number" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Loại phòng</label>
                    <select required value={formData.room_type_id} onChange={e => setFormData({...formData, room_type_id: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <option value="">-- Chọn loại phòng --</option>
                        {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Ghi chú</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', height: '80px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Hủy</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Lưu lại</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
