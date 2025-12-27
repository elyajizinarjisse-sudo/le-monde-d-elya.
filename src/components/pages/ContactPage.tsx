import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, Loader, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function ContactPage() {
    const [contactInfo, setContactInfo] = useState({
        email: 'support@lemondedelya.com',
        phone: '+1 (514) 123-4567',
        address: 'Montréal, Québec'
    });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from('store_settings').select('*');
        if (data) {
            const newInfo: any = {};
            data.forEach(item => {
                if (item.key === 'contact_email') newInfo.email = item.value;
                if (item.key === 'contact_phone') newInfo.phone = item.value;
                if (item.key === 'contact_address') newInfo.address = item.value;
            });
            setContactInfo(prev => ({ ...prev, ...newInfo }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const { error } = await supabase.from('support_tickets').insert([{
                user_name: `${formData.firstName} ${formData.lastName}`.trim(),
                user_email: formData.email,
                subject: 'Nouveau message du site',
                message: formData.message,
                status: 'new'
            }]);

            if (error) throw error;

            setSubmitStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', message: '' });
        } catch (error) {
            console.error('Error submitting ticket:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <Helmet>
                <title>Contactez-nous | Le Monde d'Elya</title>
                <meta name="description" content="Une question ? Besoin d'aide pour choisir un jeu ? Contactez notre équipe enchantée, nous sommes là pour vous !" />
            </Helmet>

            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-4xl font-bold font-cursive text-gray-800 mb-4">Contactez-nous 💌</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Une question sur un produit ? Besoin d'aide pour une commande ?
                    Ou simplement envie de nous dire bonjour ? Nous sommes là pour vous !
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {/* Contact Form */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-pastel-pink/20">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Send size={24} className="text-primary" />
                        Envoyez-nous un message
                    </h2>

                    {submitStatus === 'success' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4 animate-in fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-green-800">Message envoyé !</h3>
                            <p className="text-green-700">Merci de nous avoir contactés. Nous vous répondrons très bientôt.</p>
                            <button onClick={() => setSubmitStatus('idle')} className="text-sm font-medium text-green-600 hover:text-green-800 underline">
                                Envoyer un autre message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="votre@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    rows={5}
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Comment pouvons-nous vous aider ?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                            </button>
                            {submitStatus === 'error' && <p className="text-red-500 text-sm text-center">Une erreur est survenue. Veuillez réessayer.</p>}
                        </form>
                    )}
                </div>

                {/* Info & FAQ Link */}
                <div className="space-y-8">
                    <div className="bg-pastel-yellow/20 p-8 rounded-2xl border border-pastel-yellow/50">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Nos Coordonnées</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Email</p>
                                    <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">{contactInfo.email}</a>
                                    <p className="text-xs text-gray-400 mt-1">Réponse sous 24h</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Téléphone</p>
                                    <p className="text-gray-600">{contactInfo.phone}</p>
                                    <p className="text-xs text-gray-400 mt-1">Du Lundi au Vendredi, 9h-17h</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Adresse</p>
                                    <p className="text-gray-600">{contactInfo.address}</p>
                                    <p className="text-xs text-gray-400 mt-1">Bureau administratif uniquement</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-pastel-pink/10 p-8 rounded-2xl border border-pastel-pink/20 text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Questions Fréquentes</h3>
                        <p className="text-gray-600 mb-6">Vous trouverez peut-être votre réponse directement dans notre FAQ.</p>
                        <Link to="/faq" className="inline-block px-6 py-2 bg-white text-primary font-bold rounded-full border-2 border-primary hover:bg-primary hover:text-white transition-colors">
                            Consulter la FAQ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
