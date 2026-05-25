import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export default function AdminSupportPage() {
  // Mode selection: 'tickets' (Support Tickets) or 'chat' (Live Chat)
  const [mode, setMode] = useState('tickets');

  // --- LIVE CHAT STATE & FUNCTIONS ---
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeData, setActiveData] = useState(null); // { conversation, messages }
  const [loadingList, setLoadingList] = useState(true);
  const [loadingActive, setLoadingActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);

  // --- SUPPORT TICKETS STATE & FUNCTIONS ---
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL');
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Reset pagination when search query changes
  useEffect(() => {
    setVisibleCount(10);
    setIsScrollingLoading(false);
  }, [searchTerm]);

  // Load initial data and setup refresh intervals
  useEffect(() => {
    loadConversations();
    loadTickets();
    // Refresh lists every 8 seconds
    const listInterval = setInterval(() => {
      loadConversations();
      loadTickets();
    }, 8000);
    return () => clearInterval(listInterval);
  }, []);

  // Poll active conversation messages every 3 seconds
  useEffect(() => {
    if (activeId && mode === 'chat') {
      loadConversationDetail(activeId);
      
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        loadConversationDetail(activeId, true);
      }, 3000);
    } else {
      setActiveData(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeId, mode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeData?.messages]);

  // Sync selected ticket reply input
  useEffect(() => {
    if (selectedTicket) {
      setTicketReply(selectedTicket.response || '');
    } else {
      setTicketReply('');
    }
  }, [selectedTicket?.id]);

  const loadConversations = async () => {
    try {
      const data = await api('/chat/admin/conversations');
      setConversations(data);
    } catch (error) {
      console.error('Failed to load admin conversations:', error);
    } finally {
      setLoadingList(false);
    }
  };

  const loadTickets = async () => {
    try {
      const data = await api('/admin/support');
      setTickets(data);
      // Keep selected ticket updated if it is currently selected
      if (selectedTicket) {
        const updated = data.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadConversationDetail = async (id, isPoll = false) => {
    try {
      if (!isPoll) setLoadingActive(true);
      const data = await api(`/chat/admin/conversations/${id}`);
      
      if (!isPoll || !activeData || data.messages.length !== activeData.messages.length || data.conversation.status !== activeData.conversation.status) {
        setActiveData(data);
      }
    } catch (error) {
      console.error('Failed to load conversation details:', error);
    } finally {
      if (!isPoll) setLoadingActive(false);
    }
  };

  const handleClaim = async () => {
    if (!activeId) return;
    try {
      await api(`/chat/admin/conversations/${activeId}/assign`, { method: 'PATCH' });
      loadConversationDetail(activeId);
      loadConversations();
    } catch (error) {
      alert('Không nhận xử lý được: ' + error.message);
    }
  };

  const handleCloseChat = async () => {
    if (!activeId) return;
    if (!window.confirm('Bạn muốn đóng cuộc trò chuyện này chứ?')) return;
    try {
      await api(`/chat/admin/conversations/${activeId}/close`, { method: 'PATCH' });
      loadConversationDetail(activeId);
      loadConversations();
    } catch (error) {
      alert('Không thể đóng: ' + error.message);
    }
  };

  const handleTransferAdmin = async () => {
    if (!activeId) return;
    if (!window.confirm('Chuyển cuộc trò chuyện này lên Admin cấp cao giải quyết?')) return;
    try {
      await api(`/chat/admin/conversations/${activeId}/status`, { 
        method: 'PATCH',
        body: { status: 'TRANSFER_ADMIN' }
      });
      loadConversationDetail(activeId);
      loadConversations();
    } catch (error) {
      alert('Không chuyển được: ' + error.message);
    }
  };

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyInput.trim() || !activeId) return;

    try {
      const sentMsg = await api(`/chat/admin/conversations/${activeId}/messages`, {
        method: 'POST',
        body: { messageContent: replyInput }
      });

      setReplyInput('');
      setActiveData(prev => ({
        ...prev,
        messages: [...prev.messages, sentMsg],
        conversation: { ...prev.conversation, status: 'RESPONDED' }
      }));
      loadConversations();
    } catch (error) {
      alert('Không gửi được phản hồi: ' + error.message);
    }
  };

  const handleUpdateTicket = async (ticketId, nextStatus, responseText) => {
    try {
      await api(`/admin/support/${ticketId}/status`, {
        method: 'PUT',
        body: { status: nextStatus, response: responseText }
      });
      alert('Cập nhật trạng thái và phản hồi thành công!');
      loadTickets();
    } catch (error) {
      alert('Lỗi cập nhật yêu cầu hỗ trợ: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WAITING': return { text: 'ĐANG CHỜ', color: '#ef4444', bg: '#fee2e2' };
      case 'PROCESSING': return { text: 'ĐANG XỬ LÝ', color: '#D4AF37', bg: '#fef9c3' };
      case 'RESPONDED': return { text: 'ĐÃ PHẢN HỒI', color: '#10b981', bg: '#d1fae5' };
      case 'CLOSED': return { text: 'ĐÃ ĐÓNG', color: '#64748b', bg: '#f1f5f9' };
      case 'TRANSFER_ADMIN': return { text: 'CHUYỂN ADMIN', color: '#8b5cf6', bg: '#ede9fe' };
      default: return { text: 'HOẠT ĐỘNG', color: 'var(--gold)', bg: '#fffbeb' };
    }
  };

  const getTicketStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return { text: 'CHỜ XỬ LÝ', color: '#ef4444', bg: '#fee2e2' };
      case 'PENDING': return { text: 'ĐANG XỬ LÝ', color: '#D4AF37', bg: '#fef9c3' };
      case 'CLOSED': return { text: 'ĐÃ GIẢI QUYẾT', color: '#10b981', bg: '#d1fae5' };
      default: return { text: 'HỖ TRỢ', color: 'var(--gold)', bg: '#fffbeb' };
    }
  };

  const filteredConversations = conversations.filter(c => {
    const name = c.customer_name || 'Khách vãng lai';
    const email = c.customer_email || '';
    const subject = c.subject || '';
    const search = searchTerm.toLowerCase();
    return name.toLowerCase().includes(search) || 
           email.toLowerCase().includes(search) || 
           subject.toLowerCase().includes(search);
  });

  const filteredTickets = tickets.filter(t => {
    const statusMatch = ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
    const name = t.customer_name || '';
    const email = t.email || '';
    const subject = t.subject || '';
    const msg = t.message || '';
    const search = ticketSearchTerm.toLowerCase();
    const searchMatch = name.toLowerCase().includes(search) || 
                        email.toLowerCase().includes(search) || 
                        subject.toLowerCase().includes(search) ||
                        msg.toLowerCase().includes(search);
    return statusMatch && searchMatch;
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px', 
      height: 'calc(100vh - 150px)',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. TOP TAB NAVIGATION BAR */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: '16px 30px',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-premium)',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => setMode('tickets')}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              border: mode === 'tickets' ? 'none' : '1px solid #e2e8f0',
              background: mode === 'tickets' ? 'linear-gradient(135deg, #0a0f1d 0%, #1a233d 100%)' : '#fff',
              color: mode === 'tickets' ? 'var(--gold)' : '#64748b',
              fontWeight: '800',
              fontSize: '13px',
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: mode === 'tickets' ? '0 4px 15px rgba(10,15,29,0.2)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-ticket-alt" style={{ marginRight: '8px' }}></i> YÊU CẦU HỖ TRỢ ({tickets.filter(t => t.status !== 'CLOSED').length})
          </button>
          <button 
            onClick={() => setMode('chat')}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              border: mode === 'chat' ? 'none' : '1px solid #e2e8f0',
              background: mode === 'chat' ? 'linear-gradient(135deg, #0a0f1d 0%, #1a233d 100%)' : '#fff',
              color: mode === 'chat' ? 'var(--gold)' : '#64748b',
              fontWeight: '800',
              fontSize: '13px',
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: mode === 'chat' ? '0 4px 15px rgba(10,15,29,0.2)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-comments" style={{ marginRight: '8px' }}></i> HỘP THƯ LIVE CHAT ({conversations.filter(c => c.status === 'WAITING').length})
          </button>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
          Trạng thái hoạt động: <span style={{ color: '#10b981', fontWeight: '800' }}>● ONLINE</span>
        </div>
      </div>

      {/* 2. CHAT MODE CONTENT */}
      {mode === 'chat' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '320px 1fr 320px', 
          gap: '24px', 
          flex: 1,
          minHeight: 0
        }}>
          
          {/* 2.1 LEFT PANEL: INBOX LIST */}
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '24px', 
            boxShadow: 'var(--shadow-premium)', 
            border: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', 
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>Hộp thư hỗ trợ</h3>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input 
                  type="text" 
                  placeholder="Tìm khách hàng hoặc chủ đề..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            <div 
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop - clientHeight < 50) {
                  if (!isScrollingLoading && visibleCount < filteredConversations.length) {
                    setIsScrollingLoading(true);
                    setTimeout(() => {
                      setVisibleCount(prev => prev + 10);
                      setIsScrollingLoading(false);
                    }, 800);
                  }
                }
              }}
              style={{ flex: 1, overflowY: 'auto', padding: '15px' }}
            >
              {loadingList ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} style={{ padding: '16px', borderRadius: '16px', marginBottom: '8px', border: '1px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div className="skeleton-pulse" style={{ width: '100px', height: '14px' }}></div>
                      <div className="skeleton-pulse" style={{ width: '60px', height: '14px', borderRadius: '50px' }}></div>
                    </div>
                    <div className="skeleton-pulse" style={{ width: '160px', height: '14px', marginBottom: '6px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '80px', height: '12px' }}></div>
                  </div>
                ))
              ) : filteredConversations.length > 0 ? (
                <>
                  {filteredConversations.slice(0, visibleCount).map(c => {
                    const isActive = c.id === activeId;
                    const badge = getStatusBadge(c.status);
                    return (
                      <div 
                        key={c.id}
                        onClick={() => setActiveId(c.id)}
                        style={{ 
                          padding: '16px', 
                          borderRadius: '16px', 
                          cursor: 'pointer', 
                          backgroundColor: isActive ? 'rgba(212,175,55,0.08)' : 'transparent',
                          border: isActive ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
                          marginBottom: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { if(!isActive) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                        onMouseLeave={e => { if(!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14.5px' }}>
                            {c.customer_name || 'Khách vãng lai'}
                          </div>
                          <span style={{ fontSize: '8px', fontWeight: '800', color: badge.color, backgroundColor: badge.bg, padding: '3px 8px', borderRadius: '50px' }}>
                            {badge.text}
                          </span>
                        </div>

                        <div style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: '700', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.subject}
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                          {c.last_message || 'Chưa có cuộc trò chuyện.'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8' }}>
                          <span>NV: {c.staff_name || 'Chưa nhận'}</span>
                          <span>{c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                  {isScrollingLoading && (
                    Array.from({ length: 2 }).map((_, idx) => (
                      <div key={idx} style={{ padding: '16px', borderRadius: '16px', marginBottom: '8px', border: '1px solid transparent' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div className="skeleton-pulse" style={{ width: '100px', height: '14px' }}></div>
                          <div className="skeleton-pulse" style={{ width: '60px', height: '14px', borderRadius: '50px' }}></div>
                        </div>
                        <div className="skeleton-pulse" style={{ width: '160px', height: '14px', marginBottom: '6px' }}></div>
                        <div className="skeleton-pulse" style={{ width: '80px', height: '12px' }}></div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontSize: '13px' }}>Không có cuộc hội thoại nào.</div>
              )}
            </div>
          </div>

          {/* 2.2 MIDDLE PANEL: ACTIVE MESSAGE DISPLAY */}
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '24px', 
            boxShadow: 'var(--shadow-premium)', 
            border: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', 
            overflow: 'hidden'
          }}>
            {activeData ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Active Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', fontFamily: '"Playfair Display", serif' }}>
                       {activeData.conversation.customer_name || 'Khách vãng lai'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {activeData.conversation.customer_email || 'Chưa xác minh danh tính (Khách vãng lai)'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {activeData.conversation.status === 'WAITING' && (
                      <button onClick={handleClaim} className="btn-gold" style={{ padding: '10px 20px', fontSize: '11px', borderRadius: '10px' }}>
                        <i className="fas fa-hand-holding-heart"></i> NHẬN HỖ TRỢ
                      </button>
                    )}
                    {activeData.conversation.status !== 'CLOSED' && (
                      <>
                        <button onClick={handleTransferAdmin} style={{ padding: '10px 15px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                          <i className="fas fa-user-shield"></i> CHUYỂN ADMIN
                        </button>
                        <button onClick={handleCloseChat} style={{ padding: '10px 15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                          <i className="fas fa-door-closed"></i> ĐÓNG CHAT
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Chat Messages */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeData.messages.map(msg => {
                    const isAgent = msg.sender_role === 'STAFF' || msg.sender_role === 'ADMIN';
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isAgent ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '75%', padding: '12px 18px', borderRadius: '16px', fontSize: '13.5px', lineHeight: '1.5',
                          backgroundColor: isAgent ? '#0a0f1d' : '#fff',
                          color: isAgent ? '#fff' : '#0f172a',
                          border: isAgent ? 'none' : '1px solid #e2e8f0',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                          borderBottomRightRadius: isAgent ? '4px' : '16px',
                          borderBottomLeftRadius: !isAgent ? '4px' : '16px',
                        }}>
                          {msg.message_content}
                          <div style={{ fontSize: '9px', opacity: 0.7, textAlign: 'right', marginTop: '6px', color: isAgent ? 'rgba(255, 255, 255, 0.6)' : '#64748b' }}>
                            {isAgent ? 'Bạn' : (msg.sender_role === 'GUEST' ? 'Khách vãng lai' : 'Khách hàng')} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Admin Input Reply */}
                {activeData.conversation.status !== 'CLOSED' ? (
                  <form onSubmit={handleSendReply} style={{ padding: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
                    <input 
                      type="text" 
                      placeholder="Gửi câu trả lời đến khách hàng..."
                      value={replyInput}
                      onChange={e => setReplyInput(e.target.value)}
                      style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                    />
                    <button type="submit" className="btn-gold" style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '13px' }}>
                      GỬI PHẢN HỒI
                    </button>
                  </form>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '13px', fontWeight: '700' }}>
                     <i className="fas fa-lock" style={{ marginRight: '8px' }}></i> Cuộc hội thoại này đã đóng.
                  </div>
                )}

              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
                <i className="far fa-comments" style={{ fontSize: '70px', color: 'var(--gold)', opacity: 0.3, marginBottom: '20px' }}></i>
                <h4 className="serif" style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)' }}>Phòng điều hành Live Support</h4>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>Chọn một cuộc trò chuyện ở danh mục bên trái để bắt đầu tương tác hỗ trợ.</p>
              </div>
            )}
          </div>

          {/* 2.3 RIGHT PANEL: CUSTOMER PROFILE & DETAIL */}
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '24px', 
            boxShadow: 'var(--shadow-premium)', 
            border: '1px solid #f1f5f9',
            padding: '24px',
            display: 'flex', flexDirection: 'column', 
            overflowY: 'auto'
          }}>
            {activeData && activeData.conversation.customer_id ? (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', borderBottom: '2px solid var(--gold)', paddingBottom: '10px', marginBottom: '20px' }}>
                   Hồ sơ khách hàng
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Họ tên:</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{activeData.conversation.customer_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{activeData.conversation.customer_email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Số điện thoại:</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{activeData.conversation.customer_phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                {activeData.conversation.booking_code ? (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', borderBottom: '2px solid var(--gold)', paddingBottom: '10px', marginBottom: '20px' }}>
                       Chi tiết Đơn đặt phòng liên kết
                    </h3>
                    
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px dashed rgba(212,175,55,0.4)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                        <span style={{ color: '#64748b' }}>Mã đơn hàng:</span>
                        <span style={{ fontWeight: '900', color: 'var(--primary)' }}>{activeData.conversation.booking_code}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                        <span style={{ color: '#64748b' }}>Nhận phòng:</span>
                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{new Date(activeData.conversation.check_in_date).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                        <span style={{ color: '#64748b' }}>Trả phòng:</span>
                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{new Date(activeData.conversation.check_out_date).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                        <span style={{ color: '#64748b' }}>Tổng số tiền:</span>
                        <span style={{ fontWeight: '900', color: 'var(--gold)' }}>{Number(activeData.conversation.booking_amount).toLocaleString()} đ</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                        <span style={{ color: '#64748b' }}>Trạng thái:</span>
                        <span style={{ fontWeight: '800', color: activeData.conversation.booking_status === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>
                          {activeData.conversation.booking_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0', color: '#94a3b8', fontSize: '12.5px' }}>
                     Yêu cầu này chưa liên kết với đơn đặt phòng cụ thể nào.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8', fontSize: '13px' }}>
                {activeData ? 'Khách vãng lai chưa lưu trữ thông tin tài khoản.' : 'Chưa có thông tin kiểm duyệt.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUPPORT TICKETS MODE CONTENT */}
      {mode === 'tickets' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '380px 1fr', 
          gap: '24px', 
          flex: 1,
          minHeight: 0
        }}>
          
          {/* 3.1 LEFT PANEL: TICKETS LIST */}
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '24px', 
            boxShadow: 'var(--shadow-premium)', 
            border: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', 
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>
                Yêu cầu từ khách hàng
              </h3>
              
              <div style={{ position: 'relative', marginBottom: '15px' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input 
                  type="text" 
                  placeholder="Tìm chủ đề, nội dung, khách hàng..." 
                  value={ticketSearchTerm}
                  onChange={e => setTicketSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
                />
              </div>

              {/* Status filter tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '5px' }}>
                {['ALL', 'OPEN', 'PENDING', 'CLOSED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setTicketStatusFilter(status)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      backgroundColor: ticketStatusFilter === status ? '#0a0f1d' : '#f1f5f9',
                      color: ticketStatusFilter === status ? 'var(--gold)' : '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    {status === 'ALL' && 'TẤT CẢ'}
                    {status === 'OPEN' && 'CHỜ XỬ LÝ'}
                    {status === 'PENDING' && 'ĐANG XỬ LÝ'}
                    {status === 'CLOSED' && 'ĐÃ GIẢI QUYẾT'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
              {ticketsLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} style={{ padding: '16px', borderRadius: '16px', marginBottom: '10px', background: '#f8fafc', height: '80px' }} className="skeleton-pulse"></div>
                ))
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map(t => {
                  const isActive = selectedTicket?.id === t.id;
                  const badge = getTicketStatusBadge(t.status);
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      style={{
                        padding: '18px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        backgroundColor: isActive ? 'rgba(212,175,55,0.08)' : '#fff',
                        border: isActive ? '1px solid rgba(212,175,55,0.3)' : '1px solid #f1f5f9',
                        marginBottom: '10px',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? 'none' : '0 4px 10px rgba(0,0,0,0.01)'
                      }}
                      onMouseEnter={e => { if(!isActive) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={e => { if(!isActive) e.currentTarget.style.backgroundColor = '#fff'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '900', color: badge.color, backgroundColor: badge.bg, padding: '4px 10px', borderRadius: '50px' }}>
                          {badge.text}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                          #{t.id}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                        {t.subject}
                      </h4>

                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                        {t.message}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: '600', borderTop: '1px solid #f8fafc', paddingTop: '8px' }}>
                        <span style={{ color: 'var(--primary)' }}>{t.customer_name}</span>
                        <span>{new Date(t.create_date).toLocaleDateString()}</span>
                      </div>

                      {t.response && (
                        <div style={{ marginTop: '8px', fontSize: '10px', color: '#10b981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <i className="fas fa-check-circle"></i> ĐÃ CÓ PHẢN HỒI từ khách sạn
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: '13px' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.3 }}></i>
                  <div>Không tìm thấy yêu cầu hỗ trợ nào.</div>
                </div>
              )}
            </div>
          </div>

          {/* 3.2 RIGHT PANEL: DETAILED TICKET & DISPOSITION */}
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '24px', 
            boxShadow: 'var(--shadow-premium)', 
            border: '1px solid #f1f5f9',
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {selectedTicket ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Detail Header */}
                <div style={{ padding: '24px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafbfd' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>Mã số yêu cầu: #{selectedTicket.id}</span>
                      <span style={{ fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '50px', backgroundColor: getTicketStatusBadge(selectedTicket.status).bg, color: getTicketStatusBadge(selectedTicket.status).color }}>
                        {getTicketStatusBadge(selectedTicket.status).text}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)', fontFamily: '"Playfair Display", serif', margin: 0 }}>
                      {selectedTicket.subject}
                    </h2>
                  </div>

                  <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'right', fontWeight: '600' }}>
                    <div>Gửi lúc:</div>
                    <div style={{ color: 'var(--primary)', marginTop: '2px' }}>
                      {new Date(selectedTicket.create_date).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                {/* Detail Scrollable Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
                  
                  {/* Customer Identity Card */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                      Thông tin khách hàng
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Họ tên khách: </span>
                        <strong style={{ color: 'var(--primary)' }}>{selectedTicket.customer_name}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Địa chỉ email: </span>
                        <strong style={{ color: 'var(--primary)' }}>{selectedTicket.email}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                      Nội dung yêu cầu từ khách
                    </h4>
                    <div style={{ backgroundColor: 'rgba(212,175,55,0.05)', borderLeft: '4px solid var(--gold)', padding: '20px', borderRadius: '0 16px 16px 0', fontSize: '14.5px', lineHeight: '1.6', color: '#0f172a', whiteSpace: 'pre-wrap' }}>
                      {selectedTicket.message}
                    </div>
                  </div>

                  {/* Reply Action Card */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-reply" style={{ color: 'var(--gold)' }}></i> Câu trả lời & Cập nhật trạng thái
                    </h4>

                    <textarea
                      placeholder="Nhập nội dung phản hồi từ khách sạn gửi đến khách hàng..."
                      value={ticketReply}
                      onChange={e => setTicketReply(e.target.value)}
                      style={{
                        width: '100%',
                        height: '140px',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '20px',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                    />

                    {/* Action buttons list */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      <button
                        onClick={() => handleUpdateTicket(selectedTicket.id, 'PENDING', ticketReply)}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '12px',
                          border: 'none',
                          background: '#f59e0b',
                          color: '#fff',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                      >
                        <i className="fas fa-spinner"></i> ĐẶT LÀ MỚI / ĐANG XỬ LÝ
                      </button>

                      <button
                        onClick={() => handleUpdateTicket(selectedTicket.id, 'CLOSED', ticketReply)}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '12px',
                          border: 'none',
                          background: '#10b981',
                          color: '#fff',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                      >
                        <i className="fas fa-check-double"></i> GIẢI QUYẾT & ĐÓNG YÊU CẦU
                      </button>

                      <button
                        onClick={() => handleUpdateTicket(selectedTicket.id, 'OPEN', ticketReply)}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '12px',
                          border: '1px solid #ef4444',
                          background: 'transparent',
                          color: '#ef4444',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <i className="fas fa-folder-open"></i> CHUYỂN VỀ CHỜ XỬ LÝ
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', padding: '40px' }}>
                <i className="fas fa-ticket-alt" style={{ fontSize: '80px', color: 'var(--gold)', opacity: 0.2, marginBottom: '24px' }}></i>
                <h4 className="serif" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>
                  Bảng kiểm soát Yêu cầu Hỗ trợ
                </h4>
                <p style={{ fontSize: '14px', marginTop: '10px', color: '#64748b' }}>
                  Vui lòng chọn một yêu cầu của khách hàng từ danh sách bên trái để phản hồi và cập nhật tiến độ xử lý.
                </p>
              </div>
            )}
          </div>
          
        </div>
      )}

    </div>
  );
}
