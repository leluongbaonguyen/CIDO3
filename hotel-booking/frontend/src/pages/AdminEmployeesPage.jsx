import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminEmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        department: 'Lễ tân', position: 'Nhân viên lễ tân', role: 'Nhân viên'
    });

    const load = async () => {
        try {
            const data = await api('/admin/employees');
            setEmployees(data);
        } catch (e) {
            console.error(e);
            // Stub data
            setEmployees([
                { id: 1, first_name: 'Nguyễn', last_name: 'Văn A', email: 'vana.nv@hotel.com', phone: '0912345678', department: 'Quản lý', position: 'Quản lý trưởng', hire_date: '2023-01-15', status: 'Hoạt động', role: 'Quản lý' },
                { id: 2, first_name: 'Lê', last_name: 'Thị B', email: 'letb@hotel.com', phone: '0988776655', department: 'Lễ tân', position: 'Trưởng lễ tân', hire_date: '2024-05-20', status: 'Hoạt động', role: 'Nhân viên' }
            ]);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--text-dark)' }}>Quản lý Nhân viên</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="text" placeholder="Tìm kiếm nhân viên..." className="search-input" style={{ width: '250px', padding: '10px 16px' }} />
                    <button className="btn" onClick={() => setShowForm(!showForm)}>+ Thêm nhân viên</button>
                </div>
            </div>

            {showForm && (
                <form className="card form" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Thêm Nhân Viên Mới</h3>

                    <div className="grid2">
                        <div className="input-group">
                            <label className="input-label">Họ</label>
                            <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Tên</label>
                            <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                        </div>
                    </div>

                    <div className="grid2">
                        <div className="input-group">
                            <label className="input-label">Email nội bộ</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Số điện thoại</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                        </div>
                    </div>

                    <div className="grid3">
                        <div className="input-group">
                            <label className="input-label">Phòng ban</label>
                            <select className="search-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                <option value="Quản lý">Quản lý</option>
                                <option value="Lễ tân">Lễ tân</option>
                                <option value="Kế toán">Kế toán</option>
                                <option value="Buồng phòng">Buồng phòng</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Vị trí (Chức danh)</label>
                            <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Vai trò hệ thống</label>
                            <select className="search-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                <option value="Nhân viên">Nhân viên (Cơ bản)</option>
                                <option value="Quản lý">Quản lý (Full)</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn" style={{ marginTop: '16px' }}>Lưu thông tin nhân viên</button>
                </form>
            )}

            <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Nhân viên</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Liên hệ</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Phòng ban / Vị trí</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Vai trò</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Trạng thái</th>
                            <th style={{ padding: '16px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((e) => (
                            <tr key={e.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '600' }}>{e.first_name} {e.last_name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Vào làm: {new Date(e.hire_date).toLocaleDateString('vi-VN')}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '14px' }}>{e.email}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{e.phone}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '500' }}>{e.department}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{e.position}</div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                    {e.role === 'Quản lý' ? <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{e.role}</span> : e.role}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    {e.status === 'Hoạt động' ? <span className="badge badge-green">Hoạt động</span> : <span className="badge badge-orange">{e.status}</span>}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button className="btn outline" style={{ padding: '6px 12px', fontSize: '13px', marginRight: '8px' }}>Sửa</button>
                                    <button className="btn danger" style={{ padding: '6px 12px', fontSize: '13px' }}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
