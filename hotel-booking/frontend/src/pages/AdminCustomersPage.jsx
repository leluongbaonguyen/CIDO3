import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const data = await api('/admin/customers');
    setCustomers(data);
  };

  useEffect(() => { load(); }, []);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.idNumber?.includes(search)
  );

  const handleToggleStatus = (id) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, status: c.status === 'Active' ? 'Locked' : 'Active' } : c
    ));
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý khách hàng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Tra cứu, quản lý thông tin và trạng thái tài khoản của khách hàng.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Tìm theo tên, email, SĐT hoặc CMND..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} 
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Họ tên</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Số ĐT</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>CMND/CCCD</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Địa điểm</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b', fontWeight: '700', fontSize: '12px' }}>
                      {c.name?.[0] || 'U'}
                    </div>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{c.email}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{c.phone}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{c.idNumber || '0480...'}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{c.location || 'Đà Nẵng'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    backgroundColor: c.status === 'Active' ? '#dcfce7' : '#fee2e2', 
                    color: c.status === 'Active' ? '#166534' : '#ef4444',
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: '700' 
                  }}>
                    {c.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button style={{ border: 'none', background: 'transparent', color: '#0ea5e9', cursor: 'pointer' }} title="Sửa"><i className="fas fa-edit"></i></button>
                    <button 
                      onClick={() => handleToggleStatus(c.id)}
                      style={{ border: 'none', background: 'transparent', color: c.status === 'Active' ? '#f59e0b' : '#10b981', cursor: 'pointer' }} 
                      title={c.status === 'Active' ? 'Khóa' : 'Mở khóa'}
                    >
                      <i className={`fas fa-${c.status === 'Active' ? 'lock' : 'lock-open'}`}></i>
                    </button>
                    <button style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }} title="Xóa"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination placeholder */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>Hiển thị 1 - {filteredCustomers.length} của {customers.length} khách hàng</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>Trước</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>1</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
