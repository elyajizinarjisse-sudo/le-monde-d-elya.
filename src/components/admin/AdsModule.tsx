import { Target, TrendingUp, DollarSign, MousePointer, Eye, PauseCircle, PlayCircle, Plus } from 'lucide-react';

export function AdsModule() {

    const METRICS = [
        { label: 'Dépenses (30j)', value: '840.50 $', change: '+12%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Impressions', value: '45,230', change: '+24%', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Clics', value: '1,890', change: '+8%', icon: MousePointer, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'CTR Moyen', value: '4.18%', change: '+0.4%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    const CAMPAIGNS = [
        { id: 1, name: 'Collection Hiver - Search', platform: 'Google', status: 'active', spend: '245 $', clicks: 420, roas: '4.5' },
        { id: 2, name: 'Retargeting Panier', platform: 'Facebook', status: 'active', spend: '180 $', clicks: 310, roas: '6.2' },
        { id: 3, name: 'Nouveautés Jouets', platform: 'Instagram', status: 'paused', spend: '120 $', clicks: 180, roas: '2.8' },
        { id: 4, name: 'Notoriété Marque', platform: 'TikTok', status: 'active', spend: '295 $', clicks: 980, roas: '1.2' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Target size={120} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Ads Manager</h2>
                    <p className="text-purple-100 max-w-xl">Pilotez vos campagnes publicitaires sur toutes les plateformes depuis un seul endroit. Maximisez votre ROAS.</p>
                    <div className="flex gap-4 mt-6">
                        <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-purple-50 transition-colors flex items-center gap-2">
                            <Plus size={16} /> Nouvelle Campagne
                        </button>
                        <button className="bg-purple-700/50 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors backdrop-blur-sm">
                            Connecter un compte
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {METRICS.map((metric, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${metric.bg} ${metric.color}`}>
                                <metric.icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{metric.change}</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                    </div>
                ))}
            </div>

            {/* Campaign Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Campagnes Actives</h3>
                    <div className="flex gap-2">
                        <select className="text-sm border-gray-300 rounded-lg p-2 bg-gray-50">
                            <option>Toutes les plateformes</option>
                            <option>Google Ads</option>
                            <option>Meta (FB/Insta)</option>
                            <option>TikTok</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="p-4">Campagne</th>
                                <th className="p-4">Plateforme</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Dépenses</th>
                                <th className="p-4">Clics</th>
                                <th className="p-4">ROAS</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {CAMPAIGNS.map((camp) => (
                                <tr key={camp.id} className="hover:bg-gray-50 group">
                                    <td className="p-4 font-medium text-gray-800">{camp.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${camp.platform === 'Google' ? 'bg-blue-100 text-blue-700' :
                                            camp.platform === 'Facebook' ? 'bg-indigo-100 text-indigo-700' :
                                                camp.platform === 'Instagram' ? 'bg-pink-100 text-pink-700' :
                                                    'bg-black text-white'
                                            }`}>
                                            {camp.platform}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${camp.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <span className="capitalize text-gray-600">{camp.status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{camp.spend}</td>
                                    <td className="p-4 text-gray-600">{camp.clicks}</td>
                                    <td className="p-4 font-bold text-green-600">{camp.roas}x</td>
                                    <td className="p-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                            {camp.status === 'active' ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
