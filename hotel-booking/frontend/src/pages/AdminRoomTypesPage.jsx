import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminRoomTypesPage() {
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: 0,
    max_occupancy: 2,
    photo_urls: ''
  });

  const load = async () => {
    try {
      const data = await api('/admin/room-types');
      setTypes(data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description,
        base_price: type.base_price,
        max_occupancy: type.max_occupancy,
        photo_urls: type.photo_urls || ''
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        description: '',
        base_price: 0,
        max_occupancy: 2,
        photo_urls: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await api(`/admin/room-types/${editingType.id}`, { method: 'PUT', body: formData });
      } else {
        await api('/admin/room-types', { method: 'POST', body: formData });
      }
      setShowModal(false);
      load();
    } catch (error) {
      alert('Lỗi lưu dữ liệu: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạng phòng này?')) return;
    try {
      await api(`/admin/room-types/${id}`, { method: 'DELETE' });
      load();
    } catch (error) {
      alert('Không thể xóa: ' + error.message);
    }
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

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Hạng phòng niêm yết</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Cấu hình các phân khúc phòng nghỉ và giá niêm yết của resort.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-gold" style={{ padding: '12px 25px', fontSize: '13px' }}>
          <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> THÊM HẠNG PHÒNG
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
        {types.map((type) => (
          <div key={type.id} className="card-luxury-premium" style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-premium)', border: '1px solid #f1f5f9' }}>
            <div style={{ height: '200px', position: 'relative' }}>
               <img src={getDisplayImage(type.photo_urls)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={type.name} />
               <div style={{ position: 'absolute', bottom: '20px', left: '20px', padding: '6px 15px', background: 'var(--gold-gradient)', color: 'var(--black)', borderRadius: '50px', fontSize: '11px', fontWeight: '800' }}>
                  {Number(type.base_price).toLocaleString()}đ / ĐÊM
               </div>
            </div>
            <div style={{ padding: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>{type.name}</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <button onClick={() => handleOpenModal(type)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: 'var(--primary)', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                     <button onClick={() => handleDelete(type.id)} style={{ background: '#fee2e2', border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
                  </div>
               </div>
               <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px', height: '45px', overflow: 'hidden' }}>{type.description}</p>
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                  <div><i className="fas fa-user-friends" style={{ marginRight: '8px', color: 'var(--gold)' }}></i> Tối đa {type.max_occupancy} khách</div>
                  <div><i className="fas fa-images" style={{ marginRight: '8px', color: 'var(--gold)' }}></i> {type.photo_urls?.split(',').length || 0} ảnh</div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', width: '600px', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginBottom: '32px' }}>{editingType ? 'Cập nhật hạng phòng' : 'Thêm hạng phòng mới'}</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                   <label className="luxury-label">Tên hạng phòng</label>
                   <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div>
                      <label className="luxury-label">Giá niêm yết (VNĐ)</label>
                      <input required type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                   </div>
                   <div>
                      <label className="luxury-label">Số khách tối đa</label>
                      <input required type="number" value={formData.max_occupancy} onChange={e => setFormData({...formData, max_occupancy: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                   </div>
                </div>
                <div>
                   <label className="luxury-label">Mô tả chi tiết</label>
                   <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', resize: 'none' }} />
                </div>
                <div>
                   <label className="luxury-label">URL Hình ảnh (phân cách bằng dấu phẩy)</label>
                   <input value={formData.photo_urls} onChange={e => setFormData({...formData, photo_urls: e.target.value})} placeholder="https://image1.jpg,https://image2.jpg" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '10px', border: 'none', background: '#f1f5f9', fontWeight: '700', cursor: 'pointer' }}>HỦY BỎ</button>
              <button type="submit" className="btn-accent" style={{ padding: '12px 35px' }}>XÁC NHẬN LƯU</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
