import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface HeroContent {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    overlayPosition: 'left' | 'center' | 'right';
    showOverlay: boolean;
}

const DEFAULT_CONTENT: HeroContent = {
    title: "Bienvenue !",
    subtitle: "Plongez dans le monde magique d'Elya. Des histoires, des jeux et de la douceur pour petits et grands.",
    buttonText: "EXPLORER 🦄",
    buttonLink: "/category/jouets",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&h=900&fit=crop",
    overlayPosition: 'left',
    showOverlay: true
};

export function Hero() {
    const [content, setContent] = useState<HeroContent>(DEFAULT_CONTENT);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchContent();

        const channel = supabase
            .channel('hero_content_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'hero_content' },
                (payload) => {
                    if (payload.new) {
                        const newData = payload.new as any;
                        setContent({
                            title: newData.title,
                            subtitle: newData.subtitle,
                            buttonText: newData.button_text,
                            buttonLink: newData.button_link,
                            imageUrl: newData.image_url,
                            overlayPosition: newData.overlay_position,
                            showOverlay: newData.show_overlay
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchContent = async () => {
        try {
            const { data } = await supabase
                .from('hero_content')
                .select('*')
                .limit(1)
                .maybeSingle();

            if (data) {
                setContent({
                    title: data.title || DEFAULT_CONTENT.title,
                    subtitle: data.subtitle || DEFAULT_CONTENT.subtitle,
                    buttonText: data.button_text || DEFAULT_CONTENT.buttonText,
                    buttonLink: data.button_link || DEFAULT_CONTENT.buttonLink,
                    imageUrl: data.image_url || DEFAULT_CONTENT.imageUrl,
                    overlayPosition: data.overlay_position || DEFAULT_CONTENT.overlayPosition,
                    showOverlay: data.show_overlay !== undefined ? data.show_overlay : DEFAULT_CONTENT.showOverlay
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const HEADER_HEIGHT_MOBILE = "h-[350px]";
    const HEADER_HEIGHT_DESKTOP = "md:h-[450px]";

    if (isLoading) {
        return (
            <div className={`w-full ${HEADER_HEIGHT_MOBILE} ${HEADER_HEIGHT_DESKTOP} bg-gray-100 animate-pulse mb-8 md:mb-12 flex items-center justify-center`}>
                <div className="text-gray-300 font-cursive text-4xl">Chargement...</div>
            </div>
        );
    }

    return (
        <div className={`relative w-full ${HEADER_HEIGHT_MOBILE} ${HEADER_HEIGHT_DESKTOP} bg-pastel-yellow bg-opacity-20 mb-8 md:mb-12 overflow-hidden transition-all duration-500`}>
            {/* Background Image */}
            <img
                key={content.imageUrl} // Force reload on change
                src={content.imageUrl}
                alt={content.title}
                className="w-full h-full object-cover opacity-90 animate-in fade-in duration-700"
                fetchPriority="high"
            />

            {/* Content Overlay */}
            {content.showOverlay && (
                <div className={`absolute inset-0 bg-white/30 flex items-center ${content.overlayPosition === 'left' ? 'justify-start md:pl-16' : content.overlayPosition === 'center' ? 'justify-center' : 'justify-end md:pr-16'}`}>
                    <div className="bg-white p-4 max-w-[280px] md:max-w-xs shadow-xl list-none rounded-xl border-2 border-pastel-pink transform rotate-1 transition-all hover:rotate-0 mx-4 animate-in slide-in-from-bottom-5 duration-700">
                        <h2 className="text-xl md:text-2xl font-bold text-primary mb-2 tracking-tight font-cursive">
                            {content.title}
                        </h2>
                        <p className="text-gray-600 mb-3 text-xs md:text-sm font-medium leading-relaxed">
                            {content.subtitle}
                        </p>
                        <Link to={content.buttonLink} className="bg-secondary text-white px-5 py-1.5 font-bold text-xs md:text-sm rounded-full hover:scale-105 transition-transform shadow-md border border-white inline-block">
                            {content.buttonText}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
