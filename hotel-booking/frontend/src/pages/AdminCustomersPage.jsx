import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
        const data = await api('/admin/customers');
        setCustomers(data);
    } catch (error) {
        console.error('Lỗi tải khách hàng:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredCustomers = customers.filter(c => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || 
           c.email?.toLowerCase().includes(search.toLowerCase()) ||
           c.phone?.includes(search) ||
           c.id_number?.includes(search);
  });

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
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý khách hàng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Danh sách thành viên đăng ký sử dụng dịch vụ khách sạn.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, SĐT hoặc CMND..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '350px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Khách hàng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Liên hệ</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>CMND/CCCD</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Địa chỉ</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                      {c.first_name[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600' }}>{c.first_name} {c.last_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Gia nhập: {new Date(c.create_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                    <div>{c.email}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{c.phone}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>{c.id_number || 'N/A'}</td>
                <td style={{ padding: '16px 24px' }}>{c.city || 'N/A'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    backgroundColor: c.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', 
                    color: c.status === 'ACTIVE' ? '#166534' : '#ef4444',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' 
                  }}>
                    {c.status === 'ACTIVE' ? 'Đang hoạt động' : 'Bị khóa'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleToggleStatus(c.id, c.status)}
                    style={{ border: 'none', background: 'transparent', color: c.status === 'ACTIVE' ? '#f59e0b' : '#10b981', cursor: 'pointer', fontSize: '16px' }} 
                    title={c.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                  >
                    <i className={`fas fa-${c.status === 'ACTIVE' ? 'user-slash' : 'user-check'}`}></i>
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
