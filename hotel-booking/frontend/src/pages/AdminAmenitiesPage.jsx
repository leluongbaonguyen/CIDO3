import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'fa-star', status: 'ACTIVE' });

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
      setFormData({ name: item.name, description: item.description || '', icon: item.icon || 'fa-star', status: item.status || 'ACTIVE' });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', icon: 'fa-star', status: 'ACTIVE' });
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} style={{ 
              padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#ffffff',
              border: '1px solid rgba(196, 166, 97, 0.2)', borderRadius: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <div className="skeleton-pulse" style={{ 
                  width: '70px', height: '70px', borderRadius: '20px'
                }}></div>
                <div>
                  <div className="skeleton-pulse" style={{ width: '120px', height: '24px', marginBottom: '8px' }}></div>
                  <div className="skeleton-pulse" style={{ width: '80px', height: '14px' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '12px' }}></div>
                <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '12px' }}></div>
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((item) => (
            <div key={item.id} className="card-luxury-premium" style={{ 
              padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(196, 166, 97, 0.2)', borderRadius: '24px',
              transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
            }} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(196, 166, 97, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(196, 166, 97, 0.5)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = 'rgba(196, 166, 97, 0.2)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <div style={{ 
                  width: '70px', height: '70px', borderRadius: '20px', 
                  background: 'linear-gradient(135deg, #0a0f1d 0%, #1e293b 100%)', 
                  color: 'var(--gold)', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px',
                  boxShadow: '0 8px 16px rgba(10, 15, 29, 0.25)',
                  border: '1px solid rgba(196, 166, 97, 0.3)'
                }}>
                  <i className={`fas ${item.icon || 'fa-concierge-bell'}`}></i>
                </div>
                <div>
                  <div style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '20px', marginBottom: '6px', fontFamily: '"Playfair Display", serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.name}
                    {item.status === 'ACTIVE' ? (
                      <span style={{ fontSize: '10px', background: '#d1fae5', color: '#10b981', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>Hoạt động</span>
                    ) : item.status === 'INACTIVE' ? (
                      <span style={{ fontSize: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>Ngừng dùng</span>
                    ) : (
                      <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>Đã ẩn</span>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>SERVICE ID: #00{item.id}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => handleOpenModal(item)} style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: 'rgba(10, 15, 29, 0.05)', color: 'var(--primary)', cursor: 'pointer', transition: '0.3s' }} onMouseEnter={e => e.target.style.background = 'rgba(10, 15, 29, 0.1)'} onMouseLeave={e => e.target.style.background = 'rgba(10, 15, 29, 0.05)'}><i className="fas fa-edit"></i></button>
                <button onClick={() => handleDelete(item.id)} style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', cursor: 'pointer', transition: '0.3s' }} onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.05)'}><i className="fas fa-trash-alt"></i></button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontWeight: '600' }}>
             Chưa có tiện nghi nào được thiết lập.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,15,29,0.85)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.4s ease' }}>
          <form onSubmit={handleSubmit} style={{ 
            backgroundColor: '#0a0f1d', width: '500px', borderRadius: '32px', padding: '50px', 
            border: '1px solid rgba(196, 166, 97, 0.2)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            position: 'relative', overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--gold)', marginBottom: '40px', fontFamily: '"Playfair Display", serif', letterSpacing: '1px' }}>
               {editingItem ? 'Hiệu chỉnh tiện nghi' : 'Thiết lập tiện nghi mới'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Tên tiện nghi</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196, 166, 97, 0.3)', borderRadius: '12px', color: '#fff', padding: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Icon (FontAwesome class)</label>
                <input required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} 
                   style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196, 166, 97, 0.3)', borderRadius: '12px', color: '#fff', padding: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Mô tả tiện ích</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(196, 166, 97, 0.3)', background: 'rgba(255,255,255,0.03)', color: '#fff', resize: 'none' }} rows={3} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>Trạng thái tiện nghi</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  style={{ width: '100%', background: '#0a0f1d', border: '1px solid rgba(196, 166, 97, 0.3)', borderRadius: '12px', color: '#fff', padding: '15px', outline: 'none' }}>
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Ngừng sử dụng (INACTIVE)</option>
                  <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '50px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '16px 35px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>HỦY BỎ</button>
              <button type="submit" className="btn-gold" style={{ padding: '16px 40px', fontSize: '13px', borderRadius: '14px', boxShadow: '0 10px 25px rgba(196, 166, 97, 0.3)' }}>LƯU THAY ĐỔI</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
