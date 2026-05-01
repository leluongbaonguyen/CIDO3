import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'fa-star' });

  const loadAmenities = async () => {
    try {
      setLoading(true);
      const data = await api('/admin/amenities');
      setAmenities(data);
    } catch (error) {
      console.error('Lỗi tải tiện nghi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAmenities(); }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, description: item.description || '', icon: item.icon || 'fa-star' });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', icon: 'fa-star' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api(`/admin/amenities/${editingItem.id}`, { method: 'PUT', body: formData });
      } else {
        await api('/admin/amenities', { method: 'POST', body: formData });
      }
      setShowModal(false);
      loadAmenities();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tiện nghi này?')) return;
    try {
      await api(`/admin/amenities/${id}`, { method: 'DELETE' });
      loadAmenities();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const filtered = amenities.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}><i className="fas fa-circle-notch fa-spin" style={{ fontSize: '40px', color: 'var(--gold)' }}></i></div>;

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Quản lý tiện nghi</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Danh mục các dịch vụ và tiện ích đi kèm trong hệ thống resort.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-gold" style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '14px' }}>
          <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Thêm tiện nghi mới
        </button>
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
         <div style={{ flex: 1, position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm tên tiện nghi..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff' }}
            />
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {filtered.map((item) => (
          <div key={item.id} className="card-luxury-premium shine-on-hover" style={{ padding: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '16px', 
                background: 'rgba(196, 166, 97, 0.1)', color: 'var(--gold)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px',
              }}>
                <i className={`fas ${item.icon || 'fa-concierge-bell'}`}></i>
              </div>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px', marginBottom: '4px' }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>ID: #00{item.id}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => handleOpenModal(item)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
              <button onClick={() => handleDelete(item.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', width: '450px', borderRadius: '24px', padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>{editingItem ? 'Sửa tiện nghi' : 'Thêm tiện nghi'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="luxury-label">Tên tiện nghi</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label className="luxury-label">Icon (FontAwesome class)</label>
                <input required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label className="luxury-label">Mô tả</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', resize: 'none' }} rows={3} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn-gold" style={{ background: '#f1f5f9', color: '#64748b', padding: '10px 20px' }}>HỦY</button>
              <button type="submit" className="btn-gold" style={{ padding: '10px 30px' }}>LƯU LẠI</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
