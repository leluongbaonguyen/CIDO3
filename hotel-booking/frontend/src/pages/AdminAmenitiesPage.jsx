import { useState } from 'react';

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState([
    { id: 1, name: 'Wifi tốc độ cao', icon: 'fa-wifi' },
    { id: 2, name: 'Điều hòa nhiệt độ', icon: 'fa-snowflake' },
    { id: 3, name: 'Bồn tắm', icon: 'fa-bath' },
    { id: 4, name: 'Minibar', icon: 'fa-wine-glass-alt' },
    { id: 5, name: 'Tivi màn hình phẳng', icon: 'fa-tv' },
    { id: 6, name: 'Máy sấy tóc', icon: 'fa-wind' },
  ]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý tiện nghi</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Quản lý danh sách các tiện ích đi kèm trong phòng khách sạn.</p>
        </div>
        <button style={{ backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          <i className="fas fa-plus"></i> Thêm tiện nghi
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {amenities.map((item) => (
          <div key={item.id} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0f9ff', color: '#0ea5e9', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Icon: {item.icon}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
              <button style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
