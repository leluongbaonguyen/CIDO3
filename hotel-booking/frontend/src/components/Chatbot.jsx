import { useState } from 'react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?' }
    ]);
    const [input, setInput] = useState('');

    const suggestions = [
        'Làm thế nào để đặt phòng?',
        'Khách sạn có dịch vụ đưa đón không?',
        'Chính sách hủy phòng là gì?'
    ];

    const sendMessage = (text) => {
        if (!text.trim()) return;
        
        // Add user message
        const newMessages = [...messages, { sender: 'user', text }];
        setMessages(newMessages);
        setInput('');

        // Simulate bot response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev, 
                { sender: 'bot', text: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ hỗ trợ bạn ngay lập tức.' }
            ]);
        }, 1000);
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            {!isOpen && (
                <div 
                    onClick={() => setIsOpen(true)}
                    style={{ 
                        width: '60px', height: '60px', backgroundColor: '#3b82f6', borderRadius: '50%', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', 
                        fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                    }}
                >
                    <i className="fas fa-comment-dots"></i>
                </div>
            )}

            {isOpen && (
                <div style={{ width: '350px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fas fa-robot"></i> XTRAVEL Chatbot
                        </div>
                        <i className="fas fa-times" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)}></i>
                    </div>

                    {/* Messages Area */}
                    <div style={{ padding: '16px', height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f9fafb' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ 
                                    maxWidth: '80%', padding: '10px 14px', borderRadius: '12px', fontSize: '14px',
                                    backgroundColor: msg.sender === 'user' ? '#3b82f6' : '#e5e7eb',
                                    color: msg.sender === 'user' ? 'white' : '#1f2937',
                                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : '12px',
                                    borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '12px'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Suggestions Area */}
                    <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid #f3f4f6', backgroundColor: '#ffffff' }}>
                        {suggestions.map((sug, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => sendMessage(sug)}
                                style={{ whiteSpace: 'nowrap', backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' }}
                            >
                                {sug}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div style={{ display: 'flex', padding: '12px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                        <input 
                            type="text" 
                            placeholder="Nhập tin nhắn..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                            style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '20px', padding: '10px 16px', outline: 'none', fontSize: '14px' }}
                        />
                        <button 
                            onClick={() => sendMessage(input)}
                            style={{ backgroundColor: 'transparent', border: 'none', color: '#3b82f6', fontSize: '20px', padding: '0 10px', cursor: 'pointer' }}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
