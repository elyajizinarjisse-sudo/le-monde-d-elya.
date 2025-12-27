import { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, Mail, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function SupportModule() {
    const [activeTab, setActiveTab] = useState<'inbox' | 'faq'>('inbox');
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        fetchTickets();

        // Subscribe to new tickets
        const channel = supabase
            .channel('support_tickets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
                fetchTickets();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTickets = async () => {
        const { data } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setTickets(data);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        await supabase.from('support_tickets').update({ status: newStatus }).eq('id', id);
        fetchTickets(); // Optimistic update would be better but this is fine
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Service Client</h2>
                        <p className="text-pink-100">Gérez vos tickets et votre base de connaissances</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'inbox' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Mail size={16} /> Boîte de Réception ({tickets.filter(t => t.status === 'new').length})
                </button>
                <button
                    onClick={() => setActiveTab('faq')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'faq' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <HelpCircle size={16} /> FAQ & Aide
                </button>
            </div>

            {/* Inbox Content */}
            {activeTab === 'inbox' && (
                <div className="space-y-4 animate-fade-in">
                    {tickets.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                            <Mail size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Aucun message pour le moment.</p>
                        </div>
                    )}
                    {tickets.map(msg => (
                        <div
                            key={msg.id}
                            onClick={() => handleStatusUpdate(msg.id, msg.status === 'new' ? 'read' : 'new')}
                            className={`bg-white p-4 rounded-xl border cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between ${msg.status === 'new' ? 'border-pink-200 bg-pink-50' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${msg.status === 'closed' ? 'bg-gray-400' : 'bg-pink-500'}`}>
                                    {msg.user_name ? msg.user_name.charAt(0) : '?'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-bold text-gray-900 ${msg.status === 'new' ? '' : 'font-medium'}`}>{msg.user_name}</h4>
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{msg.user_email}</span>
                                        {msg.status === 'new' && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-bold">Nouveau</span>}
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">{msg.subject}</p>
                                    <p className="text-sm text-gray-500 line-clamp-1">{msg.message}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">{new Date(msg.created_at).toLocaleDateString()}</p>
                                {msg.status === 'closed' ? <CheckCircle size={16} className="text-gray-400 ml-auto" /> : <Clock size={16} className="text-pink-400 ml-auto" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FAQ Content */}
            {activeTab === 'faq' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Questions Fréquentes (FAQ)</h3>
                        <button className="text-sm bg-pink-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-pink-600">
                            + Ajouter une question
                        </button>
                    </div>

                    <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200">
                        {[
                            { q: 'Quels sont les délais de livraison ?', a: 'Nos délais sont de 3 à 5 jours ouvrables pour le Québec.' },
                            { q: 'Puis-je retourner un article ?', a: 'Oui, vous avez 30 jours pour retourner un article non utilisé.' },
                            { q: 'Offrez-vous des cartes cadeaux ?', a: 'Absolument, disponibles en coupures de 25€, 50€ et 100€.' },
                        ].map((faq, i) => (
                            <div key={i} className="p-4 hover:bg-gray-50 group cursor-pointer">
                                <p className="font-medium text-gray-800 mb-1 flex items-center gap-2">
                                    <HelpCircle size={16} className="text-gray-400" />
                                    {faq.q}
                                </p>
                                <p className="text-sm text-gray-500 pl-6">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
