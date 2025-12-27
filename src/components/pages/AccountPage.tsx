import { Helmet } from 'react-helmet-async';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function AccountPage() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>{isLogin ? 'Connexion' : 'Inscription'} | Le Monde d'Elya</title>
            </Helmet>

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-pastel-pink/20">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold font-cursive text-gray-900">
                        {isLogin ? 'Bon retour parmi nous ! 👋' : 'Rejoignez la famille ! 🦄'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isLogin ? 'Connectez-vous pour accéder à vos commandes' : 'Créez un compte pour suivre vos achats'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {!isLogin && (
                            <div className="mb-4">
                                <label htmlFor="name" className="sr-only">Nom complet</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <User size={20} />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Votre nom magique"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="email-address" className="sr-only">Adresse email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Adresse email"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Mot de passe secret"
                                />
                            </div>
                        </div>
                    </div>

                    {isLogin && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Se souvenir de moi
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-secondary">
                                    Mot de passe oublié ?
                                </a>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg transform transition hover:-translate-y-0.5"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <ArrowRight size={20} className="text-pastel-pink group-hover:text-white transition-colors" />
                            </span>
                            {isLogin ? 'Ouvrir mon compte' : 'Créer mon compte'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        {isLogin ? "Pas encore de compte ?" : "Déjà membre ?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-bold text-secondary hover:text-primary ml-1 transition-colors"
                        >
                            {isLogin ? "Créer un compte" : "Se connecter"}
                        </button>
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <Link to="/" className="text-sm text-gray-500 hover:text-primary">
                        ← Retour à la boutique
                    </Link>
                </div>
            </div>
        </div>
    );
}
