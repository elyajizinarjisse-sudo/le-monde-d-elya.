import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { ChatWidget } from '../home/ChatWidget';


export function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col font-sans relative">
            <CartDrawer />
            {/* <SeasonalEffects /> - Disabled for stability */}
            <Header />
            <main className="flex-1 bg-white">
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}
