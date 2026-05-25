import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // List of conversations for logged-in user
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null); // Active conversation object
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // User's own bookings for quick selection
  const [myBookings, setMyBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [subject, setSubject] = useState('Hỗ trợ đặt phòng');

  // Local storage backup for Guest active conversation
  const [guestConvId, setGuestConvId] = useState(() => {
    return localStorage.getItem('guest_chat_id') || null;
  });

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Load user's conversations & bookings if logged in
  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      loadConversations();
      loadMyBookings();
    } else if (guestConvId) {
      loadGuestConversation(guestConvId);
    }
  }, [user, guestConvId]);

  // Handle active conversation message fetching and polling
  useEffect(() => {
    if (isOpen && activeConv) {
      fetchMessages(activeConv.id);
      
      // Start polling every 3 seconds for new agent replies
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        fetchMessages(activeConv.id, true);
      }, 3000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, activeConv]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await api('/chat/conversations');
      setConversations(data);
      // Auto-select first open conversation if exists
      const openConv = data.find(c => c.status !== 'CLOSED');
      if (openConv && !activeConv) {
        setActiveConv(openConv);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const loadMyBookings = async () => {
    try {
      const data = await api('/bookings/my');
      setMyBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const loadGuestConversation = async (convId) => {
    try {
      const data = await api(`/chat/conversations/${convId}/messages`);
      // Re-hydrate the active conversation from backup
      setActiveConv({ id: Number(convId), status: 'WAITING', subject: 'Khách vãng lai' });
    } catch (err) {
      // Clear backup if not found
      localStorage.removeItem('guest_chat_id');
      setGuestConvId(null);
    }
  };

  const fetchMessages = async (convId, isPoll = false) => {
    try {
      const data = await api(`/chat/conversations/${convId}/messages`);
      // Update only if length differs or not polling
      if (!isPoll || data.length !== messages.length) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleStartChat = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const newConv = await api('/chat/conversations', {
        method: 'POST',
        body: {
          subject: user ? subject : 'Khách vãng lai hỏi thông tin',
          relatedBookingId: selectedBookingId || null
        }
      });

      if (!user) {
        localStorage.setItem('guest_chat_id', newConv.id);
        setGuestConvId(newConv.id);
      }

      setActiveConv(newConv);
      setMessages([]);
      setInput('');
      
      if (user) {
        loadConversations();
      }
    } catch (err) {
      alert('Không thể tạo cuộc hội thoại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const finalContent = textToSend || input;
    if (!finalContent.trim() || !activeConv) return;

    try {
      const sentMsg = await api(`/chat/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        body: { messageContent: finalContent }
      });
      
      setMessages(prev => [...prev, sentMsg]);
      if (!textToSend) setInput('');
    } catch (err) {
      alert('Không gửi được tin nhắn: ' + err.message);
    }
  };

  const handleCloseActiveChat = async () => {
    if (!activeConv) return;
    if (!window.confirm('Bạn muốn kết thúc và đóng phiên hỗ trợ này chứ?')) return;
    
    try {
      await api(`/chat/conversations/${activeConv.id}/close`, { method: 'PATCH' });
      if (!user) {
        localStorage.removeItem('guest_chat_id');
        setGuestConvId(null);
      }
      setActiveConv(null);
      setMessages([]);
      if (user) loadConversations();
    } catch (err) {
      alert('Không thể đóng phòng chat: ' + err.message);
    }
  };

  // Helper macro senders
  const triggerMacro = (type) => {
    let msg = '';
    if (type === 'RESCHEDULE') {
      msg = `[Yêu cầu Đổi ngày nhận/trả phòng] Xin chào, tôi muốn dời lịch của đơn đặt phòng này sang ngày khác.`;
    } else if (type === 'CANCEL') {
      msg = `[Yêu cầu Hủy đơn phòng] Tôi muốn hủy đơn đặt phòng của mình và làm thủ tục hoàn trả nếu có.`;
    } else if (type === 'TRANSFER') {
      msg = `[Xác nhận Chuyển khoản] Tôi đã chuyển tiền thanh toán cho phòng, xin hãy kiểm tra và xác nhận.`;
    } else if (type === 'CONSULT') {
      msg = `Xin chào, tôi cần được tư vấn về phòng nghỉ, dịch vụ buffet và đưa đón của resort.`;
    }
    handleSendMessage(msg);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'WAITING': return { text: 'ĐANG CHỜ', color: '#ef4444' };
      case 'PROCESSING': return { text: 'ĐANG XỬ LÝ', color: '#D4AF37' };
      case 'RESPONDED': return { text: 'ĐÃ PHẢN HỒI', color: '#10b981' };
      case 'CLOSED': return { text: 'ĐÃ ĐÓNG', color: '#64748b' };
      case 'TRANSFER_ADMIN': return { text: 'GỬI QUẢN TRỊ', color: '#8b5cf6' };
      default: return { text: 'HOẠT ĐỘNG', color: 'var(--gold)' };
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000 }}>
      {/* Floating Golden Trigger Badge */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '70px', height: '70px', 
            background: 'linear-gradient(135deg, #0a0f1d 0%, #1e293b 100%)', 
            borderRadius: '24px', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            color: 'var(--gold)', 
            fontSize: '28px', cursor: 'pointer', 
            boxShadow: '0 15px 35px rgba(0,0,0,0.35)',
            border: '2px solid rgba(212, 175, 55, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 20px 45px rgba(212, 175, 55, 0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.35)';
          }}
        >
          <i className="fas fa-comments"></i>
          {conversations.some(c => c.status === 'RESPONDED') && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '15px', height: '15px', background: '#ef4444', borderRadius: '50%' }} />
          )}
        </div>
      )}

      {/* Main Luxury Glassmorphism Chatbox */}
      {isOpen && (
        <div style={{ 
          width: '420px', height: '620px', 
          backgroundColor: '#0a0f1d', 
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '30px', 
          display: 'flex', flexDirection: 'column', 
          overflow: 'hidden', 
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          animation: 'fadeInUp 0.4s ease-out'
        }}>
          
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(to right, #0a0f1d 0%, #1e293b 100%)', 
            color: 'white', padding: '24px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: 'rgba(212, 175, 55, 0.1)', 
                color: 'var(--gold)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <i className="fas fa-headset" style={{ fontSize: '18px' }}></i>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '15px', color: '#fff', letterSpacing: '0.5px' }}>BOOKING X SUPPORT</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} /> 
                  Online (Hỗ trợ 24/7)
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {activeConv && activeConv.status !== 'CLOSED' && (
                <button onClick={handleCloseActiveChat} title="Đóng cuộc trò chuyện" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>
                  <i className="fas fa-door-closed"></i>
                </button>
              )}
              <i className="fas fa-times" style={{ cursor: 'pointer', opacity: 0.6, fontSize: '18px', color: '#fff' }} onClick={() => setIsOpen(false)}></i>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            
            {/* VIEW 1: Active Conversation Message Log */}
            {activeConv ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Conversation Meta Panel */}
                <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>
                    Chủ đề: <span style={{ color: 'var(--gold)' }}>{activeConv.subject}</span>
                  </div>
                  <span style={{ 
                    fontSize: '9px', fontWeight: '800', 
                    color: getStatusLabel(activeConv.status).color, 
                    padding: '4px 10px', borderRadius: '50px', 
                    background: `${getStatusLabel(activeConv.status).color}15`,
                    border: `1px solid ${getStatusLabel(activeConv.status).color}40`
                  }}>
                    {getStatusLabel(activeConv.status).text}
                  </span>
                </div>

                {/* Message list */}
                <div style={{ 
                  flex: 1, padding: '20px', overflowY: 'auto', 
                  display: 'flex', flexDirection: 'column', gap: '16px',
                  background: 'rgba(10,15,29,0.95)'
                }}>
                  <div style={{ textAlign: 'center', margin: '10px 0' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', padding: '5px 12px', borderRadius: '50px' }}>
                      Phòng chat bảo mật bắt đầu
                    </span>
                  </div>

                  {messages.map((msg) => {
                    const isSelf = msg.sender_role === 'CUSTOMER' || msg.sender_role === 'GUEST';
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '80%', padding: '12px 18px', borderRadius: '18px', fontSize: '14px', lineHeight: '1.5',
                          backgroundColor: isSelf ? 'var(--gold)' : 'rgba(255,255,255,0.07)',
                          color: isSelf ? '#0a0f1d' : '#fff',
                          border: isSelf ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          fontWeight: isSelf ? '700' : '500',
                          borderBottomRightRadius: isSelf ? '4px' : '18px',
                          borderBottomLeftRadius: !isSelf ? '4px' : '18px',
                          boxShadow: isSelf ? '0 5px 15px rgba(212,175,55,0.2)' : 'none'
                        }}>
                          {msg.message_content}
                          <div style={{ 
                            fontSize: '9px', 
                            textAlign: 'right', 
                            marginTop: '5px', 
                            opacity: 0.6,
                            color: isSelf ? '#0a0f1d' : 'rgba(255,255,255,0.4)' 
                          }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Interactive Action Shortcuts (Macros) */}
                {activeConv.status !== 'CLOSED' && (
                  <div style={{ 
                    padding: '10px 20px', 
                    display: 'flex', gap: '8px', 
                    overflowX: 'auto', 
                    backgroundColor: '#0a0f1d',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    scrollbarWidth: 'none'
                  }}>
                    {user && user.role === 'CUSTOMER' && (
                      <>
                        <button onClick={() => triggerMacro('RESCHEDULE')} style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(212,175,55,0.05)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)', padding: '6px 12px', borderRadius: '50px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>
                          <i className="far fa-calendar-alt"></i> Đổi ngày
                        </button>
                        <button onClick={() => triggerMacro('CANCEL')} style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(239,68,68,0.05)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: '50px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>
                          <i className="fas fa-trash-alt"></i> Hủy đơn
                        </button>
                        <button onClick={() => triggerMacro('TRANSFER')} style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(16,185,129,0.05)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '6px 12px', borderRadius: '50px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>
                          <i className="fas fa-money-check-alt"></i> Xác nhận chuyển tiền
                        </button>
                      </>
                    )}
                    <button onClick={() => triggerMacro('CONSULT')} style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '50px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>
                      <i className="fas fa-question-circle"></i> Tư vấn phòng
                    </button>
                  </div>
                )}

                {/* Back to List / New chat toggle */}
                {user && user.role === 'CUSTOMER' && (
                  <button 
                    onClick={() => { setActiveConv(null); loadConversations(); }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '10px', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> XEM DANH SÁCH CUỘC TRÒ CHUYỆN KHÁC
                  </button>
                )}

                {/* Chatbox Input Field */}
                {activeConv.status !== 'CLOSED' ? (
                  <div style={{ display: 'flex', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#0a0f1d' }}>
                    <input 
                      type="text" placeholder="Nhập nội dung cần hỗ trợ..." value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      style={{ 
                        flex: 1, border: '1px solid rgba(212,175,55,0.2)', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderRadius: '12px', padding: '12px 18px', 
                        outline: 'none', fontSize: '14px', color: '#fff' 
                      }}
                    />
                    <button 
                      onClick={() => handleSendMessage()}
                      style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--gold)', fontSize: '20px', paddingLeft: '15px', cursor: 'pointer' }}
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600' }}>
                    <i className="fas fa-lock" style={{ marginRight: '6px' }}></i> Cuộc trò chuyện này đã đóng.
                  </div>
                )}

              </div>
            ) : (
              
              /* VIEW 2: Chat Lobby (Selection list or Start chat) */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px', overflowY: 'auto', background: 'rgba(10,15,29,0.95)', color: '#fff' }}>
                
                {/* Guest State Prompt */}
                {!user ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '20px 0' }}>
                    <i className="fas fa-user-clock" style={{ fontSize: '50px', color: 'var(--gold)' }}></i>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', fontFamily: '"Playfair Display", serif' }}>Xin chào Quý khách!</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                      Quý khách chưa đăng nhập. Quý khách có thể bắt đầu chat ngay để hỏi thông tin cơ bản về khách sạn hoặc dịch vụ.
                    </p>
                    
                    <button 
                      onClick={() => handleStartChat()}
                      className="btn-gold" style={{ padding: '15px', width: '100%', justifyContent: 'center', borderRadius: '15px' }}
                    >
                      BẮT ĐẦU CHAT VỚI LỄ TÂN
                    </button>
                    
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      Nếu muốn xử lý các yêu cầu chuyên sâu liên quan đến đơn đặt phòng cá nhân (đổi ngày, hủy phòng, hoàn tiền), vui lòng đăng nhập.
                    </p>
                    <Link to="/login" onClick={() => setIsOpen(false)} style={{ display: 'block', textDecoration: 'none', color: 'var(--gold)', fontWeight: '800', fontSize: '14px' }}>
                      ĐĂNG NHẬP NGAY <i className="fas fa-sign-in-alt"></i>
                    </Link>
                  </div>
                ) : (
                  
                  /* Logged-in Customer Conversation Lobby */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', height: '100%' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '800', fontFamily: '"Playfair Display", serif', color: 'var(--gold)' }}>
                         Trợ giúp khách hàng
                      </h4>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                         Hi, {user.fullName}
                      </span>
                    </div>

                    {/* New Chat Form */}
                    <form onSubmit={handleStartChat} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.2)', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gold)', letterSpacing: '1px' }}>
                        TẠO YÊU CẦU HỖ TRỢ MỚI
                      </span>
                      
                      <div>
                        <select 
                          value={selectedBookingId} 
                          onChange={e => setSelectedBookingId(e.target.value)}
                          style={{ width: '100%', padding: '12px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', outline: 'none' }}
                        >
                          <option value="">-- Liên kết Đơn đặt phòng (Không bắt buộc) --</option>
                          {myBookings.map(b => (
                            <option key={b.id} value={b.id}>
                              Mã đơn: {b.booking_code} ({b.room_type_name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <input 
                          required 
                          type="text" 
                          placeholder="Mô tả ngắn gọn vấn đề (Ví dụ: Hỏi đổi ngày...)" 
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          style={{ width: '100%', padding: '12px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', outline: 'none' }} 
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-gold" 
                        style={{ padding: '12px', width: '100%', justifyContent: 'center', borderRadius: '12px', fontSize: '12px' }}
                      >
                        {loading ? 'Đang khởi tạo...' : 'GỬI YÊU CẦU & BẮT ĐẦU CHAT'}
                      </button>
                    </form>

                    {/* Chat History List */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
                        YÊU CẦU GẦN ĐÂY CỦA BẠN
                      </span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                        {conversations.length > 0 ? (
                          conversations.map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => setActiveConv(c)}
                              style={{ 
                                padding: '15px', 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '14px', 
                                cursor: 'pointer',
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                transition: '0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{c.subject}</div>
                                {c.booking_code && (
                                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                    Đơn đặt phòng: {c.booking_code}
                                  </div>
                                )}
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                  Cập nhật: {new Date(c.updated_at).toLocaleDateString()}
                                </div>
                              </div>
                              <span style={{ 
                                fontSize: '8px', fontWeight: '800', 
                                color: getStatusLabel(c.status).color, 
                                padding: '3px 8px', borderRadius: '50px', 
                                background: `${getStatusLabel(c.status).color}15`,
                                border: `1px solid ${getStatusLabel(c.status).color}40`
                              }}>
                                {getStatusLabel(c.status).text}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                             Bạn chưa tạo yêu cầu hỗ trợ nào.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
