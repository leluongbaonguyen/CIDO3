export default function BlogPage() {
  const blogs = [
    { id: 1, title: 'Top 10 địa điểm không thể bỏ qua tại Đà Nẵng', date: '20/04/2026', author: 'Lê Nguyên', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80', excerpt: 'Khám phá những bãi biển tuyệt đẹp và những cây cầu biểu tượng của thành phố đáng sống nhất Việt Nam...' },
    { id: 2, title: 'Bí quyết tận hưởng kỳ nghỉ trọn vẹn tại XTRAVEL', date: '15/04/2026', author: 'Trần Huy', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', excerpt: 'Từ cách đặt phòng đến việc trải nghiệm các dịch vụ spa cao cấp, hãy cùng chúng tôi khám phá...' },
    { id: 3, title: 'Ẩm thực tinh hoa tại nhà hàng XTRAVEL Kitchen', date: '10/04/2026', author: 'Phan Hiền', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80', excerpt: 'Hành trình vị giác với những món ăn kết hợp hoàn hảo giữa truyền thống và hiện đại...' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out', padding: '60px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px' }}>Bài viết & Tin tức</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Cập nhật những thông tin mới nhất về du lịch và ưu đãi tại XTRAVEL.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          {blogs.map(blog => (
            <article key={blog.id} style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span><i className="far fa-calendar-alt" style={{ marginRight: '6px' }}></i>{blog.date}</span>
                  <span><i className="far fa-user" style={{ marginRight: '6px' }}></i>{blog.author}</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '16px', lineHeight: '1.4' }}>{blog.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>{blog.excerpt}</p>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Đọc thêm <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
