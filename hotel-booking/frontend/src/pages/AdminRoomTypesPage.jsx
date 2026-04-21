import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminRoomTypesPage() {
    const [types, setTypes] = useState([]);

    const load = async () => {
        try {
            const data = await api('/room-types');
            setTypes(data);
        } catch (e) {
            console.error(e);
            setTypes([
                { id: 1, name: 'Standard (Tiêu chuẩn)', photo_urls: '', base_price: '500000', max_occupancy: 2 },
                { id: 2, name: 'VIP Suite', photo_urls: '', base_price: '2500000', max_occupancy: 4 }
            ]);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--text-dark)' }}>Quản lý Loại Phòng</h2>
                <button className="btn">+ Thêm loại phòng</button>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                            <th style={{ padding: '16px', fontWeight: '600' }}>STT</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Hình ảnh</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Tên loại phòng</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Giá phòng / đêm</th>
                            <th style={{ padding: '16px', fontWeight: '600' }}>Sức chứa</th>
                            <th style={{ padding: '16px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {types.map((t, index) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '16px', fontWeight: '500' }}>{index + 1}</td>
                                <td style={{ padding: '16px' }}>
                                    <img src={t.photo_urls || 'https://via.placeholder.com/80x50'} alt={t.name} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td style={{ padding: '16px', fontWeight: '600' }}>{t.name}</td>
                                <td style={{ padding: '16px', color: 'var(--secondary)', fontWeight: '600' }}>{Number(t.base_price).toLocaleString('vi-VN')} đ</td>
                                <td style={{ padding: '16px' }}>{t.max_occupancy} Người</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button className="btn outline" style={{ padding: '6px 12px', fontSize: '13px', marginRight: '8px' }}>Chỉnh sửa</button>
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
