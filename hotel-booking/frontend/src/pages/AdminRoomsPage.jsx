import { useEffect, useState } from 'react';
import { api } from '../api/client';

const initialForm = {
  roomNumber: '',
  floor: 1,
  status: 'AVAILABLE',
  notes: '',
  roomTypeId: 1
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);

  const load = async () => setRooms(await api('/rooms'));

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api('/admin/rooms', {
      method: 'POST',
      body: JSON.stringify({ ...form, roomTypeId: Number(form.roomTypeId), floor: Number(form.floor) })
    });
    setForm(initialForm);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
      await api(`/admin/rooms/${id}`, { method: 'DELETE' });
      load();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Quản lý Danh sách Phòng</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Tìm phòng (Số phòng, tầng)..."
            className="search-input"
            style={{ width: '250px', padding: '10px 16px' }}
          />
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Đóng form' : '+ Thêm phòng'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="card form" onSubmit={submit} style={{ marginBottom: '24px', animation: 'fadeIn 0.3s' }}>
          <h3 style={{ marginBottom: '16px' }}>Thêm phòng mới</h3>
          <div className="grid3">
            <div className="input-group">
              <label className="input-label">Số phòng</label>
              <input placeholder="VD: 101, A202" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Tầng</label>
              <input type="number" min="1" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Mã loại phòng (ID)</label>
              <input type="number" min="1" placeholder="Room Type ID" value={form.roomTypeId} onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })} required />
            </div>
          </div>
          <div className="grid2" style={{ marginTop: '16px' }}>
            <div className="input-group">
              <label className="input-label">Trạng thái</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="search-input">
                <option value="AVAILABLE">Trống (Sẵn sàng)</option>
                <option value="BOOKED">Đã đặt trước</option>
                <option value="IN_USE">Đang sử dụng</option>
                <option value="MAINTENANCE">Đang bảo trì</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Ghi chú bổ sung</label>
              <input placeholder="VD: Cần vệ sinh ngay" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn outline" onClick={() => setShowForm(false)}>Hủy bỏ</button>
            <button className="btn" type="submit">Lưu phòng</button>
          </div>
        </form>
      )}

      <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
              <th style={{ padding: '16px', fontWeight: '600' }}>Số phòng</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Tầng</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Loại phòng</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Trạng thái</th>
              <th style={{ padding: '16px', fontWeight: '600' }}>Ghi chú</th>
              <th style={{ padding: '16px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có phòng nào trong hệ thống, hãy ấn 'Thêm phòng'.</td></tr>
            ) : rooms.map((room) => (
              <tr key={room.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', fontWeight: '600' }}>{room.room_number}</td>
                <td style={{ padding: '16px' }}>{room.floor}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontWeight: '500' }}>{room.room_type_name || `L.Phòng ID: ${room.room_type_id}`}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  {room.status === 'AVAILABLE' && <span className="badge badge-green">Trống</span>}
                  {room.status === 'BOOKED' && <span className="badge badge-blue">Đã đặt</span>}
                  {room.status === 'IN_USE' && <span className="badge badge-orange">Đang sử dụng</span>}
                  {room.status === 'MAINTENANCE' && <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>Bảo trì</span>}
                </td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{room.notes || '-'}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button className="btn outline" style={{ padding: '6px 12px', fontSize: '13px', marginRight: '8px' }}>Sửa</button>
                  <button className="btn danger" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => remove(room.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
