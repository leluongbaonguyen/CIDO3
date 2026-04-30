import { useState } from 'react';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([
    { id: 1, name: 'ADMIN', description: 'Toàn quyền quản trị hệ thống, nhân sự và cấu hình.', permissions: ['FULL_ACCESS'] },
    { id: 2, name: 'STAFF', description: 'Quản lý vận hành (Đặt phòng, Phòng, Đánh giá, Hỗ trợ).', permissions: ['BOOKING_MANAGE', 'ROOM_MANAGE', 'SUPPORT_MANAGE'] },
    { id: 3, name: 'CUSTOMER', description: 'Sử dụng dịch vụ, đặt phòng và quản lý cá nhân.', permissions: ['BOOKING_CREATE', 'PROFILE_MANAGE'] },
  ]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Cấu hình Phân quyền (RBAC)</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Định nghĩa các vai trò và quyền hạn chi tiết trong hệ thống.</p>
        </div>
        <button style={{ backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          <i className="fas fa-shield-alt"></i> Thêm vai trò mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {roles.map((role) => (
          <div key={role.id} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', margin: 0 }}>{role.name}</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>{role.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Chỉnh sửa quyền</button>
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Xóa</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {role.permissions.map((p, idx) => (
                <span key={idx} style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: '1px solid #e0f2fe' }}>
                  {p}
                </span>
              ))}
              <span style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: '1px dotted #cbd5e1', cursor: 'pointer' }}>
                + Gán quyền mới
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
