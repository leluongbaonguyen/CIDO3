import React, { useState } from 'react';

export default function BlogPage() {
  const [selectedBlog, setSelectedBlog] = useState(null);

  const featuredBlog = {
    id: 100,
    title: 'Hành trình khám phá vẻ đẹp kỳ ảo của Đà Nẵng từ tầm nhìn của BOOKING X',
    date: '25 Th04, 2026',
    img: '/images/img_7b0b87cdb2.jpeg',
    category: 'KHÁM PHÁ',
    content: `Đà Nẵng – thành phố đáng sống bậc nhất Việt Nam – luôn thu hút du khách bởi những bãi biển cát trắng mịn màng và danh lam thắng cảnh làm say đắm lòng người. Trải nghiệm Đà Nẵng tại hệ thống BOOKING X sẽ mang lại cho quý khách một góc nhìn hoàn toàn mới, hòa mình vào thiên nhiên và những trải nghiệm đẳng cấp thượng lưu.

Dưới đây là những địa điểm kỳ vĩ không thể bỏ lỡ tại Đà Nẵng:
1. Bán đảo Sơn Trà: Nơi được ví như "lá phổi xanh" của Đà Nẵng với chùa Linh Ứng tôn nghiêm, tượng Phật Bà Quan Âm cao nhất Việt Nam hướng mặt ra biển khơi xanh ngắt.
2. Ngũ Hành Sơn: Quần thể 5 ngọn núi đá vôi kỳ vĩ lưu giữ nhiều hang động huyền bí và các ngôi chùa cổ tự linh thiêng hàng trăm năm tuổi.
3. Bà Nà Hills: Thiên đường mây ngàn với Cầu Vàng huyền thoại được nâng đỡ bởi hai bàn tay khổng lồ rêu phong, đưa du khách lạc vào ngôi làng Pháp cổ kính giữa lòng miền Trung.
4. Cầu Rồng phun lửa: Biểu tượng phát triển thịnh vượng của thành phố, phun lửa và nước đầy mãn nhãn vào mỗi dịp cuối tuần lúc 21:00.

Đến với Đà Nẵng và lưu trú tại BOOKING X, chúng tôi cam kết đem lại cho bạn một kỳ nghỉ dưỡng trọn vẹn, đáng nhớ nhất!`
  };

  const blogs = [
    { 
      id: 1, 
      title: 'Top 5 hoạt động không thể bỏ qua khi nghỉ dưỡng tại BOOKING X', 
      date: '20 Th04, 2026', 
      img: '/images/img_6f8ad18268.jpeg',
      category: 'TRẢI NGHIỆM',
      content: `Chào mừng quý khách đến với BOOKING X – thiên đường nghỉ dưỡng 5 sao sang trọng bậc nhất. Để hành trình nghỉ dưỡng thêm phần đáng nhớ, hãy lưu lại ngay top 5 hoạt động đỉnh cao sau đây:

1. Thư giãn tại Hồ bơi vô cực ngắm hoàng hôn: Hãy thả mình vào dòng nước mát lành của hồ bơi chân mây ôm trọn vịnh biển xanh mát, thưởng thức ly cocktail nhiệt đới và ngắm nhìn khoảnh khắc mặt trời đỏ rực từ từ buông xuống đường chân trời.
2. Trị liệu chuyên sâu tại Spa thảo mộc hoàng gia: Rũ bỏ mọi lo toan với liệu trình massage cổ truyền kết hợp tinh dầu thảo dược hữu cơ tự nhiên dưới bàn tay khéo léo của các trị liệu viên chuyên nghiệp.
3. Bữa tối lãng mạn dưới ánh nến tại nhà hàng Blue Ocean: Trải nghiệm bữa tiệc ẩm thực thượng hạng với tiếng sóng vỗ rì rào, gió biển hiu hiu cùng không gian riêng tư được trang trí nến và hoa tươi.
4. Chèo thuyền Kayak và các môn thể thao nước biển: Đánh thức năng lượng mùa hè với hoạt động chèo thuyền kayak, mô tô nước lướt sóng biển, đem đến cảm giác phấn khích, chinh phục đại dương.
5. Tham gia lớp học nấu ăn truyền thống Việt Nam: Đồng hành cùng Bếp trưởng khám phá tinh hoa ẩm thực Việt qua lớp học tự tay chế biến các món đặc sản miền Trung chuẩn vị như mì Quảng, bánh xèo.`
    },
    { 
      id: 2, 
      title: 'Cẩm nang thưởng thức ẩm thực tinh túy tại nhà hàng Blue Ocean', 
      date: '15 Th04, 2026', 
      img: '/images/img_3e8afbec1f.jpeg',
      category: 'ẨM THỰC',
      content: `Nhà hàng Blue Ocean nằm ngay sát bờ biển của resort BOOKING X, là điểm hẹn tinh hoa giao thoa giữa ẩm thực truyền thống Việt Nam và hương vị ẩm thực Địa Trung Hải thượng hạng.

Đến với Blue Ocean, thực khách sẽ được đắm chìm vào không gian kiến trúc mở sang trọng kết hợp tiếng sóng vỗ du dương:
- Hải sản tươi sống đánh bắt trong ngày: Thực đơn hải sản đặc sắc từ cua Huỳnh Đế, tôm hùm bông, cho đến bào ngư được chế biến cầu kỳ nhằm giữ trọn vị ngọt tự nhiên của đại dương.
- Trải nghiệm Steak bò Wagyu hảo hạng: Miếng thịt bò Wagyu nhập khẩu chính ngạch được nướng đá muối hồng giữ nước bên trong mềm tan như bơ, ăn kèm nước sốt nấm Truffle đen độc quyền.
- Hầm rượu vang quý hiếm: Nhà hàng sở hữu bộ sưu tập rượu vang thượng hạng nhập khẩu từ Pháp, Ý, Chile với hương vị đậm đà kết hợp hoàn hảo cùng các món steak và hải sản.

Hãy đặt bàn trước lúc hoàng hôn để chọn được vị trí đẹp nhất ngắm trọn vẹn bờ biển Đà Nẵng thơ mộng!`
    },
    { 
      id: 3, 
      title: 'Bí quyết đặt phòng giá tốt nhất mùa cao điểm', 
      date: '10 Th04, 2026', 
      img: '/images/img_d31fdb5400.jpeg',
      category: 'BÍ QUYẾT',
      content: `Kỳ nghỉ hè cao điểm luôn là khoảng thời gian tuyệt vời để cả gia đình cùng nhau đi du lịch, nhưng đi kèm đó là nỗi lo cháy phòng và giá dịch vụ tăng cao. BOOKING X xin chia sẻ cẩm nang đặt phòng thông minh từ các chuyên gia để bạn luôn sở hữu mức giá ưu đãi nhất:

1. Đặt phòng sớm trước ít nhất 30 - 45 ngày: Việc lên kế hoạch sớm không chỉ giúp bạn giữ được hạng phòng view biển đẹp nhất mà còn nhận mức chiết khấu early bird lên tới 20% từ resort.
2. Đăng ký thành viên VIP của BOOKING X: Luôn đăng nhập thành viên để hưởng chính sách giá độc quyền ưu đãi 10% trọn đời và dịch vụ đưa đón sân bay bằng xe luxury limousine miễn phí.
3. Đặt các gói Combo Trọn gói (All-Inclusive): Thay vì đặt riêng lẻ phòng và các bữa ăn, hãy lựa chọn gói combo đã bao gồm buffet sáng tối, spa trị liệu và các tiện ích vui chơi để tối ưu hóa chi phí đến 35%.
4. Lựa chọn ngày nhận phòng vào giữa tuần (Chủ nhật đến Thứ năm): Mức giá giữa tuần luôn dễ chịu và không gian resort sẽ thư thái, yên tĩnh hơn so với dịp cuối tuần đông đúc.`
    }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '140px 0 100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* FEATURED POST - CẦU RỒNG ĐÀ NẴNG */}
        <div 
          onClick={() => setSelectedBlog(featuredBlog)}
          className="animate-up" 
          style={{ 
            position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '500px', 
            marginBottom: '80px', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', cursor: 'pointer',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
           <img src={featuredBlog.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Da Nang" />
           <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '60px' }}>
              <span style={{ background: '#ff5a3d', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', width: 'fit-content', marginBottom: '20px' }}>
                {featuredBlog.category}
              </span>
              <h2 style={{ fontSize: '42px', color: '#fff', fontWeight: '800', maxWidth: '800px', lineHeight: '1.2', fontFamily: '"Playfair Display", serif' }}>
                {featuredBlog.title}
              </h2>
              <span style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '15px', fontWeight: '600' }}>Nhấp để đọc chi tiết bài viết →</span>
           </div>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '50px' }}>
           <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', fontFamily: '"Playfair Display", serif' }}>Cẩm nang du lịch</h3>
           <div style={{ width: '60px', height: '4px', background: 'var(--gold)', marginTop: '12px' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
           {blogs.map(blog => (
             <div 
               key={blog.id} 
               onClick={() => setSelectedBlog(blog)}
               className="animate-up hover-premium" 
               style={{ 
                 background: '#fff', borderRadius: '20px', overflow: 'hidden', 
                 boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer',
                 border: '1px solid #f1f5f9', transition: 'all 0.3s'
               }}
               onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-10px)'; }}
               onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(0)'; }}
             >
                <img src={blog.img} style={{ width: '100%', height: '240px', objectFit: 'cover' }} alt="Blog Da Nang" />
                <div style={{ padding: '30px' }}>
                   <p style={{ fontSize: '13px', color: '#888', fontWeight: '600', marginBottom: '15px' }}>{blog.date}</p>
                   <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', lineHeight: '1.4', marginBottom: '25px', height: '56px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                     {blog.title}
                   </h4>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setSelectedBlog(blog); }}
                     style={{ border: 'none', background: 'transparent', color: '#0ea5e9', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}
                   >
                     Đọc thêm <i className="fas fa-arrow-right"></i>
                   </button>
                </div>
             </div>
           ))}
        </div>

      </div>

      {/* ARTICLE READER MODAL */}
      {selectedBlog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          backgroundColor: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card-luxury animate-fade-in" style={{
            width: '100%', maxWidth: '750px', backgroundColor: '#fff',
            borderRadius: '30px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            border: '1px solid rgba(196,166,97,0.2)'
          }}>
            {/* Header image band */}
            <div style={{ height: '280px', position: 'relative' }}>
              <img src={selectedBlog.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Header" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}></div>
              <button onClick={() => setSelectedBlog(null)} style={{
                position: 'absolute', top: '25px', right: '25px',
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '18px', color: '#0f172a', transition: '0.3s'
              }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}>
                <i className="fas fa-times"></i>
              </button>
              <div style={{ position: 'absolute', bottom: '25px', left: '35px' }}>
                <span style={{ background: 'var(--gold)', color: '#fff', padding: '6px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '800' }}>
                  {selectedBlog.category}
                </span>
                <p style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginTop: '10px' }}>Bài viết đăng ngày {selectedBlog.date}</p>
              </div>
            </div>

            {/* Scrollable text container */}
            <div style={{ padding: '35px 40px', maxHeight: '420px', overflowY: 'auto' }}>
              <h3 className="serif" style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', lineHeight: '1.3' }}>
                {selectedBlog.title}
              </h3>
              
              <div style={{ 
                color: '#475569', fontSize: '15px', lineHeight: '1.8', 
                whiteSpace: 'pre-wrap', textAlign: 'justify' 
              }}>
                {selectedBlog.content}
              </div>
            </div>

            {/* Footer close bar */}
            <div style={{ padding: '20px 40px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button onClick={() => setSelectedBlog(null)} className="btn-gold" style={{ padding: '12px 30px', fontSize: '13px' }}>
                Đóng bài viết
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
