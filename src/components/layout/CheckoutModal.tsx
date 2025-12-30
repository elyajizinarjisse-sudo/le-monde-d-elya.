
import { useState } from 'react';
import { X, CreditCard, Lock, Loader2, MapPin, User, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { calculateCheckoutTotals } from '../../lib/checkout-logic';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROVINCES = [
    { code: 'QC', name: 'Québec' },
    { code: 'ON', name: 'Ontario' },
    { code: 'BC', name: 'Colombie-Britannique' },
    { code: 'AB', name: 'Alberta' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'Nouveau-Brunswick' },
    { code: 'NL', name: 'Terre-Neuve-et-Labrador' },
    { code: 'NS', name: 'Nouvelle-Écosse' },
    { code: 'PE', name: 'Île-du-Prince-Édouard' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'other', name: 'Autre (Taxes fédérales seulement)' }
];

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { items, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
    const [clientSecret, setClientSecret] = useState('');

    // Shipping State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        province: 'QC',
        zipCode: ''
    });

    // Calculate totals dynamically
    const totalWeight = items.reduce((acc, item) => acc + ((item.weight || 0) * item.quantity), 0);
    const totals = calculateCheckoutTotals(cartTotal, formData.province, totalWeight);



    if (!isOpen) return null;

    const handleShippingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Call backend to create PaymentIntent
        try {
            const response = await fetch('/.netlify/functions/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // IMPORTANT: We send the FINAL TOTAL (inc. tax/shipping) to Stripe
                body: JSON.stringify({ items, amount: totals.total }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Le backend de paiement n'est pas accessible. Veuillez déployer le site ou utiliser 'netlify dev'.");
                }
                throw new Error('Erreur lors de l\'initialisation du paiement');
            }

            const data = await response.json();
            setClientSecret(data.clientSecret);
            setStep('payment');
        } catch (error: any) {
            console.error('Error:', error);
            // DEV MODE FALLBACK
            if (import.meta.env.DEV && error.message.includes('backend de paiement n\'est pas accessible')) {
                alert("⚠️ Mode Développement : Backend introuvable.\n\nPassage direct à l'étape Paiement pour tester l'interface (PayPal).\n\nNOTE : Le paiement par Carte Bancaire (Stripe) ne fonctionnera pas sans le backend.");
                setStep('payment');
                return;
            }
            alert(error.message || "Une erreur est survenue");
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            // 1. Save Order to Supabase
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        customer_name: formData.fullName,
                        customer_email: formData.email,
                        shipping_address: `${formData.address}, ${formData.city} (${formData.province}) ${formData.zipCode}`,
                        total: totals.total, // Total Paid
                        status: 'processing',
                        items_count: items.reduce((acc, item) => acc + item.quantity, 0)
                    }
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Save Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                title: item.title,
                quantity: item.quantity,
                price_at_purchase: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            // 3. Send Confirmation Email (Async)
            fetch('/.netlify/functions/send-order-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    order: order,
                    items: items,
                    total: totals.total
                })
            }).catch(err => console.error('Failed to send confirmation email:', err));

            // 4. Clear Cart & Show Success
            clearCart();
            setStep('success');

        } catch (error) {
            console.error('Error saving order:', error);
            alert("Paiement réussi mais erreur lors de l'enregistrement de la commande. Contactez le support.");
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {step === 'success' ? <Lock className="text-green-600" /> : <CreditCard className="text-primary" />}
                        {step === 'shipping' ? 'Livraison' : step === 'payment' ? 'Paiement Sécurisé' : 'Commande Confirmée'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'shipping' && (
                        <form onSubmit={handleShippingSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                            <input
                                                required type="text" placeholder="Nom Complet"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                                value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                            <input
                                                required type="email" placeholder="Email"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <MapPin size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                            <input
                                                required type="text" placeholder="Adresse"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                                value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                required type="text" placeholder="Ville"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                                value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            />
                                            <input
                                                required type="text" placeholder="Code Postal"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                                value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Province Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province / Territoire</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                                        value={formData.province}
                                        onChange={e => setFormData({ ...formData, province: e.target.value })}
                                    >
                                        {PROVINCES.map(p => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Order Summary (Replacing Cart Total) */}
                                <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-blue-100">
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Sous-total</span>
                                        <span>{totals.subtotal.toFixed(2)} $</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Livraison {totals.shipping === 0 && <span className="text-green-600 font-bold">(OFFERTE)</span>}</span>
                                        <span>{totals.shipping.toFixed(2)} $</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Taxes ({totals.taxDetails?.name})</span>
                                        <span>{totals.tax.toFixed(2)} $</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg text-gray-900">
                                        <span>Total</span>
                                        <span>{totals.total.toFixed(2)} $</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                                <span className="text-xs text-gray-400">* Taxes calculées selon la province</span>
                                <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors shadow-lg shadow-primary/20">
                                    Payer {totals.total.toFixed(2)} $
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'payment' && (
                        <div className="space-y-6">
                            {/* Debug Container - Always Visible */}
                            <div className="w-full min-h-[150px] bg-gray-50 rounded-xl border-2 border-dashed border-red-300 p-4 relative">
                                <p className="absolute -top-3 left-4 bg-white px-2 text-xs text-red-500 font-bold">Zone PayPal</p>

                                <PayPalScriptProvider options={{
                                    clientId: "test", // FORCE TEST MODE to verify rendering
                                    currency: "CAD",
                                    components: "buttons",
                                }}>
                                    <PayPalButtons
                                        style={{ layout: "vertical", shape: "rect" }}
                                        forceReRender={[totals.total]}
                                        createOrder={(_data, actions) => {
                                            return actions.order.create({
                                                intent: "CAPTURE", // Fix TS Error
                                                purchase_units: [{
                                                    amount: {
                                                        currency_code: "CAD",
                                                        value: totals.total.toFixed(2)
                                                    }
                                                }]
                                            });
                                        }}
                                        onApprove={async (_data, actions) => {
                                            if (actions.order) {
                                                await actions.order.capture();
                                                handlePaymentSuccess();
                                            }
                                        }}
                                        onError={(err) => {
                                            console.error("PayPal Failed:", err);
                                            alert("Erreur PayPal: " + JSON.stringify(err));
                                        }}
                                    />
                                </PayPalScriptProvider>
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OU CARTE BANCAIRE</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            {/* Stripe Section */}
                            {clientSecret && (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <PaymentForm onSuccess={handlePaymentSuccess} amount={totals.total} />
                                </Elements>
                            )}
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-bounce">
                                <Lock size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Paiement Réussi !</h3>
                            <p className="text-gray-600">
                                Merci {formData.fullName}.<br />
                                Votre commande a été validée et payée.
                            </p>
                            <button onClick={onClose} className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
                                Retour à la boutique
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PaymentForm({ onSuccess, amount }: { onSuccess: () => void, amount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setErrorMessage('');

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || 'Paiement échoué');
            setLoading(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                    <X size={16} /> {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
                {loading ? <Loader2 className="animate-spin" /> : `Payer ${amount.toFixed(2)} $`}
            </button>

            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <Lock size={12} /> Paiement chiffré SSL via Stripe
            </p>
        </form>
    );
}
