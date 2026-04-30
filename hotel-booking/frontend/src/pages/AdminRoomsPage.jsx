import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const load = async () => {
    const data = await api('/rooms');
    setRooms(data);
  };

  useEffect(() => { load(); }, []);

  const getImageUrl = (photoUrls) => {
    try {
      if (!photoUrls) return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=100';
      const parsed = JSON.parse(photoUrls);
      return parsed[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=100';
    } catch (e) {
      return photoUrls;
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.room_number?.toString().includes(search) || 
    r.room_type_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusToggle = (room) => {
    const statuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
    const currentIndex = statuses.indexOf(room.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    setRooms(rooms.map(r => r.id === room.id ? { ...r, status: nextStatus } : r));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'AVAILABLE': return { color: '#10b981', backgroundColor: '#dcfce7' };
      case 'OCCUPIED': return { color: '#ef4444', backgroundColor: '#fee2e2' };
      case 'MAINTENANCE': return { color: '#f59e0b', backgroundColor: '#fef3c7' };
      default: return { color: '#64748b', backgroundColor: '#f1f5f9' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'Trống';
      case 'OCCUPIED': return 'Đang ở';
      case 'MAINTENANCE': return 'Bảo trì';
      default: return status;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý danh sách phòng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Quản lý dữ liệu vật lý và trạng thái của các phòng trong khách sạn.</p>
        </div>
        <button 
          onClick={() => { setEditingRoom(null); setShowModal(true); }}
          style={{ backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgb(14 165 233 / 0.3)' }}
        >
          <i className="fas fa-plus"></i> Thêm phòng mới
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Tìm phòng theo số hoặc loại..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} 
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Hình ảnh</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Số phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Tầng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Loại phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 24px' }}>
                  <img src={getImageUrl(room.photo_urls)} alt="Room" style={{ width: '60px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                </td>
                <td style={{ padding: '16px 24px', fontWeight: '700', color: '#1e293b' }}>{room.room_number}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{room.floor || 1}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span 
                    onClick={() => handleStatusToggle(room)}
                    style={{ ...getStatusStyle(room.status), padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'inline-block' }}
                  >
                    {getStatusLabel(room.status)}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                    {room.room_type_name}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={() => { setEditingRoom(room); setShowModal(true); }} style={{ border: 'none', background: 'transparent', color: '#0ea5e9', cursor: 'pointer', fontSize: '14px' }} title="Chỉnh sửa"><i className="fas fa-edit"></i></button>
                    <button style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }} title="Xóa"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination placeholder */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>Hiển thị 1 - {filteredRooms.length} của {rooms.length} phòng</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>Trước</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>1</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>2</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>Sau</button>
          </div>
        </div>
      </div>

      {/* Modal E: Popup Thêm/Sửa Dữ liệu */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', animation: 'slideUp 0.3s ease-out' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', margin: 0 }}>
              {editingRoom ? 'Cập nhật thông tin phòng' : 'Thêm phòng mới'}
            </h3>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Số hiệu phòng</label>
                <input defaultValue={editingRoom?.roomNumber} type="text" placeholder="Ví dụ: 101, A202..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Loại phòng</label>
                  <select defaultValue={editingRoom?.type} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Tầng</label>
                  <input defaultValue={editingRoom?.floor || 1} type="number" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Tải ảnh lên</label>
                <div style={{ border: '2px dashed #e2e8f0', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                  <i className="fas fa-cloud-upload-alt" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                  <div>Chọn ảnh hoặc kéo thả vào đây</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Hủy bỏ</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0ea5e9', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
