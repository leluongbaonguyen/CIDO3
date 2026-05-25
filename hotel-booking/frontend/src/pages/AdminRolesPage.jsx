import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api('/admin/roles');
        setRoles(data);
      } catch (error) {
        console.error('Lỗi tải quyền:', error);
      }
    };
    load();
  }, []);

  const getPermissions = (roleName) => {
    switch (roleName) {
      case 'ADMIN': return ['Toàn quyền hệ thống', 'Quản lý nhân sự', 'Xem báo cáo tài chính', 'Cấu hình resort'];
      case 'STAFF': return ['Quản lý đơn đặt phòng', 'Check-in/Check-out', 'Cập nhật tình trạng phòng', 'Hỗ trợ khách hàng'];
      case 'CUSTOMER': return ['Đặt phòng', 'Xem lịch sử đơn hàng', 'Đánh giá dịch vụ', 'Cập nhật hồ sơ'];
      default: return ['Quyền cơ bản'];
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Phân quyền hệ thống (RBAC)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Định nghĩa các nhóm quyền truy cập cho từng vai trò người dùng trong hệ thống.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
        {['ADMIN', 'STAFF', 'CUSTOMER'].map((role) => (
          <div key={role} className="card-luxury-premium" style={{ padding: '35px', background: '#fff', borderRadius: '24px', boxShadow: 'var(--shadow-premium)', border: '1px solid #f1f5f9' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--gold-gradient)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--black)' }}>
                   <i className={`fas ${role === 'ADMIN' ? 'fa-shield-alt' : (role === 'STAFF' ? 'fa-user-tie' : 'fa-user')}`} style={{ fontSize: '20px' }}></i>
                </div>
                <div>
                   <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)' }}>{role}</h3>
                   <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>Vai trò định nghĩa sẵn</div>
                </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {getPermissions(role).map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
                     <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                     {p}
                  </div>
                ))}
             </div>

             <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #f1f5f9' }}>
                <button style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: 'transparent', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', cursor: 'not-allowed' }}>
                   KHÔNG THỂ CHỈNH SỬA VAI TRÒ HỆ THỐNG
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
