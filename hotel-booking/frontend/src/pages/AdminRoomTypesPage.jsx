import { useState } from 'react';

export default function AdminRoomTypesPage() {
  const [types, setTypes] = useState([
    { id: 1, name: 'Standard', basePrice: 500000, maxOccupancy: 2, description: 'Phòng tiêu chuẩn cơ bản' },
    { id: 2, name: 'Superior', basePrice: 850000, maxOccupancy: 2, description: 'Phòng nâng cao view đẹp' },
    { id: 3, name: 'Deluxe', basePrice: 1200000, maxOccupancy: 3, description: 'Phòng sang trọng rộng rãi' },
    { id: 4, name: 'Suite', basePrice: 2500000, maxOccupancy: 4, description: 'Hạng phòng cao cấp nhất' },
  ]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý loại phòng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Cấu hình giá cơ bản và sức chứa cho từng hạng phòng.</p>
        </div>
        <button style={{ backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          <i className="fas fa-plus"></i> Thêm loại phòng
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Tên loại phòng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Giá cơ bản (VND)</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Sức chứa tối đa</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Mô tả</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px', fontWeight: '700', color: '#1e293b' }}>{t.name}</td>
                <td style={{ padding: '16px 24px', color: '#0ea5e9', fontWeight: '600' }}>{t.basePrice.toLocaleString()} ₫</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{t.maxOccupancy} người</td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>{t.description}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button style={{ border: 'none', background: 'transparent', color: '#0ea5e9', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                    <button style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
