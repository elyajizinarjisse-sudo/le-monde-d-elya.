import { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Bonjour ! Je suis l\'assistant virtuel du Monde d\'Elya. Comment puis-je vous aider ? 🧸' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        // Add user message
        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate bot response
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Ceci est une réponse automatique de démonstration. Je suis encore en formation ! 🎓"
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-primary hover:bg-opacity-90 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-10 fade-in">
                    {/* Header */}
                    <div className="bg-primary p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold">ElyaBot</h4>
                                <p className="text-xs text-white/80 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span> En ligne
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'bot' ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                                    {msg.sender === 'bot' ? <Bot size={16} /> : 'U'}
                                </div>
                                <div className={`p-3 rounded-2xl shadow-sm text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez votre question..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="p-2 bg-primary text-white rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
