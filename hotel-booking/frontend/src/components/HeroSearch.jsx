import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroSearch() {
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState({
        location: '',
        checkIn: '',
        checkOut: '',
        guests: 1
    });

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/rooms?search=${searchData.location}`);
    };

    return (
        <div className="search-widget-container">
            <div className="search-widget">
                <div className="widget-tabs">
                    <button className="widget-tab active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        Khách sạn
                    </button>
                    <button className="widget-tab">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        Vé máy bay
                    </button>
                    <button className="widget-tab">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Combo Tiết kiệm
                    </button>
                </div>

                <form onSubmit={handleSearch} className="search-form-grid">
                    <div className="input-group">
                        <label className="input-label">Thành phố, địa điểm hoặc tên khách sạn</label>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Ví dụ: Đà Lạt, Vũng Tàu..."
                            value={searchData.location}
                            onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Nhận phòng</label>
                        <input
                            type="date"
                            className="search-input"
                            value={searchData.checkIn}
                            onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Số khách</label>
                        <select
                            className="search-input"
                            value={searchData.guests}
                            onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
                        >
                            <option value="1">1 Người lớn</option>
                            <option value="2">2 Người lớn</option>
                            <option value="3">3 Người lớn</option>
                            <option value="4">4 Người lớn</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        Tìm kiếm
                    </button>
                </form>
            </div>
        </div>
    );
}
