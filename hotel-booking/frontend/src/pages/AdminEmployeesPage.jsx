import { useState } from 'react';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Trần Huy', email: 'huy@xtravel.com', role: 'ADMIN', status: 'Active', joinDate: '2025-01-10' },
    { id: 2, name: 'Phan Hiền', email: 'hien@xtravel.com', role: 'STAFF', status: 'Active', joinDate: '2025-02-15' },
    { id: 3, name: 'Hồng Cường', email: 'cuong@xtravel.com', role: 'STAFF', status: 'Active', joinDate: '2025-03-20' },
    { id: 4, name: 'Tấn Nguyên', email: 'tannguyen@xtravel.com', role: 'STAFF', status: 'Locked', joinDate: '2025-04-01' },
  ]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý nhân viên</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Quản lý đội ngũ vận hành và phân quyền truy cập hệ thống.</p>
        </div>
        <button style={{ backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          <i className="fas fa-user-plus"></i> Thêm nhân viên
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Họ tên</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Vai trò</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Ngày tham gia</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{emp.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{emp.email}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ backgroundColor: emp.role === 'ADMIN' ? '#e0f2fe' : '#f1f5f9', color: emp.role === 'ADMIN' ? '#0ea5e9' : '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    {emp.role}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>{emp.joinDate}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ color: emp.status === 'Active' ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: '600' }}>
                    ● {emp.status === 'Active' ? 'Đang làm việc' : 'Đã khóa'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button style={{ border: 'none', background: 'transparent', color: '#0ea5e9', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                    <button style={{ border: 'none', background: 'transparent', color: '#f59e0b', cursor: 'pointer' }}><i className="fas fa-key"></i></button>
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
