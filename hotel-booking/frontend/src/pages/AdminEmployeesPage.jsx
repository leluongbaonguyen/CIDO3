import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);

  const load = async () => {
    try {
        const data = await api('/admin/employees');
        setEmployees(data);
    } catch (error) {
        console.error('Lỗi tải nhân viên:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
        const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        await api(`/admin/users/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
        load();
    } catch (error) {
        alert('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý nhân viên</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Quản lý đội ngũ vận hành và quyền hạn truy cập hệ thống.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Nhân viên</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Vai trò</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Phòng ban</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Ngày gia nhập</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{emp.first_name} {emp.last_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{emp.email}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ backgroundColor: emp.role === 'ADMIN' ? '#e0f2fe' : '#f1f5f9', color: emp.role === 'ADMIN' ? '#0ea5e9' : '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    {emp.role}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>{emp.department || 'Vận hành'}</td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>{new Date(emp.hire_date || emp.create_date).toLocaleDateString()}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ color: emp.status === 'ACTIVE' ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: '600' }}>
                    ● {emp.status === 'ACTIVE' ? 'Đang làm việc' : 'Đã khóa'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button 
                        onClick={() => handleToggleStatus(emp.id, emp.status)}
                        style={{ border: 'none', background: 'transparent', color: emp.status === 'ACTIVE' ? '#f59e0b' : '#10b981', cursor: 'pointer', fontSize: '16px' }}
                    >
                        <i className={`fas fa-${emp.status === 'ACTIVE' ? 'lock' : 'lock-open'}`}></i>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
