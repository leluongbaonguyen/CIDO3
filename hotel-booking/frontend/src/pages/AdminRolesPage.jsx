import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminRolesPage() {
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        // Stub
        setRoles([
            { id: 1, name: 'Quản lý', permissions: 'Full Access (CRUD)' },
            { id: 2, name: 'Lễ tân', permissions: 'Booking (CRU), Rooms (R)' },
            { id: 3, name: 'Khách hàng', permissions: 'Limited Profile Access' }
        ]);
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--text-dark)' }}>Quản lý Vai Trò Nguời Dùng</h2>
                <button className="btn">+ Thêm quyền truy cập</button>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                            <th style={{ padding: '16px', fontWeight: '600' }}>ID</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Tên Quyền (Vai trò)</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Chi tiết phân quyền</th>
                            <th style={{ padding: '16px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((r) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '16px' }}>{r.id}</td>
                                <td style={{ padding: '16px', fontWeight: '600', color: 'var(--primary)' }}>{r.name}</td>
                                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>{r.permissions}</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button className="btn outline" style={{ padding: '6px 12px', fontSize: '13px', marginRight: '8px' }}>Chỉnh sửa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
