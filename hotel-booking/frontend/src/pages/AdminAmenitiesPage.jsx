import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminAmenitiesPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ name: '', description: '' });
    const [showForm, setShowForm] = useState(false);

    const load = async () => {
        try {
            const data = await api('/amenities');
            setItems(data);
        } catch (e) {
            console.error(e);
            setItems([
                { id: 1, name: 'Wifi miễn phí', description: 'Tốc độ cao 5Ghz' },
                { id: 2, name: 'Hồ bơi', description: 'Mở cửa từ 6h đến 22h' }
            ]);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--text-dark)' }}>Quản lý Tiện Nghi</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="text" placeholder="Tìm kiếm..." className="search-input" style={{ width: '250px', padding: '10px 16px' }} />
                    <button className="btn" onClick={() => setShowForm(!showForm)}>+ Thêm tiện nghi</button>
                </div>
            </div>

            {showForm && (
                <form className="card form" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Thêm Tiện Nghi Mới</h3>
                    <div className="input-group">
                        <label className="input-label">Tên tiện nghi</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Mô tả chi tiết</label>
                        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <button className="btn">Lưu tiện nghi</button>
                </form>
            )}

            <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                            <th style={{ padding: '16px', fontWeight: '600' }}>ID</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Tên Tiện Nghi</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Mô tả</th>
                            <th style={{ padding: '16px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '16px', fontWeight: '500' }}>#{t.id}</td>
                                <td style={{ padding: '16px', fontWeight: '600' }}>{t.name}</td>
                                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{t.description}</td>
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
