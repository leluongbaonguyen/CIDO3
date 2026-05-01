import { useState } from 'react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! BOOKING X có thể giúp gì cho quý khách?' }
    ]);
    const [input, setInput] = useState('');

    const suggestions = [
        'Hạng phòng Penthouse?',
        'Dịch vụ đưa đón sân bay',
        'Chính sách thành viên'
    ];

    const sendMessage = (text) => {
        if (!text.trim()) return;
        const newMessages = [...messages, { sender: 'user', text }];
        setMessages(newMessages);
        setInput('');

        setTimeout(() => {
            setMessages((prev) => [
                ...prev, 
                { sender: 'bot', text: 'Cảm ơn quý khách. Yêu cầu của quý khách đang được chuyển đến bộ phận chăm sóc khách hàng.' }
            ]);
        }, 1000);
    };

    return (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000 }}>
            {!isOpen && (
                <div 
                    onClick={() => setIsOpen(true)}
                    style={{ 
                        width: '70px', height: '70px', background: 'var(--gradient-dark)', borderRadius: '22px', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent)', 
                        fontSize: '28px', cursor: 'pointer', boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                        transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <i className="fas fa-comment-alt"></i>
                </div>
            )}

            {isOpen && (
                <div className="glass-effect" style={{ width: '380px', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeInUp 0.4s ease-out' }}>
                    {/* Header */}
                    <div style={{ background: 'var(--gradient-dark)', color: 'white', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                               <i className="fas fa-robot"></i>
                            </div>
                            <span>BOOKING X AI ASSISTANT</span>
                        </div>
                        <i className="fas fa-times" style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setIsOpen(false)}></i>
                    </div>

                    {/* Messages Area */}
                    <div style={{ padding: '20px', height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'rgba(255,255,255,0.8)' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ 
                                    maxWidth: '85%', padding: '12px 18px', borderRadius: '18px', fontSize: '14px', lineHeight: '1.5',
                                    backgroundColor: msg.sender === 'user' ? 'var(--primary)' : '#fff',
                                    color: msg.sender === 'user' ? '#fff' : 'var(--text-main)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                                    borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '18px'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Suggestions */}
                    <div style={{ padding: '12px 20px', display: 'flex', gap: '10px', overflowX: 'auto', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                        {suggestions.map((sug, idx) => (
                            <button 
                                key={idx} onClick={() => sendMessage(sug)}
                                style={{ whiteSpace: 'nowrap', backgroundColor: '#f8fafc', color: 'var(--primary)', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '50px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                {sug}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ display: 'flex', padding: '20px', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                        <input 
                            type="text" placeholder="Gửi tin nhắn cho chúng tôi..." value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                            style={{ flex: 1, border: '1px solid #f1f5f9 !important', background: '#f8fafc !important', borderRadius: '15px !important', padding: '12px 20px !important', outline: 'none', fontSize: '14px' }}
                        />
                        <button 
                            onClick={() => sendMessage(input)}
                            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '20px', paddingLeft: '15px', cursor: 'pointer' }}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
