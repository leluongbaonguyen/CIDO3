import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');

    const load = async () => {
        try {
            const data = await api('/admin/customers');
            setCustomers(data);
        } catch (e) {
            console.error(e);
            // Stub data for UI visual check
            setCustomers([
                { id: 1, first_name: 'Nguyễn', last_name: 'Văn A', email: 'vana@gmail.com', phone: '0987654321', id_number: '123456789', city: 'Hà Nội', status: 'HOẠT ĐỘNG' },
                { id: 2, first_name: 'Trần', last_name: 'Thị B', email: 'thib@gmail.com', phone: '0123456789', id_number: '987654321', city: 'Đà Nẵng', status: 'ĐÃ KHÓA' }
            ]);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = customers.filter(c =>
        c.email?.includes(search) ||
        c.phone?.includes(search) ||
        c.last_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--text-dark)' }}>Quản lý Khách hàng</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng (Tên, SĐT, Email)..."
                    className="search-input"
                    style={{ width: '300px', padding: '10px 16px' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Khách hàng</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Liên hệ</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>CMND/CCCD</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Khu vực</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Trạng thái</th>
                            <th style={{ padding: '16px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((c) => (
                            <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '600' }}>{c.first_name} {c.last_name}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '14px' }}>{c.email}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{c.phone}</div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{c.id_number}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{c.city}</td>
                                <td style={{ padding: '16px' }}>
                                    {c.status === 'HOẠT ĐỘNG' ? (
                                        <span className="badge badge-green">Hoạt động</span>
                                    ) : (
                                        <span className="badge badge-orange">Đã khóa</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button className="btn outline" style={{ padding: '6px 12px', fontSize: '13px' }}>Chỉnh sửa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
