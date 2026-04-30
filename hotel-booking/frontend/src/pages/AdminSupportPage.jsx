import { useState } from 'react';

export default function AdminSupportPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([
    { id: 1, name: 'Nguyễn Văn A', lastMsg: 'Tôi muốn đặt thêm dịch vụ đưa đón', time: '5 phút trước', unread: true },
    { id: 2, name: 'Trần Thị B', lastMsg: 'Phòng 301 có bồn tắm không ạ?', time: '12 phút trước', unread: false },
    { id: 3, name: 'Lê Văn C', lastMsg: 'Cảm ơn bạn nhé!', time: '1 giờ trước', unread: false },
  ]);

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Sidebar: Chat List */}
      <div style={{ width: '350px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Hỗ trợ trực tuyến</h3>
          <div style={{ position: 'relative', marginTop: '16px' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input type="text" placeholder="Tìm tin nhắn..." style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat)}
              style={{ padding: '16px 24px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', backgroundColor: activeChat?.id === chat.id ? '#f0f9ff' : '#fff', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{chat.name}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{chat.time}</span>
              </div>
              <div style={{ fontSize: '13px', color: chat.unread ? '#1e293b' : '#64748b', fontWeight: chat.unread ? '600' : '400', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{chat.lastMsg}</span>
                {chat.unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9', marginTop: '4px' }}></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px 32px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700' }}>
                  {activeChat.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{activeChat.name}</div>
                  <div style={{ fontSize: '12px', color: '#10b981' }}>● Đang trực tuyến</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', color: '#64748b' }}>
                <i className="fas fa-phone-alt" style={{ cursor: 'pointer' }}></i>
                <i className="fas fa-video" style={{ cursor: 'pointer' }}></i>
                <i className="fas fa-info-circle" style={{ cursor: 'pointer' }}></i>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ alignSelf: 'flex-start', maxWidth: '70%', backgroundColor: '#fff', padding: '12px 16px', borderRadius: '12px 12px 12px 0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '14px', color: '#334155' }}>
                Chào bạn, tôi muốn hỏi về phòng 301.
              </div>
              <div style={{ alignSelf: 'flex-end', maxWidth: '70%', backgroundColor: '#0ea5e9', padding: '12px 16px', borderRadius: '12px 12px 0 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '14px', color: '#fff' }}>
                Chào bạn! Vâng ạ, phòng 301 là loại phòng Deluxe bên mình có bồn tắm nằm và view biển ạ. Bạn cần thêm thông tin gì không?
              </div>
              <div style={{ alignSelf: 'flex-start', maxWidth: '70%', backgroundColor: '#fff', padding: '12px 16px', borderRadius: '12px 12px 12px 0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '14px', color: '#334155' }}>
                {activeChat.lastMsg}
              </div>
            </div>

            {/* Chat Input */}
            <div style={{ padding: '24px 32px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <i className="far fa-smile" style={{ fontSize: '20px', color: '#64748b', cursor: 'pointer' }}></i>
                <i className="fas fa-paperclip" style={{ fontSize: '20px', color: '#64748b', cursor: 'pointer' }}></i>
                <input type="text" placeholder="Nhập tin nhắn phản hồi..." style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
                <button style={{ backgroundColor: '#0ea5e9', color: '#fff', border: 'none', width: '45px', height: '45px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
            <i className="far fa-comments" style={{ fontSize: '64px', marginBottom: '16px' }}></i>
            <p>Chọn một cuộc trò chuyện để bắt đầu hỗ trợ khách hàng</p>
          </div>
        )}
      </div>
    </div>
  );
}
