import { Link } from 'react-router-dom';
import HeroSearch from '../components/HeroSearch';

export default function HomePage() {
  return (
    <>
      <section className="hero-wrapper">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Từ Đông Nam Á Đến Thế Giới, Trong Tầm Tay Bạn</h1>
          <p className="hero-subtitle">Đặt khách sạn, vé máy bay và trải nghiệm một cách dễ dàng với Traveloka</p>
        </div>
      </section>

      <HeroSearch />

      <section className="container">
        <h2 className="section-title">Chương trình Khuyến mãi</h2>
        <div className="promo-grid">
          <div className="promo-card">
            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Khuyến mãi 1" className="promo-img" />
            <div className="promo-content">
              <h3 className="promo-title">Sale Hè Rực Rỡ - Giảm Đến 50%</h3>
              <p className="promo-desc">Trải nghiệm kỳ nghỉ tuyệt vời với ưu đãi không thể bỏ qua tại các resort hàng đầu.</p>
            </div>
          </div>
          <div className="promo-card">
            <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Khuyến mãi 2" className="promo-img" />
            <div className="promo-content">
              <h3 className="promo-title">Đổi Gió Cuối Tuần - Staycation</h3>
              <p className="promo-desc">Tận hưởng không gian sang trọng với mức giá ưu đãi đặc biệt cho 2 ngày cuối tuần.</p>
            </div>
          </div>
          <div className="promo-card">
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Khuyến mãi 3" className="promo-img" />
            <div className="promo-content">
              <h3 className="promo-title">Khám Phá Biển Xanh Giảm 30%</h3>
              <p className="promo-desc">Ưu đãi phòng view biển dành riêng cho thành viên khi đặt trước 14 ngày.</p>
            </div>
          </div>
        </div>

        <h2 className="section-title">Điểm đến thịnh hành</h2>
        <div className="promo-grid">
          <div className="promo-card">
            <img src="https://images.unsplash.com/photo-1557406981-d1cabb1d73a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Đà Lạt" className="promo-img" style={{ height: '240px' }} />
            <div className="promo-content">
              <h3 className="promo-title">Đà Lạt</h3>
              <p className="promo-desc">Thành phố mộng mơ với khí hậu se lạnh dịu dàng.</p>
            </div>
          </div>
          <div className="promo-card">
            <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Nha Trang" className="promo-img" style={{ height: '240px' }} />
            <div className="promo-content">
              <h3 className="promo-title">Nha Trang</h3>
              <p className="promo-desc">Biển xanh trong vắt, bãi cát trắng trải dài.</p>
            </div>
          </div>
          <div className="promo-card">
            <img src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Đà Nẵng" className="promo-img" style={{ height: '240px' }} />
            <div className="promo-content">
              <h3 className="promo-title">Đà Nẵng</h3>
              <p className="promo-desc">Thành phố đáng sống bậc nhất với Bà Nà hùng vĩ.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
