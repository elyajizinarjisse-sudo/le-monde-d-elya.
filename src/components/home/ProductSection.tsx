import { type Product, ProductCard } from './ProductCard';
import { ChevronRight } from 'lucide-react';

interface ProductSectionProps {
    title: string;
    products: Product[];
}

export function ProductSection({ title, products }: ProductSectionProps) {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight font-cursive">{title}</h2>
                <a href="#" className="text-sm font-bold text-primary flex items-center hover:text-secondary transition-colors">
                    Voir tout <ChevronRight size={16} />
                </a>
            </div>

            {/* Scrollable Container (Horizontal on mobile, wrapping grid on desktop if needed, or simple flex) */}
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
                {products.map((product) => (
                    <div key={product.id} className="snap-start">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
